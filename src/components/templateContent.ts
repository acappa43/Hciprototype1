import type { Source, CustomTemplate } from '../App';

export function generateTemplateContent(
  selectedTemplate: string,
  activeSources: Source[],
  customTemplate?: CustomTemplate
): { title: string; html: string; text: string } {
  const sourceNames = activeSources.map(s => s.name.split(' ')[0]).join(', ');

  if (customTemplate) {
    return {
      title: `Generated Content: ${customTemplate.name} (Custom)`,
      html: `
        <div class="bg-emerald-100 p-6 rounded-lg border-l-4 border-[#10B981] shadow-lg">
          <h4 class="text-[#10B981] mb-3">AI Processing Custom Structure...</h4>
          <p class="text-gray-700 mb-2">The AI used the following instruction to generate your content from the active documents:</p>
          <p class="p-3 bg-white rounded-lg italic text-gray-600 border border-gray-300">${customTemplate.definition}</p>
          <p class="mt-4 text-gray-800">Simulated Output for "${customTemplate.name}":</p>
          <p class="text-gray-700 mt-2">Based on your definition, the key facts about the **National Assembly** (formed by the Third Estate) and the financial woes (War Debt) have been analyzed and presented in the requested structure. Please check the text file download for the complete, structured content.</p>
        </div>
      `,
      text: `CUSTOM TEMPLATE OUTPUT: ${customTemplate.name}\n\nAI Instruction Used:\n---\n${customTemplate.definition}\n---\n\nSIMULATED GENERATED CONTENT:\n\n[Content based on active sources and instruction]`
    };
  }

  switch (selectedTemplate) {
    case 'flashcards':
      return {
        title: `Generated Flashcards from: ${sourceNames}`,
        html: `
          <div class="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-500">
            <p class="text-yellow-800 mb-2">Flashcard Deck Ready! (12 Terms)</p>
            <p class="text-gray-700">Focus: Estates-General, National Assembly, Reign of Terror, War Debt.</p>
            <button class="mt-3 bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition">Start Flashcards</button>
          </div>
          <div class="mt-6 border-l-4 border-gray-300 pl-4 space-y-4">
            <h4 class="text-gray-800 mb-2">Term 1: Estates-General</h4>
            <p class="text-gray-700">**Definition:** Assembly representing the three estates of French society. Last convened in **1614** before the revolution.</p>
            <h4 class="text-gray-800 mb-2">Term 2: National Assembly</h4>
            <p class="text-gray-700">**Definition:** Formed by the representatives of the Third Estate; marked the **first formal act of the revolution**.</p>
          </div>
        `,
        text: `Flashcards:\n1. Estates-General | Definition: Assembly representing the three estates of French society. Last met in 1614.\n2. National Assembly | Definition: Formed by the representatives of the Third Estate; marked the first formal act of the revolution.\n3. Reign of Terror | Definition: Period of state-sanctioned violence (Sept 1793 – July 1794).`
      };

    case 'quiz':
      return {
        title: `Generated Multiple Choice Quiz from: ${sourceNames}`,
        html: `
          <div class="bg-red-50 p-4 rounded-lg border-l-4 border-red-500">
            <p class="text-red-800 mb-2">5-Question Practice Quiz</p>
            <p class="text-gray-700">This quiz focuses on the high-level concepts identified in your Syllabus and Notes.</p>
            <button class="mt-3 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition">Start Quiz</button>
          </div>
          <div class="mt-6 pt-4 border-t border-gray-200">
            <h4 class="text-gray-800 mb-2">Question 1/5</h4>
            <div class="p-4 bg-gray-50 rounded-lg shadow-sm">
              <p class="text-gray-800 mb-3">Which of the following was the primary financial pressure contributing to the French Revolution according to your Notes?</p>
              <div class="space-y-2">
                <label class="flex items-center">
                  <input type="radio" name="q1" class="text-[#10B981] focus:ring-[#10B981]">
                  <span class="ml-2 text-gray-700">A. Excessive spending by the Third Estate.</span>
                </label>
                <label class="flex items-center">
                  <input type="radio" name="q1" class="text-[#10B981] focus:ring-[#10B981]">
                  <span class="ml-2 text-gray-700">B. Massive debt from the Seven Years' War and American Revolution.</span>
                </label>
                <label class="flex items-center">
                  <input type="radio" name="q1" class="text-[#10B981] focus:ring-[#10B981]">
                  <span class="ml-2 text-gray-700">C. Cost of maintaining the Estates-General.</span>
                </label>
              </div>
            </div>
          </div>
        `,
        text: `Quiz:\nQ1. Primary financial pressure? A: Massive debt from the Seven Years' War and American Revolution.\nQ2. What percentage of the grade is the Essay? A: 40%.\nQ3. What year did the Estates-General last meet before the Revolution? A: 1614.`
      };

    case 'essay':
      return {
        title: `Generated Essay Prompts from: ${sourceNames}`,
        html: `
          <div class="border-l-4 border-purple-500 pl-4">
            <h4 class="text-purple-600 mb-2">3 Essay Prompts Ready</h4>
            <p class="text-gray-500 mb-3">The AI identified 3 key argumentative paths from your readings, focusing on the concepts of Monarchy vs. Republic, as noted in your sources.</p>
            <ul class="list-decimal ml-5 space-y-4 text-gray-700">
              <li>**Prompt 1 (Analysis):** Analyze how the financial pressures detailed in the Notes made the political structure (Monarchy vs. Republic) unstable, leading directly to the formation of the National Assembly.</li>
              <li>**Prompt 2 (Comparison):** Contrast the role and influence of the Estates-General with that of the National Assembly, using the dates provided in the Syllabus and Notes to support your argument for which body represented a true shift in power.</li>
              <li>**Prompt 3 (Synthesis):** Discuss the relationship between the Essay and Quiz components of the grading structure (Syllabus), and explain how studying the Reign of Terror (Syllabus) relates to understanding the larger causes (Notes).</li>
            </ul>
          </div>
        `,
        text: `Essay Prompts:\n1. Analyze how the financial pressures detailed in the Notes made the political structure (Monarchy vs. Republic) unstable, leading directly to the formation of the National Assembly.\n2. Contrast the role and influence of the Estates-General with that of the National Assembly.\n3. Discuss the relationship between the Essay and Quiz components of the grading structure (Syllabus), and explain how studying the Reign of Terror (Syllabus) relates to understanding the larger causes (Notes).`
      };

    case 't-chart':
      return {
        title: `T-Chart: Monarchy vs. Republic`,
        html: `
          <div class="border-l-4 border-pink-500 pl-4">
            <h4 class="text-pink-600 mb-4">T-Chart Analysis: Monarchy vs. Republic</h4>
            <p class="text-gray-500 mb-3">Comparing the two contrasting forms of government relevant to the Revolution, based on your Subject Notes.</p>
            <table class="w-full border-collapse">
              <thead class="bg-gray-100">
                <tr>
                  <th class="text-gray-800 w-1/2 border border-gray-200 p-4 text-left">Monarchy</th>
                  <th class="text-gray-800 w-1/2 border border-gray-200 p-4 text-left">Republic</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td class="border border-gray-200 p-4">**Key Characteristic:** Absolute or limited rule by a hereditary head of state. (Pre-1789 France)</td>
                  <td class="border border-gray-200 p-4">**Key Characteristic:** Head of state is usually an elected or appointed official. (Post-1792 France)</td>
                </tr>
                <tr>
                  <td class="border border-gray-200 p-4">**Status in Notes:** System that led to War Debt and reliance on the Estates-General (last met 1614).</td>
                  <td class="border border-gray-200 p-4">**Status in Notes:** Result of the Revolution, championed by the National Assembly. Aimed at solving the financial crisis.</td>
                </tr>
              </tbody>
            </table>
          </div>
        `,
        text: `T-Chart: Monarchy vs. Republic\nMonarchy: Absolute or limited rule by a hereditary head of state. System that led to War Debt.\nRepublic: Head of state is usually an elected or appointed official. Result of the Revolution, championed by the National Assembly.`
      };

    case 'outline':
      return {
        title: `Hierarchical Outline: Steps to Revolution`,
        html: `
          <div class="border-l-4 border-cyan-500 pl-4">
            <h4 class="text-cyan-600 mb-4">Outline of Revolutionary Steps</h4>
            <p class="text-gray-500 mb-3">Structured flow of events extracted from Notes (Section: Key Steps for Revolution).</p>
            <ul class="list-none space-y-2 text-gray-700">
              <li>**I. Roots of Crisis**</li>
              <ul class="list-disc ml-6 space-y-1">
                <li>A. Economic Crisis (Massive War Debt)</li>
                <li>B. Social Hierarchy Issues (Estates System)</li>
              </ul>
              <li>**II. Formal Political Breakdown**</li>
              <ul class="list-disc ml-6 space-y-1">
                <li>A. Estates-General Meeting (Last met 1614)</li>
                <li>B. Formation of the National Assembly (First formal act)</li>
              </ul>
              <li>**III. Violent Escalation**</li>
              <ul class="list-disc ml-6 space-y-1">
                <li>A. Storming of the Bastille</li>
                <li>B. The Reign of Terror (Sept 1793 – July 1794)</li>
              </ul>
            </ul>
          </div>
        `,
        text: `Hierarchical Outline:\nI. Roots of Crisis\n    A. Economic Crisis (Massive War Debt)\nII. Formal Political Breakdown\n    A. Estates-General Meeting (Last met 1614)\n    B. Formation of the National Assembly\nIII. Violent Escalation\n    A. Storming of the Bastille\n    B. The Reign of Terror (Sept 1793 – July 1794)`
      };

    case 'cornell':
      return {
        title: `Cornell Notes Template: The National Assembly`,
        html: `
          <div class="border-2 border-[#4F46E5] rounded-lg overflow-hidden">
            <div class="bg-[#4F46E5] text-white p-3 text-center">Topic: The National Assembly</div>
            <div class="min-h-[400px] flex flex-col">
              <div class="flex flex-grow">
                <div class="w-[30%] border-r border-gray-200 p-4 bg-gray-100">
                  <p class="text-gray-700 mb-2">CUES / QUESTIONS</p>
                  <p class="text-xs text-gray-600">Why was it formed?</p>
                  <p class="text-xs text-gray-600 mt-4">What was its significance?</p>
                </div>
                <div class="w-[70%] p-4">
                  <p class="text-gray-700 mb-2">NOTES AREA</p>
                  <ul class="list-disc ml-4 text-gray-700">
                    <li>Formed by the Third Estate representatives (who were locked out).</li>
                    <li>Considered the **first formal act of the revolution**.</li>
                    <li>A direct challenge to the power of the Monarchy and Estates-General.</li>
                  </ul>
                </div>
              </div>
              <div class="border-t border-gray-200 p-4 min-h-[80px] bg-indigo-100">
                <p class="text-gray-800 mb-1">SUMMARY (Based on Notes)</p>
                <p class="text-xs text-gray-700">The National Assembly was the critical point where the Third Estate broke from the old system (Estates-General) and started the revolution, transitioning France toward a new Republic model.</p>
              </div>
            </div>
          </div>
        `,
        text: `Cornell Notes: The National Assembly\nCUES: Why formed? What was its significance?\nNOTES: Formed by the Third Estate; First formal act of the revolution; Direct challenge to the Monarchy.\nSUMMARY: The National Assembly was the critical point where the Third Estate broke from the old system and started the revolution.`
      };

    case 'heuristics':
      return {
        title: `Heuristics Guide: Analyzing Historical Conflict`,
        html: `
          <div class="bg-yellow-100 p-6 rounded-lg border-2 border-yellow-500 shadow-lg">
            <h4 class="text-yellow-800 mb-4 flex items-center">
              <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              Conflict Analysis Heuristic (R.E.I.G.N.)
            </h4>
            <p class="text-gray-700 mb-4">Use this guide to break down any major conflict (e.g., The French Revolution) using steps inferred from your documents.</p>
            <ol class="space-y-3">
              <li class="p-3 bg-white rounded-lg border-l-4 border-red-500 shadow-sm">
                <span class="text-red-600">R: Root Causes.</span> Identify deep, long-term problems (e.g., War Debt, Estates System).
              </li>
              <li class="p-3 bg-white rounded-lg border-l-4 border-indigo-500 shadow-sm">
                <span class="text-indigo-600">E: Escalation Points.</span> Identify specific events that turned tension into conflict (e.g., Formation of National Assembly).
              </li>
              <li class="p-3 bg-white rounded-lg border-l-4 border-[#10B981] shadow-sm">
                <span class="text-[#10B981]">I: Ideals/Goals.</span> What were the driving philosophies? (e.g., Enlightenment, shift from Monarchy to Republic).
              </li>
              <li class="p-3 bg-white rounded-lg border-l-4 border-blue-500 shadow-sm">
                <span class="text-blue-600">G: Government Response.</span> How did the ruling power react? (e.g., Monarchy's debt management, Reign of Terror).
              </li>
              <li class="p-3 bg-white rounded-lg border-l-4 border-gray-500 shadow-sm">
                <span class="text-gray-600">N: New System.</span> What was the immediate result? (e.g., The Republic, new grading structure for this course).
              </li>
            </ol>
          </div>
        `,
        text: `Heuristics Guide: Conflict Analysis (R.E.I.G.N.)\nR: Root Causes (War Debt, Estates System).\nE: Escalation Points (National Assembly Formation).\nI: Ideals/Goals (Enlightenment, Monarchy vs Republic).\nG: Government Response (Reign of Terror).\nN: New System (The Republic).`
      };

    default:
      return {
        title: 'Template Not Found',
        html: '<p class="text-gray-700">Selected template could not be loaded.</p>',
        text: 'Template Not Found'
      };
  }
}
