export type Severity = 'error' | 'warning' | 'note';

export interface Diagnostic {
  line?: number;
  column?: number;
  severity: Severity;
  message: string;
  snippet: string[];
  /** gcc "note:" lines, which usually say how to fix it. */
  notes: string[];
}

export interface RuntimeIssue {
  title: string;
  hint: string;
}

// gcc: "main.c:4:3: error: expected ',' or ';' before 'printf'"
// linker: "main.c:(.text+0x1a): undefined reference to 'foo'"
const DIAGNOSTIC_LINE = /^(?:[^\s:]+):(\d+):(?:(\d+):)?\s*(fatal error|error|warning|note):\s*(.*)$/;
const LINKER_LINE = /undefined reference to\s+[`'‘"]?([^'’"`]+)/;

/** Turns raw gcc output into structured diagnostics with line/column info. */
export function parseDiagnostics(raw: string): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];
  const lines = normalizeQuotes(raw).split('\n');
  // Which diagnostic the following caret/source lines belong to.
  let snippetTarget: Diagnostic | null = null;

  for (const line of lines) {
    const match = DIAGNOSTIC_LINE.exec(line.trim());
    if (match) {
      const [, lineNo, columnNo, rawSeverity, message] = match;
      const previous = diagnostics[diagnostics.length - 1];

      // A note explains the diagnostic above it ("include '<stdio.h>'"), so
      // keep the two together instead of listing it as its own finding.
      if (rawSeverity === 'note' && previous) {
        previous.notes.push(message);
        snippetTarget = null;
        continue;
      }

      const diagnostic: Diagnostic = {
        line: Number(lineNo),
        column: columnNo ? Number(columnNo) : undefined,
        severity: rawSeverity === 'fatal error' ? 'error' : (rawSeverity as Severity),
        message: stripFlag(message),
        snippet: [],
        notes: [],
      };
      diagnostics.push(diagnostic);
      snippetTarget = diagnostic;
      continue;
    }

    const linker = LINKER_LINE.exec(line);
    if (linker) {
      const diagnostic: Diagnostic = {
        severity: 'error',
        message: `undefined reference to '${linker[1]}' — the function is declared or called but never defined.`,
        snippet: [],
        notes: [],
      };
      diagnostics.push(diagnostic);
      snippetTarget = diagnostic;
      continue;
    }

    // Caret/source lines ("    4 |   printf(...)") belong to the diagnostic above them.
    if (snippetTarget && /\|/.test(line) && line.trim()) snippetTarget.snippet.push(line);
  }

  return dropWarningsShadowedByErrors(diagnostics);
}

/**
 * gcc often reports a warning on the same line as an error (a missing header
 * yields both, with the "include <stdio.h>" note hanging off the warning).
 * Keep only the error, but carry any notes across so the fix is not lost.
 */
function dropWarningsShadowedByErrors(diagnostics: Diagnostic[]): Diagnostic[] {
  const errorByLine = new Map<number, Diagnostic>();
  for (const item of diagnostics) {
    if (item.severity === 'error' && item.line !== undefined && !errorByLine.has(item.line)) {
      errorByLine.set(item.line, item);
    }
  }

  return diagnostics.filter((item) => {
    if (item.severity !== 'warning' || item.line === undefined) return true;
    const shadowing = errorByLine.get(item.line);
    if (!shadowing) return true;
    for (const note of item.notes) {
      if (!shadowing.notes.includes(note)) shadowing.notes.push(note);
    }
    return false;
  });
}

const SIGNAL_ISSUES: Array<{ match: RegExp; issue: RuntimeIssue }> = [
  {
    match: /segmentation fault|sigsegv/i,
    issue: {
      title: 'Segmentation Fault',
      hint: 'Your program touched memory it does not own. Common causes: an array index out of bounds, a NULL or uninitialised pointer, or a missing & in scanf (use scanf("%d", &n)).',
    },
  },
  {
    match: /floating point exception|sigfpe/i,
    issue: {
      title: 'Floating Point Exception',
      hint: 'An arithmetic fault — almost always division or modulo by zero. Check the divisor before dividing.',
    },
  },
  {
    match: /bus error|sigbus/i,
    issue: { title: 'Bus Error', hint: 'A misaligned or invalid memory access, usually through a bad pointer.' },
  },
  {
    match: /stack smashing detected/i,
    issue: {
      title: 'Stack Smashing Detected',
      hint: 'You wrote past the end of a local array. Check the bounds of every loop that fills a buffer.',
    },
  },
  {
    match: /double free|corrupted|malloc\(\): |free\(\): /i,
    issue: {
      title: 'Heap Corruption',
      hint: 'A malloc/free problem — freeing the same pointer twice, freeing a non-heap pointer, or writing past an allocation.',
    },
  },
  {
    match: /assertion .* failed|aborted|sigabrt/i,
    issue: { title: 'Program Aborted', hint: 'The program called abort() — often a failed assert() or a detected heap error.' },
  },
];

const STATUS_ISSUES: Record<number, RuntimeIssue> = {
  5: {
    title: 'Time Limit Exceeded',
    hint: 'Your program ran too long — usually an infinite loop, or a loop whose condition never becomes false.',
  },
  8: {
    title: 'Output Limit Exceeded',
    hint: 'The program printed far too much output — check for a printf inside a runaway loop.',
  },
  13: { title: 'Internal Error', hint: 'The judge failed to run your program. Try again in a moment.' },
  14: { title: 'Executable Format Error', hint: 'The compiled program could not be launched.' },
};

/**
 * Explains a non-compile failure. Judge0 CE reports most crashes as status 11 (NZEC),
 * so the actual signal has to be recovered from stderr.
 */
export function describeRuntimeIssue(statusId?: number, description?: string, stderr?: string): RuntimeIssue | null {
  if (!statusId || statusId === 3 || statusId === 6) return null;

  if (stderr) {
    const signal = SIGNAL_ISSUES.find((entry) => entry.match.test(stderr));
    if (signal) return signal.issue;
  }

  const known = STATUS_ISSUES[statusId];
  if (known) return known;

  return {
    title: description || 'Runtime Error',
    hint: 'The program compiled but did not finish cleanly. Check pointer use, array bounds, and that main returns 0.',
  };
}

/** Strips Judge0's shell wrapper noise ("run.sh: line 1: 3 Segmentation fault ...") from stderr. */
export function cleanStderr(stderr?: string | null): string {
  if (!stderr) return '';
  return stderr
    .split('\n')
    .filter((line) => !/^\s*run\.sh:\s*line\s*\d+:/.test(line))
    .join('\n')
    .trim();
}

/** Drops gcc's trailing flag tag, e.g. "[-Wunused-variable]" — noise for a learner. */
function stripFlag(message: string): string {
  return message.replace(/\s*\[-W[^\]]*\]\s*$/, '').trim();
}

function normalizeQuotes(value: string): string {
  return value.replace(/[\u2018\u2019]/g, "'").replace(/[\u201C\u201D]/g, '"');
}
