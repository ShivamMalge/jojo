import { BookOpen, CheckCircle2, ListChecks, Shuffle } from 'lucide-react';
import type { CheatSection, PracticeQuestion } from './learningContent';

interface LearningPanelProps {
  questions: PracticeQuestion[];
  selectedQuestion: PracticeQuestion;
  cheatSections: CheatSection[];
  selectedCheatId: string;
  onQuestionChange: (id: number) => void;
  onRandomQuestion: () => void;
  randomLocked: boolean;
  onCheatChange: (id: string) => void;
}

export default function LearningPanel({
  questions,
  selectedQuestion,
  cheatSections,
  selectedCheatId,
  onQuestionChange,
  onRandomQuestion,
  randomLocked,
  onCheatChange,
}: LearningPanelProps) {
  const selectedCheat = cheatSections.find((section) => section.id === selectedCheatId) || cheatSections[0];

  return (
    <section className="learning-panel" aria-label="Practice and cheatsheet">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Manual Coding</p>
          <h2>Practice question</h2>
        </div>
        <ListChecks size={20} />
      </div>
      <div className="question-picker">
        <label>
          <span>Question</span>
          <select value={selectedQuestion.id} disabled={randomLocked} onChange={(event) => onQuestionChange(Number(event.target.value))}>
            {questions.map((question) => (
              <option key={question.id} value={question.id}>
                Q{question.id}. {question.title}
              </option>
            ))}
          </select>
        </label>
        <button className="random-question-button" type="button" onClick={onRandomQuestion} disabled={randomLocked}>
          <Shuffle size={16} />
          {randomLocked ? 'Fixed until compile' : 'Random question'}
        </button>
        <div className="question-card">
          <strong>
            Q{selectedQuestion.id}. {selectedQuestion.title}
          </strong>
          <p>{selectedQuestion.explanation || 'Write the code yourself first. Run it, read the output, then use the cheatsheet if you get stuck.'}</p>
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
