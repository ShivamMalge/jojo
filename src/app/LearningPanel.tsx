import { BookOpen, CheckCircle2, ListChecks, ChevronRight, ChevronLeft } from 'lucide-react';
import type { CheatSection, PracticeQuestion } from './learningContent';

interface LearningPanelProps {
  questions: PracticeQuestion[];
  selectedQuestion: PracticeQuestion;
  cheatSections: CheatSection[];
  selectedCheatId: string;
  onQuestionChange: (id: number) => void;
  onCheatChange: (id: string) => void;
}

export default function LearningPanel({
  questions,
  selectedQuestion,
  cheatSections,
  selectedCheatId,
  onQuestionChange,
  onCheatChange,
}: LearningPanelProps) {
  const selectedCheat = cheatSections.find((section) => section.id === selectedCheatId) || cheatSections[0];

  return (
    <section className="learning-panel" aria-label="Practice and cheatsheet">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Sequential Practice</p>
          <h2>Question {selectedQuestion.id} of {questions.length}</h2>
        </div>
        <ListChecks size={20} />
      </div>
      <div className="question-picker">
        <div className="sequential-controls" style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
          <button
            className="icon-text-button"
            type="button"
            disabled={selectedQuestion.id <= 1}
            onClick={() => onQuestionChange(selectedQuestion.id - 1)}
            style={{ padding: '6px 10px', fontSize: '0.85rem' }}
          >
            <ChevronLeft size={16} /> Prev
          </button>
          <select
            value={selectedQuestion.id}
            onChange={(event) => onQuestionChange(Number(event.target.value))}
            style={{ flex: 1, padding: '6px 8px', borderRadius: '6px', border: '1px solid var(--border-color, #ccc)' }}
          >
            {questions.map((question) => (
              <option key={question.id} value={question.id}>
                Q{question.id}. {question.title}
              </option>
            ))}
          </select>
          <button
            className="icon-text-button"
            type="button"
            disabled={selectedQuestion.id >= questions.length}
            onClick={() => onQuestionChange(selectedQuestion.id + 1)}
            style={{ padding: '6px 10px', fontSize: '0.85rem' }}
          >
            Next <ChevronRight size={16} />
          </button>
        </div>
        <div className="question-card">
          <strong>
            Q{selectedQuestion.id}. {selectedQuestion.title}
          </strong>
          <p>{selectedQuestion.explanation || 'Write the code yourself first. Run it to verify, then click Submit to record completion and proceed to next question.'}</p>
        </div>
      </div>
      <div className="cheatsheet">
        <div className="mini-heading with-icon">
          <BookOpen size={15} />
          CheatSheet
        </div>
        {selectedCheat ? (
          <>
            <div className="cheat-toc" aria-label="CheatSheet table of contents">
              <table>
                <thead>
                  <tr>
                    <th>Section</th>
                    <th>Topic</th>
                  </tr>
                </thead>
                <tbody>
                  {cheatSections.map((section, index) => (
                    <tr key={section.id} className={section.id === selectedCheat.id ? 'active' : ''}>
                      <td>{index + 1}</td>
                      <td>
                        <button type="button" onClick={() => onCheatChange(section.id)}>
                          {section.title}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="cheat-content">
              <div className="mini-heading with-icon">
                <CheckCircle2 size={15} />
                {selectedCheat.title}
              </div>
              <MarkdownLite markdown={selectedCheat.body} />
            </div>
          </>
        ) : (
          <div className="cheat-empty">No CheatSheet sections found.</div>
        )}
      </div>
    </section>
  );
}

function MarkdownLite({ markdown }: { markdown: string }) {
  const blocks = markdown.split(/```(?:c)?\n|```/g);
  return (
    <>
      {blocks.map((block, index) =>
        index % 2 === 1 ? (
          <pre className="cheat-code" key={index}>
            {block.trim()}
          </pre>
        ) : (
          <div className="cheat-copy" key={index}>
            {block
              .split('\n')
              .map((line) => line.trim())
              .filter(Boolean)
              .map((line, lineIndex) => (
                <p key={`${index}-${lineIndex}`}>{cleanMarkdownLine(line)}</p>
              ))}
          </div>
        ),
      )}
    </>
  );
}

function cleanMarkdownLine(line: string): string {
  return line
    .replace(/^[-|]+\s*$/g, '')
    .replace(/^[-✅❌]\s*/, '')
    .replace(/\*\*/g, '')
    .replace(/`/g, '');
}
