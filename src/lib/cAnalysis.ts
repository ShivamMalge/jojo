export interface CFunction {
  name: string;
  returnType: string;
  params: Array<{ type: string; name: string }>;
  startLine: number;
  endLine: number;
  calls: string[];
}

export interface CControlNode {
  id: string;
  kind: 'if' | 'else' | 'for' | 'while' | 'switch' | 'case' | 'default' | 'return' | 'statement';
  label: string;
  line: number;
}

export interface CAnalysis {
  functions: CFunction[];
  includes: string[];
  controls: CControlNode[];
  metrics: {
    lines: number;
    functions: number;
    complexity: number;
    maxNestingDepth: number;
  };
}

const C_KEYWORDS = new Set([
  'auto',
  'break',
  'case',
  'char',
  'const',
  'continue',
  'default',
  'do',
  'double',
  'else',
  'enum',
  'extern',
  'float',
  'for',
  'goto',
  'if',
  'int',
  'long',
  'register',
  'return',
  'short',
  'signed',
  'sizeof',
  'static',
  'struct',
  'switch',
  'typedef',
  'union',
  'unsigned',
  'void',
  'volatile',
  'while',
]);

const BUILT_INS = new Set(['printf', 'scanf', 'malloc', 'free', 'strlen', 'puts', 'gets', 'sizeof']);

export function stripCComments(code: string): string {
  return code
    .replace(/\/\*[\s\S]*?\*\//g, (match) => match.replace(/[^\n]/g, ' '))
    .replace(/\/\/.*$/gm, '');
}

export function analyzeC(code: string): CAnalysis {
  const sanitized = stripCComments(code);
  const lines = sanitized.split('\n');
  const includes: string[] = [];
  const functions: CFunction[] = [];
  const controls: CControlNode[] = [];
  const functionRanges: Array<{ fn: CFunction; body: string }> = [];

  let braceDepth = 0;
  let maxNestingDepth = 0;
  let currentFunction: { fn: CFunction; startDepth: number; bodyLines: string[] } | null = null;

  lines.forEach((rawLine, index) => {
    const lineNumber = index + 1;
    const line = rawLine.trim();
    const includeMatch = line.match(/^#include\s+[<"]([^>"]+)[>"]/);
    if (includeMatch) includes.push(includeMatch[1]);

    const functionMatch = line.match(/^([A-Za-z_][\w\s*]*?)\s+([A-Za-z_]\w*)\s*\(([^;]*)\)\s*\{/);
    if (!currentFunction && functionMatch && !C_KEYWORDS.has(functionMatch[2])) {
      currentFunction = {
        fn: {
          name: functionMatch[2],
          returnType: functionMatch[1].replace(/\s+/g, ' ').trim(),
          params: parseParams(functionMatch[3]),
          startLine: lineNumber,
          endLine: lineNumber,
          calls: [],
        },
        startDepth: braceDepth,
        bodyLines: [line],
      };
    } else if (currentFunction) {
      currentFunction.bodyLines.push(line);
    }

    const controlMatch = line.match(/\b(if|else|for|while|switch|case|default|return)\b\s*(?:\(([^)]*)\))?/);
    if (controlMatch) {
      controls.push({
        id: `n${controls.length + 1}`,
        kind: controlMatch[1] as CControlNode['kind'],
        label: makeControlLabel(controlMatch[1], controlMatch[2], line),
        line: lineNumber,
      });
    }

    const opens = (rawLine.match(/\{/g) || []).length;
    const closes = (rawLine.match(/\}/g) || []).length;
    braceDepth += opens - closes;
    maxNestingDepth = Math.max(maxNestingDepth, braceDepth);

    if (currentFunction && braceDepth <= currentFunction.startDepth) {
      currentFunction.fn.endLine = lineNumber;
      currentFunction.fn.calls = extractCalls(currentFunction.bodyLines.join('\n'), currentFunction.fn.name);
      functions.push(currentFunction.fn);
      functionRanges.push({ fn: currentFunction.fn, body: currentFunction.bodyLines.join('\n') });
      currentFunction = null;
    }
  });

  const knownFunctionNames = new Set(functionRanges.map(({ fn }) => fn.name));
  functionRanges.forEach(({ fn, body }) => {
    fn.calls = extractCalls(body, fn.name).filter((call) => knownFunctionNames.has(call) || !BUILT_INS.has(call));
  });

  return {
    functions,
    includes,
    controls,
    metrics: {
      lines: code.trim() ? code.split('\n').length : 0,
      functions: functions.length,
      complexity: calculateComplexity(sanitized),
      maxNestingDepth,
    },
  };
}

export function generateMermaid(code: string): string {
  const analysis = analyzeC(code);
  if (!code.trim()) {
    return 'flowchart TD\n  Empty[Start typing C code]';
  }

  const mainBody = getFunctionBody(code, 'main');
  if (mainBody) return generateMainFlow(mainBody);

  const lines: string[] = ['flowchart TD'];
  if (analysis.functions.length === 0) {
    lines.push('  Start([C source])');
    analysis.controls.slice(0, 12).forEach((control, index) => {
      const id = safeId(control.id);
      const shape = control.kind === 'if' || control.kind === 'for' || control.kind === 'while' ? `{${escapeMermaid(control.label)}}` : `[${escapeMermaid(control.label)}]`;
      lines.push(`  ${id}${shape}`);
      lines.push(`  ${(index === 0 ? 'Start' : safeId(analysis.controls[index - 1].id))} --> ${id}`);
    });
    if (analysis.controls.length === 0) lines.push('  Start --> Plain[No functions or branches detected yet]');
    return lines.join('\n');
  }

  analysis.functions.forEach((fn) => {
    const fnId = safeId(`fn_${fn.name}`);
    lines.push(`  ${fnId}["${escapeMermaid(fn.name)}(${fn.params.map((p) => p.name).join(', ')})"]`);
    fn.calls.forEach((call) => {
      lines.push(`  ${fnId} --> ${safeId(`fn_${call}`)}["${escapeMermaid(call)}()"]`);
    });
  });

  const main = analysis.functions.find((fn) => fn.name === 'main');
  if (main) lines.push(`  Start([program start]) --> ${safeId('fn_main')}`);

  analysis.controls.slice(0, 10).forEach((control) => {
    const id = safeId(`control_${control.id}`);
    const anchor = main ? safeId('fn_main') : safeId(`fn_${analysis.functions[0].name}`);
    const shape = control.kind === 'if' || control.kind === 'for' || control.kind === 'while' ? `{${escapeMermaid(control.label)}}` : `[${escapeMermaid(control.label)}]`;
    lines.push(`  ${id}${shape}`);
    lines.push(`  ${anchor} -. line ${control.line} .-> ${id}`);
  });

  return lines.join('\n');
}

export interface Relationship {
  id: string;
  name: string;
  fromLine: number;
  toLine: number;
}

export function findCRelationships(code: string): Relationship[] {
  const lines = stripCComments(code).split('\n');
  const definitions = new Map<string, number>();
  const relationships: Relationship[] = [];
  const seen = new Set<string>();

  lines.forEach((rawLine, index) => {
    const line = rawLine.trim();
    const varMatch = line.match(/^(?:const\s+)?(?:unsigned\s+|signed\s+)?(?:int|float|double|char|long|short)\s+\*?\s*([A-Za-z_]\w*)/);
    const fnMatch = line.match(/^(?:[A-Za-z_][\w\s*]*?)\s+([A-Za-z_]\w*)\s*\([^;]*\)\s*\{/);
    const name = fnMatch?.[1] || varMatch?.[1];
    if (name && !C_KEYWORDS.has(name)) definitions.set(name, index + 1);

    const usageRegex = /\b([A-Za-z_]\w*)\b/g;
    let match: RegExpExecArray | null;
    while ((match = usageRegex.exec(line)) !== null) {
      const word = match[1];
      const fromLine = definitions.get(word);
      if (!fromLine || fromLine >= index + 1 || C_KEYWORDS.has(word)) continue;
      const id = `${word}-${fromLine}-${index + 1}`;
      if (seen.has(id)) continue;
      seen.add(id);
      relationships.push({ id, name: word, fromLine, toLine: index + 1 });
    }
  });

  return relationships.slice(0, 40);
}

function parseParams(raw: string): Array<{ type: string; name: string }> {
  if (!raw.trim() || raw.trim() === 'void') return [];
  return raw
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const pieces = part.replace(/\s+/g, ' ').split(' ');
      return {
        type: pieces.slice(0, -1).join(' ') || 'value',
        name: pieces.at(-1)?.replace(/[*&[\]]/g, '') || 'arg',
      };
    });
}

function extractCalls(body: string, selfName: string): string[] {
  const calls = new Set<string>();
  const callRegex = /\b([A-Za-z_]\w*)\s*\(/g;
  let match: RegExpExecArray | null;
  while ((match = callRegex.exec(body)) !== null) {
    const name = match[1];
    if (!C_KEYWORDS.has(name) && name !== selfName) calls.add(name);
  }
  return [...calls];
}

function calculateComplexity(code: string): number {
  const matches = code.match(/\b(if|for|while|case|default)\b|&&|\|\|/g);
  return 1 + (matches?.length || 0);
}

function makeControlLabel(kind: string, condition: string | undefined, line: string): string {
  if (kind === 'case') return line.replace(/:\s*$/, '');
  if (kind === 'default') return 'default';
  if (kind === 'return') return line.length > 42 ? `${line.slice(0, 39)}...` : line;
  if (!condition) return kind;
  return `${kind} ${condition.length > 32 ? `${condition.slice(0, 29)}...` : condition}`;
}

interface FlowStep {
  id: string;
  kind: CControlNode['kind'] | 'start' | 'end' | 'io';
  label: string;
  line: number;
  parentCase?: string;
  branchOf?: string;
  branchKind?: 'yes' | 'no';
}

function generateMainFlow(body: Array<{ line: string; lineNumber: number }>): string {
  const lines = ['flowchart TD'];
  const steps = extractMainFlowSteps(body);
  const hasSwitch = steps.some((step) => step.kind === 'switch');

  lines.push('  Start([program start])');
  lines.push('  Main["main()"]');
  lines.push('  Start --> Main');

  if (!steps.length) {
    lines.push('  Main --> Empty[No flow statements detected]');
    return lines.join('\n');
  }

  if (!hasSwitch) {
    let previous = 'Main';
    for (let index = 0; index < steps.length; index += 1) {
      const step = steps[index];
      if (step.branchOf) continue;

      lines.push(`  ${step.id}${shapeForStep(step)}`);
      const previousStep = steps.find((item) => item.id === previous);
      const previousBranchesToCurrent =
        previousStep?.kind === 'if' &&
        steps.some((item) => item.branchOf === previousStep.id) &&
        steps.slice(0, index).some((item) => item.branchOf === previousStep.id);
      if (!previousBranchesToCurrent) lines.push(`  ${previous} --> ${step.id}`);

      if (step.kind === 'if') {
        const branchSteps = steps.filter((item) => item.branchOf === step.id);
        const yesSteps = branchSteps.filter((item) => item.branchKind === 'yes');
        const noSteps = branchSteps.filter((item) => item.branchKind === 'no');
        renderBranch(lines, step.id, yesSteps, 'yes');
        renderBranch(lines, step.id, noSteps, 'no');

        const nextMainStep = steps.slice(index + 1).find((item) => !item.branchOf);
        if (nextMainStep) {
          const yesEnd = yesSteps.at(-1)?.id;
          const noEnd = noSteps.at(-1)?.id;
          if (yesEnd) lines.push(`  ${yesEnd} --> ${nextMainStep.id}`);
          if (noEnd) lines.push(`  ${noEnd} --> ${nextMainStep.id}`);
          if (!yesEnd) lines.push(`  ${step.id} -->|yes| ${nextMainStep.id}`);
          if (!noEnd) lines.push(`  ${step.id} -->|no| ${nextMainStep.id}`);
        }
      }

      previous = step.id;
    }
    return lines.join('\n');
  }

  let previous = 'Main';
  const switchStep = steps.find((step) => step.kind === 'switch');
  const beforeSwitch = steps.filter((step) => step.line < (switchStep?.line || Number.MAX_SAFE_INTEGER) && !step.parentCase);
  beforeSwitch.forEach((step) => {
    lines.push(`  ${step.id}${shapeForStep(step)}`);
    lines.push(`  ${previous} --> ${step.id}`);
    previous = step.id;
  });

  if (!switchStep) return lines.join('\n');
  lines.push(`  ${switchStep.id}${shapeForStep(switchStep)}`);
  lines.push(`  ${previous} --> ${switchStep.id}`);

  const printResult = steps.find((step) => step.kind === 'io' && step.line > switchStep.line && /result/i.test(step.label));
  const finalReturn = steps.find((step) => step.kind === 'return' && step.line > switchStep.line && /return 0/.test(step.label));
  const caseSteps = steps.filter((step) => step.parentCase);
  const caseIds = [...new Set(caseSteps.map((step) => step.parentCase).filter(Boolean))] as string[];

  caseIds.forEach((caseId) => {
    const group = caseSteps.filter((step) => step.parentCase === caseId);
    if (!group.length) return;
    group.forEach((step) => lines.push(`  ${step.id}${shapeForStep(step)}`));
    lines.push(`  ${switchStep.id} --> ${group[0].id}`);
    const branchIndex = group.findIndex((step) => step.kind === 'if');
    if (branchIndex >= 0) {
      group.slice(1, branchIndex + 1).forEach((step, index) => lines.push(`  ${group[index].id} --> ${step.id}`));
      const branch = group[branchIndex];
      const successStep = group.slice(branchIndex + 1).find((step) => step.kind === 'statement' || step.kind === 'io');
      const errorStep = group.slice(branchIndex + 1).find((step) => step.kind === 'return' && /return 1/.test(step.label));
      if (successStep) lines.push(`  ${branch.id} -->|yes| ${successStep.id}`);
      if (errorStep) lines.push(`  ${branch.id} -->|no| ${errorStep.id}`);
      if (successStep && printResult) lines.push(`  ${successStep.id} --> ${printResult.id}`);
      return;
    }

    group.slice(1).forEach((step, index) => lines.push(`  ${group[index].id} --> ${step.id}`));
    const lastSuccessStep = [...group].reverse().find((step) => step.kind !== 'return');
    if (lastSuccessStep && printResult && !group.some((step) => /return 1/.test(step.label))) lines.push(`  ${lastSuccessStep.id} --> ${printResult.id}`);
  });

  if (printResult) {
    lines.push(`  ${printResult.id}${shapeForStep(printResult)}`);
  }
  if (finalReturn) {
    lines.push(`  ${finalReturn.id}${shapeForStep(finalReturn)}`);
    lines.push(`${printResult ? `  ${printResult.id}` : `  ${switchStep.id}`} --> ${finalReturn.id}`);
  }

  return lines.join('\n');
}

function extractMainFlowSteps(body: Array<{ line: string; lineNumber: number }>): FlowStep[] {
  const steps: FlowStep[] = [];
  let currentCase: string | undefined;
  let switchDepth = 0;
  let activeBranch: { ifId: string; branchKind: 'yes' | 'no'; depth: number } | undefined;
  let lastIfId: string | undefined;

  body.forEach(({ line, lineNumber }) => {
    const trimmed = line.trim();
    if (/^}\s*else\b/.test(trimmed) && lastIfId) {
      activeBranch = {
        ifId: lastIfId,
        branchKind: 'no',
        depth: Math.max(1, countChar(trimmed, '{') - countChar(trimmed, '}') + 1),
      };
      return;
    }

    if (switchDepth > 0 && /^}/.test(trimmed)) {
      switchDepth += countChar(trimmed, '{') - countChar(trimmed, '}');
      if (switchDepth <= 0) currentCase = undefined;
    }
    if (!trimmed || trimmed === '{' || trimmed === '}') {
      if (activeBranch && trimmed === '}') activeBranch = undefined;
      return;
    }

    const switchMatch = trimmed.match(/^switch\s*\(([^)]*)\)/);
    if (switchMatch) {
      steps.push(makeStep('switch', `switch ${switchMatch[1].trim()}`, lineNumber));
      switchDepth += countChar(trimmed, '{') - countChar(trimmed, '}');
      return;
    }

    const caseMatch = trimmed.match(/^case\s+([^:]+):/);
    if (caseMatch) {
      currentCase = `case_${safeId(caseMatch[1])}_${lineNumber}`;
      steps.push(makeStep('case', `case ${caseMatch[1].trim()}`, lineNumber, currentCase));
      return;
    }

    if (/^default\s*:/.test(trimmed)) {
      currentCase = `default_${lineNumber}`;
      steps.push(makeStep('default', 'default', lineNumber, currentCase));
      return;
    }

    const ifMatch = trimmed.match(/^if\s*\(([^)]*)\)/);
    if (ifMatch) {
      const step = makeStep('if', `if ${ifMatch[1].trim()}`, lineNumber, currentCase, activeBranch);
      steps.push(step);
      lastIfId = step.id;
      if (!currentCase) {
        activeBranch = {
          ifId: step.id,
          branchKind: 'yes',
          depth: Math.max(1, countChar(trimmed, '{') - countChar(trimmed, '}')),
        };
      }
      if (switchDepth > 0) switchDepth += countChar(trimmed, '{') - countChar(trimmed, '}');
      return;
    }

    if (/^}?\s*else\b/.test(trimmed)) {
      if (switchDepth > 0) switchDepth += countChar(trimmed, '{') - countChar(trimmed, '}');
      return;
    }

    if (/^return\b/.test(trimmed)) {
      steps.push(makeStep('return', trimmed.replace(/;$/, ''), lineNumber, currentCase, activeBranch));
      return;
    }

    if (/^break\s*;/.test(trimmed)) return;

    const assignmentMatch = trimmed.match(/^([A-Za-z_]\w*)\s*=\s*(.+);$/);
    if (assignmentMatch) {
      steps.push(makeStep('statement', `${assignmentMatch[1]} = ${assignmentMatch[2]}`, lineNumber, currentCase, activeBranch));
      return;
    }

    const ioMatch = trimmed.match(/^(printf|scanf)\s*\((.*)\)\s*;$/);
    if (ioMatch) {
      steps.push(makeStep('io', summarizeIo(ioMatch[1], ioMatch[2]), lineNumber, currentCase, activeBranch));
      return;
    }

    if (switchDepth > 0) switchDepth += countChar(trimmed, '{') - countChar(trimmed, '}');
    if (switchDepth <= 0) currentCase = undefined;
  });

  return steps.slice(0, 32);
}

function makeStep(
  kind: FlowStep['kind'],
  label: string,
  line: number,
  parentCase?: string,
  activeBranch?: { ifId: string; branchKind: 'yes' | 'no' },
): FlowStep {
  return {
    id: safeId(`${kind}_${line}_${label}`).slice(0, 48),
    kind,
    label,
    line,
    parentCase,
    branchOf: activeBranch?.ifId,
    branchKind: activeBranch?.branchKind,
  };
}

function renderBranch(lines: string[], decisionId: string, branchSteps: FlowStep[], label: 'yes' | 'no'): void {
  if (!branchSteps.length) return;
  branchSteps.forEach((step) => lines.push(`  ${step.id}${shapeForStep(step)}`));
  lines.push(`  ${decisionId} -->|${label}| ${branchSteps[0].id}`);
  branchSteps.slice(1).forEach((step, index) => {
    lines.push(`  ${branchSteps[index].id} --> ${step.id}`);
  });
}

function shapeForStep(step: FlowStep): string {
  const label = mermaidLabel(step.label);
  if (step.kind === 'start' || step.kind === 'end') return `([${label}])`;
  if (step.kind === 'if' || step.kind === 'switch') return `{${label}}`;
  if (step.kind === 'case' || step.kind === 'default') return `{{${label}}}`;
  return `[${label}]`;
}

function summarizeIo(name: string, args: string): string {
  const firstString = args.match(/"([^"]*)"/)?.[1]?.replace(/\\n/g, '').trim();
  return firstString ? `${name}: ${firstString}` : `${name}()`;
}

function getFunctionBody(code: string, functionName: string): Array<{ line: string; lineNumber: number }> | null {
  const lines = stripCComments(code).split('\n');
  const startIndex = lines.findIndex((line) => new RegExp(`\\b${functionName}\\s*\\([^;]*\\)\\s*\\{`).test(line));
  if (startIndex < 0) return null;

  const body: Array<{ line: string; lineNumber: number }> = [];
  let depth = 0;
  for (let index = startIndex; index < lines.length; index += 1) {
    const line = lines[index];
    depth += countChar(line, '{');
    if (index > startIndex && depth > 0) body.push({ line, lineNumber: index + 1 });
    depth -= countChar(line, '}');
    if (index > startIndex && depth <= 0) break;
  }
  return body;
}

function countChar(value: string, char: string): number {
  return [...value].filter((item) => item === char).length;
}

function safeId(value: string): string {
  return value.replace(/[^A-Za-z0-9_]/g, '_');
}

function escapeMermaid(value: string): string {
  return value.replace(/"/g, "'").replace(/\]/g, ')').replace(/\[/g, '(');
}

function mermaidLabel(value: string): string {
  return `"${escapeMermaid(value)}"`;
}
