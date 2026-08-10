import { Play, Sparkles } from 'lucide-react';
import type { RunResult } from './api';

interface EditorPanelProps {
  code: string;
  stdin: string;
  output: RunResult | null;
  running: boolean;
  onCodeChange: (code: string) => void;
  onStdinChange: (stdin: string) => void;
  onRun: () => void;
  onExplain: () => void;
  compileCount: number;
  focusMinutes: number;
  username: string;
  onLogout: () => void;
}

export default function EditorPanel({
  code,
  stdin,
  output,
  running,
  onCodeChange,
  onStdinChange,
  onRun,
  onExplain,
  compileCount,
  focusMinutes,
  username,
  onLogout,
}: EditorPanelProps) {
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
          <button className="run-button" onClick={onRun} disabled={running}>
            <Play size={18} />
            {running ? 'Running' : 'Run'}
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
      {output && (
        <div className={`io-grid ${output ? 'has-output' : ''}`}>
          <label>
            <span>stdin</span>
            <textarea value={stdin} onChange={(event) => onStdinChange(event.target.value)} aria-label="Program input" />
          </label>
          <div className="terminal" aria-live="polite">
            <span>output</span>
            <pre>{formatOutput(output)}</pre>
          </div>
        </div>
      )}
    </section>
  );
}

function formatOutput(output: RunResult | null): string {
  if (!output) return 'Run your code to see compiler output here.';
  return [output.status?.description, output.stdout, output.stderr, output.compile_output, output.message].filter(Boolean).join('\n\n') || 'No output.';
}
