# DELFI 2026 Artefact Submission Plan — Misconception Detector

**Target badge:** Bewertet – Funktionsfähig (Software)
**Publication route:** GitHub release → Zenodo deposit (DOI = canonical artefact for review)

## Deadlines (all 12:00 noon CEST)

| Date | Milestone |
|---|---|
| **14.06.2026** | Artefact paper submission (THIS SUNDAY) |
| 30.06.2026 | Notification |
| 12.07.2026 | Camera-ready (paper must cite the final DOI) |

## Current repo status (audited 10.06.2026)

| Item | Status |
|---|---|
| Real API key | Only in `server/.env` — gitignored, **never committed** (full history checked). `.env.example` contains placeholder only. ✅ |
| Real student code | None found in repo. ✅ Must stay that way — example data must be synthetic. |
| LICENSE | ❌ Missing |
| Citation metadata (CITATION.cff / codemeta.json) | ❌ Missing |
| README | ⚠️ Minimal — quickstart only; lacks project description, repo overview, expected outputs, DSGVO/ethics note |
| Dependencies | ✅ Declared via `package.json` per workspace; Node version not pinned (add `engines` field) |
| Example/test data with expected outputs | ❌ Missing — required for Funktionsfähig |
| Prompts + catalog | ✅ In repo (`server/src/misconception_catalog/`, `server/src/routes/analyze.ts`) — needed for LLM-guideline compliance |

## Phase 1 — Repo cleanup & compliance (by 12.06)

1. **API keys:** keep `server/.env` out of every published archive. After creating the release ZIP / Zenodo upload, grep the archive for `sk-` and `OPENAI_API_KEY=` values as a final check. (History is clean, so no history rewriting needed.) Consider rotating the current key as routine hygiene.
2. **Student data:** do NOT include the 45 authentic submissions or the 64-snippet evaluation dataset. Instead add 3–5 **synthetic example snippets** (e.g. the augmented/injected ones, re-generated or hand-written) under `examples/`, each with a documented expected output (detected misconceptions + line positions), e.g. `examples/expected_outputs.md` or JSON reference files. The guidelines explicitly say real research data is not required — example data suffices.
3. Remove `.vscode/` from tracking (already gitignored but committed).

## Phase 2 — Funktionsfähig requirements (by 13.06)

4. **LICENSE:** add an OSI license (MIT recommended) — confirm with all four authors / university policy.
5. **README (root)** must contain:
   - Project description + link to the paper context (misconception detection for Processing code via LLM)
   - Repository overview (client / server / shared)
   - Install + run instructions (Node version, `npm install`, `.env` setup, `npm run dev`), platform-independent
   - **Explicit note that an OpenAI API key (paid service) is required** — this dependency on a paid, closed-source service must also be stated in the artefact paper
   - How to run the examples and what output to expect
   - Short ethics/DSGVO statement: no personal data included; student submissions used in the paper were collected with consent, pseudonymized, and are not part of this artefact; included examples are synthetic
6. **Metadata file in root:** `CITATION.cff` (authors with ORCIDs, title, version, license) and optionally `codemeta.json`.
7. **Pin dependencies:** add `engines.node` to root `package.json`; `package-lock.json` already pins the rest.
8. **LLM documentation** (required by the LLM guidelines, in repo + artefact paper):
   - Model identifier + snapshot date (e.g. `gpt-5-YYYY-MM-DD`)
   - Full system prompt and prompt templates with resolved placeholders (catalog JSON is already in repo — reference it)
   - All inference parameters (temperature, top-p, max tokens, seed, stop sequences, function-call config)
9. **Smoke test:** fresh clone on a clean machine → install → run an example end-to-end; confirm console/UI output matches the documented expected outputs and the paper's description.

## Phase 3 — Publish with persistent ID (by 13.06)

10. Push to a **public** GitHub/GitLab repo (no anonymization required — single-blind).
11. Create a tagged **release** (e.g. `v1.0.0`).
12. **Zenodo:** enable the GitHub–Zenodo integration before tagging (auto-deposit on release) or upload the release ZIP manually. Fill Zenodo metadata: title, authors + ORCIDs, license, resource type *Software*, keywords. → yields the **DOI (stable ID)**. The Zenodo deposit is the canonical artefact for review. Do not upload new versions between review end and badge award.

## Phase 4 — Artefact paper (submit by 14.06, 12:00)

13. Use the adapted LNI template: https://delfi-tagung.de/fileadmin/TG/DELFI/DELFI_2026/LNI-Autorenrichtlinien_AET.docx (LaTeX LNI also allowed). Max **4 pages**, covering:
    - Context of the artefact (relation to the accepted short paper)
    - Getting-started / usage entry point
    - Future development effort
    - Paid-service dependency (OpenAI API) made explicit
    - LLM documentation (item 8)
14. Metadata block after the abstract:
    - **Resource Type:** Software
    - **License:** (chosen OSI license)
    - **Stable ID:** Zenodo DOI
    - **Repository:** GitHub URL (optional, working environment)
15. Submit via the conference system, selecting target badge **Funktionsfähig**.

## Phase 5 — After review

16. Address reviewer requests (small changes don't require re-review; no new artefact versions after review completion until badges are awarded).
17. Camera-ready by **12.07.2026**: final paper must reference the persistent DOI.

## Final verification checklist

- [ ] Release ZIP contains no `sk-…` strings, no `.env`, no real student code
- [ ] Fresh-clone install + example run works on another machine/OS
- [ ] README: description, overview, install, examples, expected outputs, ethics/DSGVO note
- [ ] LICENSE + CITATION.cff in root
- [ ] DOI resolves and Zenodo metadata is complete
- [ ] Paper ≤ 4 pages, AET-LNI template, metadata block with Resource Type / License / Stable ID / Repository
- [ ] LLM details (model snapshot, prompts, inference params) in paper + artefact
