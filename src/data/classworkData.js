// Bihar AI Mission - Dynamic Classwork Utilities
// All tasks are fetched dynamically from the Supabase database (daily_tasks table).
// No tasks are hardcoded.

export const classworkAssignments = [];

export const trainerNoteData = {
  title: "Trainer's Note",
  content: "The objective of these exercises is to help officers move from awareness to practical application of AI in government work. Participants should verify AI-generated information before using it for official purposes and should avoid entering confidential, sensitive or personally identifiable information into tools unless the department has authorised such use.",
  source: "Government of Bihar, Information Technology Department communication on Artificial Intelligence (AI) based Solutions, Tools & Training, including Annexure-1 AI Tools List."
};

// Formatted plain text generator from dynamic tasks
export const generateClassworkText = (tasks = []) => {
  const taskItems = Array.isArray(tasks) ? tasks : [];
  let doc = `AI PRACTICAL CLASSWORK FOR GOVERNANCE\nBihar AI Mission | Practical Assignments (${taskItems.length} Total)\n\n`;

  taskItems.forEach((item) => {
    doc += `${item.num}. ${item.toolName || item.tool_name} — ${item.title}\n`;
    doc += `Classwork: ${item.classwork}\n`;
    doc += `Instructions: ${item.instructions}\n`;
    doc += `Final submission: \n`;
    const submissions = Array.isArray(item.finalSubmission)
      ? item.finalSubmission
      : Array.isArray(item.final_submission)
      ? item.final_submission
      : [];
    submissions.forEach((sub) => {
      doc += `•\t${sub}\n`;
    });
    doc += `\n`;
  });

  doc += `\n${trainerNoteData.title}\n`;
  doc += `${trainerNoteData.content}\n`;
  doc += `Source basis: ${trainerNoteData.source}\n`;

  return doc;
};

// Formatted Word Document (.doc) generator from dynamic tasks
export const generateClassworkDoc = (tasks = []) => {
  const taskItems = Array.isArray(tasks) ? tasks : [];

  return `<!DOCTYPE html>
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
<meta charset='utf-8'>
<title>AI Practical Classwork</title>
<style>
  body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #181512; margin: 40px; }
  h1 { color: #C1552C; font-size: 20pt; border-bottom: 2pt solid #C1552C; padding-bottom: 6pt; }
  h2 { color: #181512; font-size: 14pt; margin-top: 18pt; margin-bottom: 4pt; }
  p { font-size: 11pt; margin: 4pt 0; }
  ul { margin: 4pt 0 12pt 20pt; padding: 0; }
  li { font-size: 11pt; margin-bottom: 3pt; }
  .note-box { background: #FFF8EE; border-left: 4pt solid #C1552C; padding: 12pt; margin-top: 24pt; }
</style>
</head>
<body>
  <h1>AI Practical Classwork</h1>

  ${taskItems.map(item => {
    const subs = Array.isArray(item.finalSubmission)
      ? item.finalSubmission
      : Array.isArray(item.final_submission)
      ? item.final_submission
      : [];
    return `
    <div style="margin-bottom: 16pt;">
      <h2>${item.num}. ${item.toolName || item.tool_name} — ${item.title}</h2>
      <p><strong>Classwork:</strong> ${item.classwork || ''}</p>
      <p><strong>Instructions:</strong> ${item.instructions || ''}</p>
      <p><strong>Final submission:</strong></p>
      <ul>
        ${subs.map(sub => `<li>${sub}</li>`).join('')}
      </ul>
    </div>
  `;
  }).join('')}

  <div class="note-box">
    <h3>${trainerNoteData.title}</h3>
    <p>${trainerNoteData.content}</p>
    <p style="font-size: 9pt; color: #666; margin-top: 8pt;">${trainerNoteData.source}</p>
  </div>
</body>
</html>`;
};
