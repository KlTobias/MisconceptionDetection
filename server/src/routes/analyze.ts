import { Router } from "express";
import Ajv from "ajv";
import OpenAI from "openai";
import { readFile } from "fs/promises";
import { withLineNumbers, stripComments } from "../utils/codePreprocessors.ts";
import dotenv from "dotenv";
dotenv.config();

const router = Router();

router.post("/", async (req, res) => {
  const { code, mock, mockResponse } = req.body;
  if (!code && !mock)
    return res
      .status(400)
      .json({ error: "code is required (or set mock true)" });
  console.log("Received code for analysis:", code, "mock:", !!mock);

  try {
    // Allow using a mock response for local testing without calling the external API
    let data: any;
    if (mock) {
      // Use provided mockResponse (object or JSON string) or a built-in sample
      if (mockResponse) {
        data =
          typeof mockResponse === "string"
            ? JSON.parse(mockResponse)
            : mockResponse;
      } else {
        let sample_response =
          '{"findings":[{"id":"Array_Length_as_Number","lines":[8,16,26],"explanation":"Lines 8, 16, and 26 use a fixed number (10) in loop conditions while iterating over arrays position and speed, instead of using position.length or speed.length, matching the catalog’s indicator of hardcoding array lengths. The \'when_not_a_misconception\' cases do not apply because the fixed number is not for a specific unrelated purpose and no variable representing the arrays’ length is used."},{"id":"One_Loop_per_Array","lines":[8,9,10,11,12,16,17,18,19,20],"explanation":"Lines 8–12 initialize position and lines 16–20 initialize speed in separate loops, even though the arrays are the same length and logically connected (parallel arrays for positions and speeds). This matches the catalog’s description. The \'when_not_a_misconception\' cases do not apply because the arrays have the same length and the processing logic (initialization) is not fundamentally different."}]}';
        data = JSON.parse(sample_response);
      }
      console.log(
        "Using mock response for analysis:",
        JSON.stringify(data, null, 2)
      );
    } else {
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

      // Load misconceptions
      const misconception_catalog = JSON.parse(
        await readFile(
          "src/misconception_catalog/misconceptions_v5.json",
          "utf8"
        )
      );

      // Prepare allowed IDs for validation
      const allowedIds = Object.keys(misconception_catalog);

      // Developer prompt
      const developerText = `
        MISCONCEPTIONS CATALOG (JSON):
        ${JSON.stringify(misconception_catalog, null, 2)}

        Determine which misconceptions from the provided CATALOG are present in the given code snippet. For each identified misconception, provide the following details:
        - Misconception ID
        - One or more line numbers relevant to misconception
        - Explanation that references the relevant lines and the catalog

        RULES:
        - The code is line-numbered: "NNNN| ...". You MUST use those NNNN values in your output.
        - Explanation must confirm that the "when_not_a_misconception" case does NOT apply.
        `;

      // Helper to strip comments from code (simple regex-based)
      const preprocessedCode = withLineNumbers(stripComments(code));

      // Model call
      const response = await openai.responses.create({
        model: "gpt-5",
        input: [
          {
            role: "developer",
            content: [{ type: "input_text", text: developerText }],
          },
          {
            role: "user",
            content: [{ type: "input_text", text: preprocessedCode }],
          },
        ],
        text: {
          format: {
            type: "json_schema",
            strict: true,
            name: "misconception_findings",
            schema: {
              type: "object",
              additionalProperties: false,
              properties: {
                findings: {
                  type: "array",
                  items: {
                    type: "object",
                    additionalProperties: false,
                    properties: {
                      id: { type: "string", enum: allowedIds },
                      lines: {
                        type: "array",
                        items: { type: "integer", minimum: 1 },
                      },
                      explanation: { type: "string" },
                    },
                    required: ["id", "lines", "explanation"],
                  },
                },
              },
              required: ["findings"],
            },
          },
        },

        reasoning: { effort: "medium" },
        tools: [],
        store: true,
      });

      data = JSON.parse(response.output_text);
      console.log("raw model response:", JSON.stringify(data, null, 2));
    }

    // Helper: search recursively for an object that matches { findings: [...] }
    function deepFindFindings(obj: any): any | null {
      if (!obj || typeof obj !== "object") return null;
      if (Array.isArray(obj)) {
        for (const item of obj) {
          const res = deepFindFindings(item);
          if (res) return res;
        }
        return null;
      }

      if (obj.findings && Array.isArray(obj.findings)) return obj;

      for (const key of Object.keys(obj)) {
        try {
          const res = deepFindFindings((obj as any)[key]);
          if (res) return res;
        } catch (e) {
          // ignore
        }
      }
      return null;
    }

    // Try to find a parsed object in the structured response
    let parsed = deepFindFindings(data);

    // If nothing found, try to extract JSON from any textual output (handles non-strict models)
    if (!parsed) {
      const texts: string[] = [];
      if (Array.isArray(data.output)) {
        for (const outItem of data.output) {
          if (Array.isArray(outItem.content)) {
            for (const c of outItem.content) {
              if (typeof c === "string") texts.push(c);
              else if (typeof c?.text === "string") texts.push(c.text);
              else texts.push(JSON.stringify(c));
            }
          } else {
            texts.push(JSON.stringify(outItem));
          }
        }
      } else if (typeof data.output === "string") {
        texts.push(data.output);
      }

      const joined = texts.join("\n");
      // strip code fences and find first JSON object-looking substring
      const cleaned = joined.replace(/```(?:json)?\n?|```/g, "\n");
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          parsed = JSON.parse(jsonMatch[0]);
        } catch (err) {
          console.error("Failed to JSON.parse matched substring", err);
        }
      }
    }

    if (!parsed) {
      console.error("No usable JSON schema output found in model response");
      return res.status(500).json({
        error: "model response did not include expected JSON schema output",
      });
    }

    // Validate shape with Ajv
    const ajv = new Ajv({ allErrors: true });

    const schema = {
      type: "object",
      additionalProperties: false,
      properties: {
        findings: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            properties: {
              id: { type: "string" },
              lines: { type: "array", items: { type: "integer", minimum: 1 } },
              explanation: { type: "string" },
            },
            required: ["id", "lines", "explanation"],
          },
        },
      },
      required: ["findings"],
    };

    const validate = ajv.compile(schema);
    const ok = validate(parsed);
    if (!ok) {
      console.error("Validation failed:", validate.errors);
      return res.status(500).json({
        error: "model output failed validation",
        details: validate.errors,
      });
    }

    // Map to clean array of misconception objects to return to client
    const misconceptions = parsed.findings.map((f: any) => ({
      id: String(f.id),
      lines: Array.isArray(f.lines) ? f.lines.map((n: any) => Number(n)) : [],
      explanation: String(f.explanation),
    }));

    return res.json({ misconceptions });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "analysis failed" });
  }
});

export default router;
