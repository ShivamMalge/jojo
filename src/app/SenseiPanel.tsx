import { Send, Lightbulb } from 'lucide-react';
import type { ChatMessage } from './api';

interface SenseiPanelProps {
  messages: ChatMessage[];
  draft: string;
  busy: boolean;
  enabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
  onDraftChange: (value: string) => void;
  onSend: () => void;
  onHint: () => void;
}

export default function SenseiPanel({ messages, draft, busy, enabled, onEnabledChange, onDraftChange, onSend, onHint }: SenseiPanelProps) {
  return (
    <section className={`sensei-panel ${enabled ? '' : 'disabled'}`} aria-label="Sensei chat">
      <div className="panel-header compact">
        <div>
          <p className="eyebrow">AI Sensei</p>
          <h2>{enabled ? 'Hints, not handoffs' : 'Assistant off'}</h2>
        </div>
        <div className="sensei-actions">
          <label className="toggle" title="Enable AI Sensei">
            <input type="checkbox" checked={enabled} onChange={(event) => onEnabledChange(event.target.checked)} />
            <span className="slider"></span>
            <span>{enabled ? 'On' : 'Off'}</span>
          </label>
          <button className="icon-button" onClick={onHint} disabled={busy || !enabled} title="Get a stuck hint" aria-label="Get a stuck hint">
            <Lightbulb size={18} />
          </button>
        </div>
      </div>
      <div className="messages">
        {!enabled ? (
          <div className="empty-chat">
            Manual coding comes first. Turn Sensei on when you want a small next-step hint.
          </div>
        ) : messages.length === 0 ? (
          <div className="empty-chat">
            Pause typing for 5 seconds, ask why an error happened, or request the next step.
          </div>
        ) : (
          messages.map((message, index) => (
            <div className={`message ${message.role}`} key={`${message.role}-${index}`}>
              <span>{message.role === 'assistant' ? 'Sensei' : 'You'}</span>
              <p>{message.content}</p>
            </div>
          ))
        )}
      </div>
      <form
        className="chat-form"
        onSubmit={(event) => {
          event.preventDefault();
          onSend();
        }}
      >
        <input value={draft} onChange={(event) => onDraftChange(event.target.value)} disabled={!enabled} placeholder="Ask about your C code..." />
        <button className="icon-button filled" disabled={busy || !enabled || !draft.trim()} aria-label="Send message">
          <Send size={18} />
        </button>
      </form>
    </section>
  );
}
