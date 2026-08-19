/**
 * Grades a student's program output against a question's hidden test cases.
 *
 * Beginners decorate their output ("The sum is 12" rather than "12"), so the
 * matching is deliberately forgiving about wording and spacing while staying
 * strict about the values themselves.
 */

export type MatchMode = 'numbers' | 'contains' | 'exact';

export interface TestCase {
  /** Short human label shown to the student, e.g. "equal values". */
  label: string;
  stdin: string;
  mode: MatchMode;
  /** Expected output. An array is treated as consecutive lines. */
  expect: string | string[];
  /** Output must NOT contain this (e.g. "not prime" when expecting "prime"). */
  forbid?: string;
  /** Compare case-sensitively in `contains` mode. Off by default. */
  cs?: boolean;
}

export interface CaseResult {
  label: string;
  stdin: string;
  expected: string;
  actual: string;
  passed: boolean;
  reason: string;
}

const NUMBER_PATTERN = /-?\d+(?:\.\d+)?/g;
const INPUT_CALL = /\b(?:scanf|gets|fgets|getchar|fgetc|getline)\s*\(/;

export interface GradeContext {
  /** Whether the submitted program tries to read from stdin. */
  readsInput?: boolean;
}

export function expectedText(testCase: TestCase): string {
  return Array.isArray(testCase.expect) ? testCase.expect.join('\n') : testCase.expect;
}

/** True when the program calls something that waits on stdin. */
export function readsStdin(code: string): boolean {
  return INPUT_CALL.test(code);
}

export function gradeCase(
  testCase: TestCase,
  stdout: string,
  context?: GradeContext,
): { passed: boolean; reason: string } {
  const verdict = evaluate(testCase, stdout);
  if (verdict.passed) return verdict;

  // Reading input on a question that supplies none is a common beginner slip:
  // scanf hits end-of-file, the variable is never assigned, and the output is
  // whatever happened to be in memory. Say that outright.
  if (!testCase.stdin && context?.readsInput) {
    return {
      passed: false,
      reason:
        'This question does not give your program any input, but it calls scanf (or similar) and waits for some. ' +
        'Nothing is read, so the variable never gets a value. Set the value directly in your code instead — ' +
        `for example int num = 10;. ${verdict.reason}`,
    };
  }

  return verdict;
}

function evaluate(testCase: TestCase, stdout: string): { passed: boolean; reason: string } {
  const expected = expectedText(testCase);
  const actual = stdout || '';

  if (testCase.forbid && squash(actual).includes(squash(testCase.forbid))) {
    return { passed: false, reason: `Output should not say "${testCase.forbid}" for this input.` };
  }

  // Some questions (e.g. "print Positive only when n > 0") correctly print
  // nothing for a given input, so an empty expectation is a real pass.
  if (!expected) return { passed: true, reason: 'Correct.' };

  if (!actual.trim()) return { passed: false, reason: 'Your program printed nothing.' };

  if (testCase.mode === 'numbers') {
    const wanted = numbersIn(expected);
    const got = numbersIn(actual);
    return isSubsequence(wanted, got)
      ? { passed: true, reason: 'Correct.' }
      : {
          passed: false,
          reason: `Expected the value ${wanted.join(', ')} in the output, but found ${
            got.length ? got.join(', ') : 'no numbers'
          }.`,
        };
  }

  if (testCase.mode === 'contains') {
    const haystack = testCase.cs ? collapse(actual) : squash(actual);
    const needle = testCase.cs ? collapse(expected) : squash(expected);
    return haystack.includes(needle)
      ? { passed: true, reason: 'Correct.' }
      : { passed: false, reason: `Expected the output to contain "${expected}".` };
  }

  const wantedLines = shapeOf(expected);
  const gotLines = shapeOf(actual);
  return wantedLines === gotLines
    ? { passed: true, reason: 'Correct.' }
    : { passed: false, reason: `Expected exactly:\n${expected}` };
}

/** Every expected number must appear, in order, somewhere in the output. */
function isSubsequence(wanted: number[], got: number[]): boolean {
  if (!wanted.length) return true;
  let index = 0;
  for (const value of got) {
    if (closeEnough(value, wanted[index])) {
      index += 1;
      if (index === wanted.length) return true;
    }
  }
  return false;
}

/** Tolerant compare so %.2f and %f both pass a float question. */
function closeEnough(a: number, b: number): boolean {
  return Math.abs(a - b) <= 0.01 + Math.abs(b) * 0.001;
}

function numbersIn(value: string): number[] {
  return (value.match(NUMBER_PATTERN) || []).map(Number);
}

/** Lowercased, whitespace-collapsed — for forgiving word matching. */
function squash(value: string): string {
  return collapse(value).toLowerCase();
}

function collapse(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

/**
 * Layout comparison for pattern questions: keeps line structure, ignores
 * spacing, so "* * *" and "***" are both accepted for a row of three stars.
 */
function shapeOf(value: string): string {
  return value
    .split(/\r?\n/)
    .map((line) => line.replace(/[ \t]/g, ''))
    .join('\n')
    .replace(/\n+$/, '');
}
