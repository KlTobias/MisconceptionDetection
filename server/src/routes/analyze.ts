import { Router } from 'express'
import Ajv from 'ajv'

const router = Router()

router.post('/', async (req, res) => {
  const { code, mock, mockResponse } = req.body
  if (!code && !mock) return res.status(400).json({ error: 'code is required (or set mock true)' })
  console.log("Received code for analysis:", code, "mock:", !!mock);

  try {
    // Allow using a mock response for local testing without calling the external API
    let data: any
    if (mock) {
      // Use provided mockResponse (object or JSON string) or a built-in sample
      if (mockResponse) {
        data = typeof mockResponse === 'string' ? JSON.parse(mockResponse) : mockResponse
      } else {
        data = {
          findings: [
            {
              id: 'Array_Length_Only_in_Loops',
              lines: [3, 6, 7],
              explanation:
                "Line 5 correctly uses c.length in the loop condition, but outside the loop head a fixed number is used where array lengths should be referenced: line 6 uses 3 (the length of a) and line 7 uses i-3 (again assuming a has length 3). Line 3 also hardcodes 5 for c’s size instead of using a.length + b.length. This matches the catalog’s indicator of avoiding .length outside loop conditions. The when_not_a_misconception case does not apply because .length is not used outside the loop condition anywhere."
            },
            {
              id: 'Array_Length_as_Number',
              lines: [6, 7],
              explanation:
                "The code uses the fixed number 3 on line 6 to split between copying from a and b, and uses i-3 on line 7 to index b. These literals implicitly represent a.length and rely on a being exactly length 3, which is fragile per the catalog. The correct approach would use a.length (and possibly b.length). The when_not_a_misconception cases do not apply: the fixed number is not for a purpose unrelated to array length, and no variable representing the length is used."
            }
          ]
        }
      }

      console.log('Using mock response for analysis:', JSON.stringify(data, null, 2))
    } else {
      // Use Node's global fetch (available in Node 18+)
      // Request the Responses API with a JSON schema response format (strict)
      const resp = await fetch('https://api.openai.com/v1/responses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          input: `Please analyze the following code and return a JSON object using the "misconception_findings" json_schema format mentioned in the request. Only return data that matches the schema.\n\n${code}`,
          response_format: {
            type: 'json_schema',
            strict: true,
            name: 'misconception_findings',
            schema: {
              type: 'object',
              additionalProperties: false,
              properties: {
                findings: {
                  type: 'array',
                  items: {
                    type: 'object',
                    additionalProperties: false,
                    properties: {
                      id: { type: 'string' },
                      lines: { type: 'array', items: { type: 'integer', minimum: 1 } },
                      explanation: { type: 'string' }
                    },
                    required: ['id', 'lines', 'explanation']
                  }
                }
              },
              required: ['findings']
            }
          }
        })
      })

      data = await resp.json()
      console.log('raw model response:', JSON.stringify(data, null, 2))
    }

    // Helper: search recursively for an object that matches { findings: [...] }
    function deepFindFindings(obj: any): any | null {
      if (!obj || typeof obj !== 'object') return null
      if (Array.isArray(obj)) {
        for (const item of obj) {
          const res = deepFindFindings(item)
          if (res) return res
        }
        return null
      }

      if (obj.findings && Array.isArray(obj.findings)) return obj

      for (const key of Object.keys(obj)) {
        try {
          const res = deepFindFindings((obj as any)[key])
          if (res) return res
        } catch (e) {
          // ignore
        }
      }
      return null
    }

    // Try to find a parsed object in the structured response
    let parsed = deepFindFindings(data)

    // If nothing found, try to extract JSON from any textual output (handles non-strict models)
    if (!parsed) {
      const texts: string[] = []
      if (Array.isArray(data.output)) {
        for (const outItem of data.output) {
          if (Array.isArray(outItem.content)) {
            for (const c of outItem.content) {
              if (typeof c === 'string') texts.push(c)
              else if (typeof c?.text === 'string') texts.push(c.text)
              else texts.push(JSON.stringify(c))
            }
          } else {
            texts.push(JSON.stringify(outItem))
          }
        }
      } else if (typeof data.output === 'string') {
        texts.push(data.output)
      }

      const joined = texts.join('\n')
      // strip code fences and find first JSON object-looking substring
      const cleaned = joined.replace(/```(?:json)?\n?|```/g, '\n')
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        try {
          parsed = JSON.parse(jsonMatch[0])
        } catch (err) {
          console.error('Failed to JSON.parse matched substring', err)
        }
      }
    }

    if (!parsed) {
      console.error('No usable JSON schema output found in model response')
      return res.status(500).json({ error: 'model response did not include expected JSON schema output' })
    }

    // Validate shape with Ajv
    const ajv = new Ajv({ allErrors: true })

    const schema = {
      type: 'object',
      additionalProperties: false,
      properties: {
        findings: {
          type: 'array',
          items: {
            type: 'object',
            additionalProperties: false,
            properties: {
              id: { type: 'string' },
              lines: { type: 'array', items: { type: 'integer', minimum: 1 } },
              explanation: { type: 'string' }
            },
            required: ['id', 'lines', 'explanation']
          }
        }
      },
      required: ['findings']
    }

    const validate = ajv.compile(schema)
    const ok = validate(parsed)
    if (!ok) {
      console.error('Validation failed:', validate.errors)
      return res.status(500).json({ error: 'model output failed validation', details: validate.errors })
    }

    // Map to clean array of misconception objects to return to client
    const misconceptions = parsed.findings.map((f: any) => ({
      id: String(f.id),
      lines: Array.isArray(f.lines) ? f.lines.map((n: any) => Number(n)) : [],
      explanation: String(f.explanation)
    }))

    return res.json({ misconceptions })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'analysis failed' })
  }
})

export default router
