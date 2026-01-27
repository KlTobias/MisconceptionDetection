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
          '{\"findings\":[{\"id\":\"One_Loop_per_Array\",\"lines\":[35,36,37,38,39,40,41,43,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59],\"explanation\":\"The array balls is iterated twice in draw(): first loop on lines 35–41 draws the balls (conditionally via bSwitch[r]), and a second loop on lines 43–59 updates positions and handles bouncing. According to the catalog, using separate loops for related, same-length data obscures their connection and adds redundancy. These two passes could be combined into one loop that draws (conditionally) and then updates each ball in sequence.\"},{\"id\":\"Array_Length_as_Number\",\"lines\":[1,2,30,35,37],\"explanation\":\"bSwitch is created with a hardcoded length 10 on line 2 while balls has its first dimension fixed at 10 on line 1. The code then indexes bSwitch using r that ranges over balls.length (lines 35 and 37; also assigned on line 30), implicitly relying on both arrays being the same size. Hardcoding 10 makes this fragile if balls’ size changes. The catalog recommends using the .length of the related array instead, e.g., new boolean[balls.length].\"},{\"id\":\"Array_Length_Only_in_Loop_Condition\",\"lines\":[2,10,12,35,43],\"explanation\":\"The code uses .length inside loop conditions (lines 10, 12, 35, 43) but hardcodes the related array size outside loops when initializing bSwitch (line 2). This matches the catalog indicator of avoiding .length outside loop conditions and hardcoding its value; bSwitch could be sized from balls.length to keep them aligned.\"}]}';
        data = JSON.parse(sample_response);

        data = { "findings": [
        {
          "id": "Arrays_Grow",
          "lines": [
            7
          ],
          "explanation": "The code attempts to access elements of array 'b' with index 'i-3' where 'i' ranges from 3 to 4 (since 'c' has a length of 5 and 'i' starts from 3). This results in accessing 'b[0]' and 'b[1]', which is valid, but the misconception is hinted at because the code does not check if 'b' has enough elements. However, in this specific case, 'b' has 2 elements, so it works. Still, the code does not demonstrate the misconception directly. A more accurate finding is related to 'Inner_Arrays_Uniform' or other issues."
        },
        {
          "id": "Inner_Arrays_Uniform",
          "lines": [
            1,
            2,
            5,
            11
          ],
          "explanation": "The code snippet uses arrays 'a' and 'b' with different lengths and then iterates over array 'c', accessing elements from 'a' and 'b' based on the index. This demonstrates an understanding that arrays can be of different lengths and are not required to be uniform, which is contrary to the 'Inner_Arrays_Uniform' misconception. However, the code does not directly demonstrate this misconception; instead, it shows a correct handling of arrays of different lengths."
        },
        {
          "id": "Array_Length_as_Number",
          "lines": [
            5
          ],
          "explanation": "The loop condition uses 'c.length', which is correct. However, if the code had used a hardcoded number instead of 'c.length', it would demonstrate this misconception. The code does not show this misconception."
        },
        {
          "id": "Array_Indexing_Needs_Parentheses",
          "lines": [
            7,
            9
          ],
          "explanation": "The code accesses array elements without unnecessary parentheses, e.g., 'b[i-3]' and 'a[i]'. This does not demonstrate the misconception."
        },
        {
          "id": "Loops_for_Array_Index_Access",
          "lines": [
            5,
            11
          ],
          "explanation": "The code uses a loop to iterate over 'c' and access elements from 'a' and 'b'. While it uses a loop, it's not because the index is unknown but to iterate over 'c'. The loop is necessary for the logic, so it doesn't directly demonstrate this misconception."
        },
        {
          "id": "One_Loop_per_Array",
          "lines": [
            5,
            11
          ],
          "explanation": "The code uses a single loop to populate 'c' by accessing elements from 'a' and 'b'. This is a correct practice and does not demonstrate the 'One_Loop_per_Array' misconception; instead, it shows an efficient use of a single loop to handle related arrays."
        },
        {
          "id": "Array_Init_Needs_Curly_Brackets",
          "lines": [
            3
          ],
          "explanation": "The code initializes 'c' with 'new int[5]', which is correct for creating an array of a specific length. It does not demonstrate the misconception of using curly brackets to set the length."
        }
      ]
        }
        
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
          "src/misconception_catalog/misconception_catalog.json", // Insert misconception catalog path here
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
        model: "gpt-5", // Set desired model here
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
