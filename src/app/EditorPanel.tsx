import { useState } from 'react';
import { CheckCircle, Play, Sparkles } from 'lucide-react';
import type { RunResult } from './api';
import { cleanStderr, describeRuntimeIssue, parseDiagnostics, type Diagnostic } from '../lib/diagnostics';

interface EditorPanelProps {
  code: string;
  output: RunResult | null;
  running: boolean;
  onCodeChange: (code: string) => void;
  onRunWithInput: (stdin: string) => void;
  onSubmit: () => void;
  submitting?: boolean;
  onExplain: () => void;
  compileCount: number;
  focusMinutes: number;
  username: string;
  onLogout: () => void;
}

export default function EditorPanel({
  code,
  output,
  running,
  onCodeChange,
  onRunWithInput,
  onSubmit,
  submitting,
  onExplain,
  compileCount,
  focusMinutes,
  username,
  onLogout,
}: EditorPanelProps) {
  const [inputText, setInputText] = useState('');
  const [waitingForInput, setWaitingForInput] = useState(false);
  const [compiledCode, setCompiledCode] = useState<string | null>(null);

  function handleRunClick() {
    setCompiledCode(code);
    if (waitingForInput) {
      // User already typed input, now execute
      onRunWithInput(inputText);
      setWaitingForInput(false);
    } else {
      // First click: check if code has scanf/gets — prompt for input
      const needsInput = /\b(scanf|gets|fgets|getchar|fgetc|getline)\s*\(/.test(code);
      if (needsInput) {
        setWaitingForInput(true);
      } else {
        onRunWithInput('');
      }
    }
  }

  function handleInputKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && e.ctrlKey) {
      setCompiledCode(code);
      onRunWithInput(inputText);
      setWaitingForInput(false);
    }
  }

  const hasCompiledCurrentCode = Boolean(compiledCode !== null && compiledCode === code);

  const isSuccess = Boolean(
    hasCompiledCurrentCode &&
    output &&
    output.status?.id === 3 &&
    !output.compile_output &&
    !output.stderr
  );

  const canSubmit = !running && !submitting && Boolean(code.trim()) && isSuccess;
  const submitTitle = !hasCompiledCurrentCode
    ? "You must compile and run your current code before submitting"
    : !isSuccess
    ? "Execute code successfully without errors before submitting"
    : "Submit answer and proceed to next question";

  return (
    <section className="editor-panel" aria-label="C editor">
      <div className="toolbar">
        <div>
          <p className="eyebrow">Jojo C IDE</p>
          <h1>Learn C by running it</h1>
          <div className="student-meta">
            <span>{username}</span>
            <span>{compileCount} compiles</span>
            <span>{focusMinutes} min focus</span>
          </div>
        </div>
        <div className="toolbar-actions">
          <button className="icon-button" onClick={onExplain} title="Ask Sensei to explain this code" aria-label="Ask Sensei to explain this code">
            <Sparkles size={18} />
          </button>
          <button className="run-button" onClick={handleRunClick} disabled={running || submitting}>
            <Play size={18} />
            {running ? 'Running...' : waitingForInput ? 'Execute' : 'Run'}
          </button>
          <button
            className="run-button"
            onClick={onSubmit}
            disabled={!canSubmit}
            style={{
              backgroundColor: canSubmit ? 'var(--success-color, #10b981)' : '#64748b',
              color: '#ffffff',
              opacity: canSubmit ? 1 : 0.6,
              cursor: canSubmit ? 'pointer' : 'not-allowed',
            }}
            title={submitTitle}
          >
            <CheckCircle size={18} />
            {submitting ? 'Submitting...' : 'Submit & Next'}
          </button>
          <button className="icon-text-button" onClick={onLogout}>
            Logout
          </button>
        </div>
      </div>
      <textarea
        className="code-editor"
        spellCheck={false}
        value={code}
        onChange={(event) => onCodeChange(event.target.value)}
        aria-label="C source code"
      />
      <div className="output-panel">
        <div className="output-panel-header">
          <span>Output</span>
        </div>
        <div className="output-panel-body">
          {waitingForInput ? (
            <>
              <div className="output-input-prompt">
                Program requires input. Type values below (one per line), then click <strong>Execute</strong> or press <kbd>Ctrl+Enter</kbd>:
              </div>
              <textarea
                className="output-input-area"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleInputKeyDown}
                placeholder={"e.g.\n10\n+\n5"}
                autoFocus
              />
            </>
          ) : running ? (
            <pre className="output-panel-text" aria-live="polite">
              {'Compiling & running...\n'}
            </pre>
          ) : (
            <OutputView output={output} />
          )}
        </div>
      </div>
    </section>
  );
}

function OutputView({ output }: { output: RunResult | null }) {
  if (!output) return <div className="output-panel-text" aria-live="polite" />;

  const stderr = cleanStderr(output.stderr);
  const diagnostics = parseDiagnostics([output.compile_output, stderr].filter(Boolean).join('\n'));
  const errors = diagnostics.filter((item) => item.severity === 'error');
  const warnings = diagnostics.filter((item) => item.severity === 'warning');
  const runtime = describeRuntimeIssue(output.status?.id, output.status?.description, output.stderr);
  const isSuccess = output.status?.id === 3;
  // Only fall back to the raw compiler dump when nothing could be parsed out of it.
  const unparsed = diagnostics.length === 0 && !runtime ? [output.compile_output, stderr].filter(Boolean).join('\n') : '';

  return (
    <div className="output-panel-text" aria-live="polite">
      {output.stdout ? <pre className="output-stdout">{output.stdout}</pre> : null}

      {errors.length > 0 ? (
        <div className="diagnostic-group">
          <div className="diagnostic-heading is-error">
            {errors.length === 1 ? '1 error' : errors.length + ' errors'} — fix these before running
          </div>
          {errors.map((item, index) => (
            <DiagnosticRow key={'error-' + index} diagnostic={item} />
          ))}
        </div>
      ) : null}

      {warnings.length > 0 ? (
        <div className="diagnostic-group">
          <div className="diagnostic-heading is-warning">
            {warnings.length === 1 ? '1 warning' : warnings.length + ' warnings'}
          </div>
          {warnings.map((item, index) => (
            <DiagnosticRow key={'warning-' + index} diagnostic={item} />
          ))}
        </div>
      ) : null}

      {runtime ? (
        <div className="diagnostic-group">
          <div className="diagnostic-heading is-error">{runtime.title}</div>
          {runtime.hint ? <p className="diagnostic-hint">{runtime.hint}</p> : null}
          {stderr && diagnostics.length === 0 ? <pre className="diagnostic-snippet">{stderr}</pre> : null}
        </div>
      ) : null}

      {unparsed ? <pre className="output-stdout">{unparsed}</pre> : null}
      {output.message ? <pre className="output-stdout">{output.message}</pre> : null}

      {isSuccess ? (
        <div className="diagnostic-success">
          === Code Execution Successful ==={output.time ? '  (' + output.time + 's)' : ''}
        </div>
      ) : null}
    </div>
  );
}

function DiagnosticRow({ diagnostic }: { diagnostic: Diagnostic }) {
  const location =
    diagnostic.line === undefined
      ? 'Linker'
      : 'Line ' + diagnostic.line + (diagnostic.column === undefined ? '' : ', Col ' + diagnostic.column);

  return (
    <div className="diagnostic-row">
      <div className="diagnostic-location">{location}</div>
      <div className="diagnostic-body">
        <span className={'diagnostic-severity is-' + diagnostic.severity}>{diagnostic.severity}</span>
        <span className="diagnostic-message">{diagnostic.message}</span>
        {diagnostic.snippet.length > 0 ? <pre className="diagnostic-snippet">{diagnostic.snippet.join('\n')}</pre> : null}
      </div>
    </div>
  );
}
