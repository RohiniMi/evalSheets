# AutoGrade-ABESEC: Automated Handwritten Code Evaluation System
**Department of Computer Science & Engineering | ABES Engineering College, Ghaziabad**  
*(Affiliated to Dr. A.P.J. Abdul Kalam Technical University (AKTU), Lucknow | College Code: 032)*

---

## 🌟 Overview
**AutoGrade-ABESEC** is an automated web-based software suite engineered specifically for engineering colleges to streamline and standardize the evaluation of handwritten examination answer sheets. It bridges physical pen-and-paper code submissions with AST (Abstract Syntax Tree) verification and step-wise rubric scoring.

---

## 🏛️ Theme & Design Philosophy
- **Institutional Branding**: Designed around **ABES Engineering College (ABESEC)** official aesthetic — College Navy Blue (`#0f2d59`), Gold/Amber Accents (`#d97706`), Light Slate Academic Background (`#f8fafc`), clean white cards, and AKTU grading badges.
- **Split-Screen Verification**: Evaluators can view the scanned handwritten answer sheet on the left with zoom/pan and teacher red-ink markup, side-by-side with OCR code transcription, syntax observations, and step-wise rubric sliders on the right.

---

## 🚀 Key Features

### 1. 📋 Question Set & Step-Marking Rubrics
- Define questions with maximum marks, target language (C, C++, Java, Python), problem statements, and reference model code.
- **Granular Rubric Matrix**: Assign marks to individual code components (e.g., pointer declarations: 2m, traversal loop: 3m, reversal logic: 3m, complexity analysis: 2m).
- **Import / Export JSON**: Easily load existing question papers or download current configurations.

### 2. 📤 Bulk Answer Sheet Ingestion
- Drag-and-drop multi-file uploader supporting batch image formats (`.png`, `.jpg`, `.jpeg`) and scanned PDF pages.
- Automatic Roll Number, Student Name, and Section extraction from filenames (e.g. `2100320100099_Vikas_CSE_A.jpg`).
- Live batch queue status and preprocessing visualizer.

### 3. ⚡ Automated Code Evaluation Engine
- **OCR Transcription**: Simulates / performs neural optical character recognition on cursive and handwritten source code.
- **AST & Token Analysis**: Checks for required algorithmic keywords, invariants, brace balancing, pointer manipulation, and boundary checks.
- **Step-Marking Calculation**: Computes exact marks earned per rubric criterion and flags specific code lines with errors/warnings.
- **Faculty Override**: Evaluators have full authority to tweak marks with `+`/`-` steppers or sliders, adjust teacher notes, and recompute letter grades.

### 4. 📊 Gradebook & Academic Analytics
- KPI Dashboard: Total Submissions, Evaluated Count, Class Average, Highest Marks, Pass Rate.
- Filter by Section (`CSE-A`, `CSE-B`, `CSE-C`, etc.) or status (`Evaluated`, `Needs Review`, `Pending`).
- One-click export to **CSV (ERP format)**, **JSON (Backend dataset)**, and printable tabulation sheets.

---

## 📁 JSON Data Architecture
All configurations, question rubrics, and student evaluations are stored in human-readable, backend-swappable JSON files inside `backend/data/`:

| JSON File | Purpose |
|---|---|
| [`abesec_config.json`](file:///c:/Users/rohin/Desktop/evalByAntiGravity/backend/data/abesec_config.json) | College metadata, affiliation, course details, evaluator info, passing marks threshold, OCR parameters. |
| [`questions.json`](file:///c:/Users/rohin/Desktop/evalByAntiGravity/backend/data/questions.json) | Question paper bank, problem descriptions, model solutions, and step-wise rubrics with token requirements. |
| [`students_evaluations.json`](file:///c:/Users/rohin/Desktop/evalByAntiGravity/backend/data/students_evaluations.json) | Complete evaluation database containing student roll numbers, sections, transcribed code, rubric scores, and remarks. |

---

## 🛠️ How to Run

### Option 1: Unified Production Server (Recommended)
```powershell
cd c:\Users\rohin\Desktop\evalByAntiGravity\backend
node server.js
```
Open your browser at: **`http://localhost:5000`**

### Option 2: Live Development Mode
1. **Start Backend**:
   ```powershell
   cd c:\Users\rohin\Desktop\evalByAntiGravity\backend
   node server.js
   ```
2. **Start Frontend (Vite Dev Server)**:
   ```powershell
   cd c:\Users\rohin\Desktop\evalByAntiGravity\frontend
   npm run dev
   ```
   Open your browser at: **`http://localhost:3000`**
