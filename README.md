# Misconception Detector for Processing (Java)

Prototype web application for **LLM-based detection of programming misconceptions** in
novice student code written in [Processing](https://processing.org), a Java-based
programming language. A curated catalog of ten array-related misconceptions (derived from
[List et al., Koli Calling '25](https://doi.org/10.1145/3769994.3770058); full collection:
https://tha.de/misconceptions/) is embedded in the model prompt. Submitted code is
analyzed by GPT-5; detected misconceptions are returned with relevant code positions and
explanations and highlighted in the editor.

This software is the artefact accompanying the DELFI 2026 short paper
*"Beyond Syntax Errors: Towards Detecting Conceptual Misconceptions in Student Code with
LLMs"* (Kleiner, List, Müller, Kipp). (https://doi.org/10.5281/zenodo.20667054)

## Repository overview

npm-workspaces monorepo:

- `client/` — Vue 3 + TypeScript + Vite front end (Monaco code editor, result panel, theme toggle)
- `server/` — Node.js + Express + TypeScript back end; preprocesses code (comment stripping, line numbering), calls the OpenAI API with the embedded misconception catalog, validates the structured JSON response (Ajv)
- `shared/` — shared TypeScript types
- `server/src/misconception_catalog/misconception_catalog.json` — the misconception catalog used in the prompt
- `examples/` — synthetic example snippets with documented expected outputs (see below)
- `docs/LLM_DOCUMENTATION.md` — full prompt, model identifier, and inference parameters

## Requirements

- Node.js >= 20 and npm (platform-independent: Windows, macOS, Linux)
- An **OpenAI API key**. ⚠️ The analysis calls the OpenAI API (`gpt-5`), a **paid,
  closed-source external service**. Each analysis request incurs API costs (typically
  a few cents per snippet). A mock mode is available for testing the pipeline without
  an API key (see below).

## Installation

```bash
git clone <repository-url>
cd MisconceptionDetection
npm install                       # installs all workspaces
cp server/.env.example server/.env
# edit server/.env and set OPENAI_API_KEY
```

## Running

```bash
npm run dev
```

This starts the server (http://localhost:3000) and the Vite dev server for the client
(URL printed in the console, typically http://localhost:5173). Open the client URL in a
browser, paste a Processing snippet into the editor, and click *Analyze*.

### Trying the examples

Use the snippets in `examples/`. The expected misconception IDs per snippet are
documented in [`examples/EXPECTED_OUTPUTS.md`](examples/EXPECTED_OUTPUTS.md), including
one misconception-free snippet as a false-positive check.

### Mock mode (no API key required)

The analysis endpoint can be exercised without calling the external API:

```bash
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"mock": true}'
```

This returns a built-in sample response and verifies that the server, validation, and
response pipeline work.

## LLM usage documentation

In line with the [LLM guidelines](https://llm-guidelines.org/), the complete prompt
(system/developer prompt with the resolved misconception catalog), model identifier and
snapshot, inference parameters, and the structured output schema are documented in
[`docs/LLM_DOCUMENTATION.md`](docs/LLM_DOCUMENTATION.md).

## Ethics and data protection (DSGVO/GDPR)

This repository contains **no personal data and no real student submissions**. The
student code used for the evaluation reported in the paper was collected with the
students' consent, pseudonymized prior to analysis, and is **not** part of this artefact.
All snippets in `examples/` are synthetic and were written by the authors. No API keys
or other credentials are contained in this repository; the API key is supplied locally
via an untracked `.env` file. Note that code submitted through the web application is
transmitted to the OpenAI API; deployments should inform users accordingly and no
personal data should be pasted into the editor.

## Future development

The prototype is the foundation for an intelligent tutoring system (ITS) with immediate,
personalized feedback. Planned next steps include extending the catalog beyond
array-related misconceptions, supporting further programming languages via adapted
catalogs, and classroom deployment. See the artefact paper for details.

## License and citation

Licensed under the [MIT License](LICENSE). Citation metadata: [`CITATION.cff`](CITATION.cff).

## Acknowledgments

Funded by the KI-AUX project, supported by the Stiftung Innovation in der Hochschullehre
(Foundation for Innovation in Higher Education).
