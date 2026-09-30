import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const studentsData = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'data', 'students_evaluations.json'), 'utf-8')
);

const outDir = path.join(__dirname, 'public', 'sample_sheets');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

function generateSvgSheet(student) {
  const width = 850;
  const height = 1150;
  
  // Format lines from student answer snippets
  let lines = [];
  student.answers.forEach((ans, qIdx) => {
    lines.push(`--- Ans ${qIdx + 1} (${ans.maxMarks} Marks) --- [Score: ${ans.marksObtained}/${ans.maxMarks}]`);
    const codeLines = ans.handwrittenSnippet.split('\n');
    codeLines.forEach(cl => lines.push(cl));
    lines.push(''); // blank line
  });

  const ruledLinesSvg = [];
  for (let y = 140; y < height - 40; y += 26) {
    ruledLinesSvg.push(`<line x1="40" y1="${y}" x2="${width - 40}" y2="${y}" stroke="#cbd5e1" stroke-width="0.8" />`);
  }

  const textLinesSvg = [];
  let currentY = 162;
  lines.forEach((line) => {
    if (currentY > height - 60) return;
    
    if (line.startsWith('--- Ans')) {
      textLinesSvg.push(`
        <text x="120" y="${currentY}" font-family="'Courier New', monospace" font-weight="bold" font-size="14" fill="#0f2d59">
          ${line}
        </text>
        <text x="${width - 150}" y="${currentY - 2}" font-family="'Caveat', cursive" font-weight="bold" font-size="19" fill="#dc2626">
          ✓ Checked
        </text>
      `);
    } else {
      // Escape XML characters
      const escaped = line
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');

      textLinesSvg.push(`
        <text x="125" y="${currentY}" font-family="'Caveat', 'Segoe Print', cursive" font-size="17" fill="#1e3a8a" letter-spacing="0.3">
          ${escaped}
        </text>
      `);
    }
    currentY += 26;
  });

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@600;700&amp;display=swap');
    </style>
    <filter id="paper-shadow" x="-5%" y="-5%" width="110%" height="110%">
      <feDropShadow dx="2" dy="4" stdDeviation="4" flood-opacity="0.15"/>
    </filter>
  </defs>

  <!-- Paper background -->
  <rect x="20" y="20" width="${width - 40}" height="${height - 40}" fill="#fffdfa" stroke="#cbd5e1" stroke-width="1.5" rx="4" filter="url(#paper-shadow)"/>

  <!-- Left red margin lines -->
  <line x1="110" y1="20" x2="110" y2="${height - 20}" stroke="#f87171" stroke-width="1.5" />
  <line x1="114" y1="20" x2="114" y2="${height - 20}" stroke="#fca5a5" stroke-width="0.8" />

  <!-- Ruled horizontal lines -->
  ${ruledLinesSvg.join('\n')}

  <!-- College Examination Sheet Header -->
  <rect x="40" y="35" width="${width - 80}" height="85" fill="#f0f7ff" stroke="#0f2d59" stroke-width="1.2" rx="4" />
  <text x="60" y="60" font-family="'Arial', sans-serif" font-weight="bold" font-size="16" fill="#0f2d59">ABES ENGINEERING COLLEGE, GHAZIABAD (AKTU Code: 032)</text>
  <text x="60" y="78" font-family="'Arial', sans-serif" font-size="12" fill="#475569">Department of Computer Science &amp; Engineering | Sessional Examination-II (2025-26)</text>
  
  <line x1="40" y1="88" x2="${width - 40}" y2="88" stroke="#cbd5e1" stroke-width="1" />
  
  <text x="60" y="105" font-family="'Arial', sans-serif" font-size="12" font-weight="600" fill="#1e293b">Roll No: <tspan fill="#0f2d59">${student.rollNo}</tspan></text>
  <text x="260" y="105" font-family="'Arial', sans-serif" font-size="12" font-weight="600" fill="#1e293b">Name: <tspan fill="#0f2d59">${student.studentName}</tspan></text>
  <text x="470" y="105" font-family="'Arial', sans-serif" font-size="12" font-weight="600" fill="#1e293b">Sec: <tspan fill="#0f2d59">${student.section}</tspan></text>
  <text x="590" y="105" font-family="'Arial', sans-serif" font-size="12" font-weight="600" fill="#1e293b">Sub: <tspan fill="#0f2d59">DSA (BCS-301)</tspan></text>
  
  <!-- Teacher Grading Stamp -->
  <g transform="translate(${width - 150}, 38)">
    <rect width="90" height="78" fill="#fef2f2" stroke="#dc2626" stroke-width="2" rx="6" stroke-dasharray="3,2" />
    <text x="45" y="24" font-family="'Arial', sans-serif" font-size="10" font-weight="bold" text-anchor="middle" fill="#dc2626">MARKS</text>
    <text x="45" y="52" font-family="'Arial', sans-serif" font-size="24" font-weight="bold" text-anchor="middle" fill="#dc2626">${student.totalMarksObtained}</text>
    <text x="45" y="70" font-family="'Arial', sans-serif" font-size="11" text-anchor="middle" fill="#991b1b">out of ${student.maxMarksTotal}</text>
  </g>

  <!-- Left Margin Annotations / Red Marks -->
  <text x="50" y="200" font-family="'Caveat', cursive" font-size="20" font-weight="bold" fill="#dc2626">Q.1</text>
  <text x="52" y="222" font-family="'Arial', sans-serif" font-size="12" font-weight="bold" fill="#dc2626">${student.answers[0]?.marksObtained || 0}m</text>

  <text x="50" y="520" font-family="'Caveat', cursive" font-size="20" font-weight="bold" fill="#dc2626">Q.2</text>
  <text x="52" y="542" font-family="'Arial', sans-serif" font-size="12" font-weight="bold" fill="#dc2626">${student.answers[1]?.marksObtained || 0}m</text>

  <text x="50" y="850" font-family="'Caveat', cursive" font-size="20" font-weight="bold" fill="#dc2626">Q.3</text>
  <text x="52" y="872" font-family="'Arial', sans-serif" font-size="12" font-weight="bold" fill="#dc2626">${student.answers[2]?.marksObtained || 0}m</text>

  <!-- Student Handwritten Text Content -->
  ${textLinesSvg.join('\n')}

  <!-- Evaluator Signature Stamp at bottom right -->
  <g transform="translate(${width - 240}, ${height - 85})">
    <path d="M 10 30 Q 35 5 60 25 T 110 20 T 150 28" fill="none" stroke="#dc2626" stroke-width="2" />
    <text x="80" y="45" font-family="'Arial', sans-serif" font-size="11" font-weight="600" text-anchor="middle" fill="#475569">Evaluator: Prof. Alok (CSE)</text>
    <text x="80" y="58" font-family="'Arial', sans-serif" font-size="10" text-anchor="middle" fill="#94a3b8">ABESEC Grading Cell</text>
  </g>
</svg>`;
}

studentsData.forEach(student => {
  const svg = generateSvgSheet(student);
  const filePath = path.join(outDir, `${student.id}.svg`);
  fs.writeFileSync(filePath, svg, 'utf-8');
  console.log(`Generated sheet: ${filePath}`);
});

console.log('All sample handwritten answer sheets generated successfully!');
