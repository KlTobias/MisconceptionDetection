# LLM Usage Documentation

Documentation of LLM usage in the Misconception Detector prototype, following the
[LLM guidelines](https://llm-guidelines.org/) and the DELFI 2026 artefact requirements.

## Model

| Item | Value |
|---|---|
| Provider / API | OpenAI Responses API (`openai` npm package) |
| Model identifier | `gpt-5` |
| Model snapshot date | `gpt-5-2025-08-07` |
| Weights | Closed |

The paper additionally evaluates GPT-5-mini, GPT-5-Codex, LLaMA-4 Maverick, and
DeepSeek-V3.1 with the same prompt and preprocessing pipeline (open-weight models at
temperature 0). This prototype uses `gpt-5` only; the model is set in
`server/src/routes/analyze.ts` (`model: "gpt-5"`).

## Inference parameters

As configured in `server/src/routes/analyze.ts`:

| Parameter | Value |
|---|---|
| `reasoning.effort` | `medium` |
| Temperature / top-p | Not set (not applicable to GPT-5 reasoning models via the Responses API; provider defaults apply) |
| Max output tokens | Not set (provider default) |
| Seed | Not set |
| Stop sequences | None |
| Tools / function calling | None (`tools: []`) |
| Output format | Strict structured output (JSON schema, see below) |

## Prompt structure

Two messages are sent per request:

1. **Developer (system) prompt** — task instructions with the full misconception
   catalog resolved into the placeholder.
2. **User prompt** — the preprocessed student code snippet.

### Preprocessing of the user input

Before inference (`server/src/utils/codePreprocessors.ts`):

1. All comments (`//` and `/* */`) are stripped, preserving string literals.
2. Each line is prefixed with a 4-digit line number: `NNNN| <code>`.

### Developer prompt template (verbatim)

```text
MISCONCEPTIONS CATALOG (JSON):
${JSON.stringify(misconception_catalog, null, 2)}

Determine which misconceptions from the provided CATALOG are present in the given code snippet. For each identified misconception, provide the following details:
- Misconception ID
- One or more line numbers relevant to misconception
- Explanation that references the relevant lines and the catalog

RULES:
- The code is line-numbered: "NNNN| ...". You MUST use those NNNN values in your output.
- Explanation must confirm that the "when_not_a_misconception" case does NOT apply.
```

The placeholder `${JSON.stringify(misconception_catalog, null, 2)}` is resolved with the
complete contents of
[`server/src/misconception_catalog/misconception_catalog.json`](../server/src/misconception_catalog/misconception_catalog.json),
which is part of this repository. The catalog contains ten array-related misconceptions,
each with `short_definition`, `why_incorrect`, `indicators`, `when_not_a_misconception`,
and positive/negative code examples.

### User prompt (verbatim)

The preprocessed, line-numbered code snippet, e.g.:

```text
   1| int[] scores = new int[3];
   2|
   3| void setup() {
   4|   scores[0] = 12;
   ...
```

## Structured output schema

The model is forced to return JSON conforming to this schema (strict mode); `id` is
constrained to the enum of catalog keys:

```json
{
  "type": "object",
  "additionalProperties": false,
  "properties": {
    "findings": {
      "type": "array",
      "items": {
        "type": "object",
        "additionalProperties": false,
        "properties": {
          "id": { "type": "string", "enum": ["<catalog misconception IDs>"] },
          "lines": { "type": "array", "items": { "type": "integer", "minimum": 1 } },
          "explanation": { "type": "string" }
        },
        "required": ["id", "lines", "explanation"]
      }
    }
  },
  "required": ["findings"]
}
```

The response is additionally validated server-side with Ajv before being returned to the
client.
