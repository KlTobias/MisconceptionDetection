// Helpers used to prepare code before prompting models.

// Helper to add line numbers to code snippets
export function withLineNumbers(code: string): string {
  return code
    .split("\n")
    .map((line: string, i: number) => `${String(i + 1).padStart(4, " ")}| ${line}`)
    .join("\n");
}

// Remove single-line (//...) and block (/* ... */) comments while preserving
// string literals (single, double, and template/backtick) and escapes.
export function stripComments(code: string): string {
  let out = "";
  let i = 0;
  const len = code.length;

  let inSingle = false;
  let inDouble = false;
  let inTemplate = false;
  let inBlock = false;
  let inLine = false;

  while (i < len) {
    const ch = code[i]!;
    const next = code[i + 1]; // may be undefined at end

    if (inBlock) {
      if (ch === "*" && next === "/") {
        inBlock = false;
        i += 2;
      } else {
        i++;
      }
      continue;
    }

    if (inLine) {
      if (ch === "\n") {
        inLine = false;
        out += ch;
      }
      i++;
      continue;
    }

    if (inSingle) {
      if (ch === "\\") {
        out += ch;
        if (i + 1 < len) out += code[i + 1]!;
        i += 2;
        continue;
      }
      out += ch;
      if (ch === "'") inSingle = false;
      i++;
      continue;
    }

    if (inDouble) {
      if (ch === "\\") {
        out += ch;
        if (i + 1 < len) out += code[i + 1]!;
        i += 2;
        continue;
      }
      out += ch;
      if (ch === '"') inDouble = false;
      i++;
      continue;
    }

    if (inTemplate) {
      if (ch === "\\") {
        out += ch;
        if (i + 1 < len) out += code[i + 1]!;
        i += 2;
        continue;
      }
      out += ch;
      if (ch === "`") inTemplate = false;
      i++;
      continue;
    }

    // Not in any special mode
    if (ch === "/" && next === "*") {
      inBlock = true;
      i += 2;
      continue;
    }

    if (ch === "/" && next === "/") {
      inLine = true;
      i += 2;
      continue;
    }

    if (ch === "'") {
      inSingle = true;
      out += ch;
      i++;
      continue;
    }

    if (ch === '"') {
      inDouble = true;
      out += ch;
      i++;
      continue;
    }

    if (ch === "`") {
      inTemplate = true;
      out += ch;
      i++;
      continue;
    }

    out += ch;
    i++;
  }

  return out;
}