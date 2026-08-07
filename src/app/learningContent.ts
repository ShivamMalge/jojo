import answersMarkdown from '../../files/Complete_Beginner_C_Programming_Answers_1_to_50.md?raw';
import cheatSheetMarkdown from '../../files/Fun_with_C_Ultimate_CheatSheet.md?raw';
import questionsMarkdown from '../../files/50_Beginner_C_Programming_Questions.md?raw';

export interface PracticeQuestion {
  id: number;
  title: string;
  explanation?: string;
  answer?: string;
}

export interface CheatSection {
  id: string;
  title: string;
  body: string;
}

export const practiceQuestions: PracticeQuestion[] = parseQuestions(questionsMarkdown).map((question) => ({
  ...question,
  answer: parseAnswers(answersMarkdown).get(question.id),
}));

export const cheatSections = parseCheatSections(cheatSheetMarkdown);

function parseQuestions(markdown: string): Array<{ id: number; title: string; explanation?: string }> {
  const boldMatches = [
    ...markdown.matchAll(/\*\*Q(\d+)\.\s+(.+?)\*\*\s*\nExplanation:\s*([\s\S]*?)(?=\n\n\*\*Q\d+\.|\n---|\s*$)/g),
  ];
  if (boldMatches.length) {
    return boldMatches.map((match) => ({
      id: Number(match[1]),
      title: match[2].trim(),
      explanation: match[3].trim(),
    }));
  }

  return markdown
    .split('\n')
    .map((line) => line.match(/^(\d+)\.\s+(.+)$/))
    .filter((match): match is RegExpMatchArray => Boolean(match))
    .map((match) => ({ id: Number(match[1]), title: match[2].trim() }));
}

function parseAnswers(markdown: string): Map<number, string> {
  const answers = new Map<number, string>();
  const matches = [...markdown.matchAll(/^### Q(\d+)\.\s+(.+?)\n([\s\S]*?)(?=^### Q\d+\.|\s*$)/gm)];
  matches.forEach((match) => {
    answers.set(Number(match[1]), `### ${match[2].trim()}\n${match[3].trim()}`);
  });
  return answers;
}

function parseCheatSections(markdown: string): CheatSection[] {
  const headingMatches = [...markdown.matchAll(/^##\s+(.+)$/gm)];

  return headingMatches.map((match, index) => {
    const nextMatch = headingMatches[index + 1];
    const sectionStart = match.index + match[0].length;
    const sectionEnd = nextMatch?.index ?? markdown.length;

    return {
      id: `cheat-${index + 1}`,
      title: match[1].replace(/^\d+\.\s*/, '').trim(),
      body: markdown.slice(sectionStart, sectionEnd).trim(),
    };
  });
}
