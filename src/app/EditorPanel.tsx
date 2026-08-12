import { useState } from 'react';
import { CheckCircle, Play, Sparkles } from 'lucide-react';
import type { RunResult } from './api';

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
            <pre className="output-panel-text" aria-live="polite">
              {formatOutput(output)}
            </pre>
          )}
        </div>
      </div>
    </section>
  );
}

function formatOutput(output: RunResult | null): string {
  if (!output) return '';

  const parts: string[] = [];

  if (output.compile_output) {
    parts.push(output.compile_output);
  }

  if (output.stdout) {
    parts.push(output.stdout);
  }

  if (output.stderr) {
    parts.push(output.stderr);
  }

  const isSuccess = output.status?.id === 3;
  if (isSuccess) {
    parts.push('\n=== Code Execution Successful ===');
  } else if (output.status?.description) {
    parts.push(`\n[${output.status.description}]`);
  }

  if (output.message) {
    parts.push(output.message);
  }

  return parts.filter(Boolean).join('\n');
}
