import { Quiz } from '../types/quiz';

export function downloadQuizJSON(quiz: Quiz) {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(quiz, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `${slugify(quiz.title)}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

export function downloadQuizMarkdown(quiz: Quiz) {
  let md = `# ${quiz.title}\n\n`;
  md += `> **Topic:** ${quiz.topic} | **Difficulty:** ${quiz.difficulty} | **Questions:** ${quiz.questions.length}\n\n`;
  if (quiz.description) {
    md += `${quiz.description}\n\n`;
  }
  md += `---\n\n## Questions\n\n`;

  quiz.questions.forEach((q, idx) => {
    md += `### ${idx + 1}. ${q.question}\n\n`;
    if (q.options && q.options.length > 0) {
      q.options.forEach((opt, oIdx) => {
        const letter = String.fromCharCode(65 + oIdx);
        md += `- **${letter})** ${opt}\n`;
      });
      md += `\n`;
    }
    md += `**Correct Answer:** ${q.correctAnswer}\n\n`;
    md += `**Explanation:** ${q.explanation}\n\n`;
    if (q.hint) {
      md += `*Hint:* ${q.hint}\n\n`;
    }
    if (q.keyConcept) {
      md += `*Core Concept:* ${q.keyConcept}\n\n`;
    }
    md += `---\n\n`;
  });

  const dataStr = 'data:text/markdown;charset=utf-8,' + encodeURIComponent(md);
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `${slugify(quiz.title)}-study-guide.md`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

export function downloadQuizCSV(quiz: Quiz) {
  // CSV Format: Question, Option A, Option B, Option C, Option D, Correct Answer, Explanation
  const rows: string[][] = [
    ['Question', 'Option A', 'Option B', 'Option C', 'Option D', 'Correct Answer', 'Explanation', 'Key Concept']
  ];

  quiz.questions.forEach((q) => {
    const opts = q.options || [];
    rows.push([
      escapeCsv(q.question),
      escapeCsv(opts[0] || ''),
      escapeCsv(opts[1] || ''),
      escapeCsv(opts[2] || ''),
      escapeCsv(opts[3] || ''),
      escapeCsv(q.correctAnswer),
      escapeCsv(q.explanation),
      escapeCsv(q.keyConcept || '')
    ]);
  });

  const csvContent = rows.map((e) => e.join(',')).join('\n');
  const dataStr = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent);
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `${slugify(quiz.title)}-anki-quizlet.csv`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

function escapeCsv(text: string): string {
  if (!text) return '""';
  const clean = text.replace(/"/g, '""');
  return `"${clean}"`;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}
