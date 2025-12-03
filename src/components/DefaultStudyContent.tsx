import React from 'react';

export function DefaultStudyContent() {
  return (
    <div className="prose max-w-none">
      <h2 className="text-gray-900 mb-2">Welcome to the Study Assistant</h2>

      <p className="text-gray-700">
        This tool helps you generate student-facing study resources from the documents you
        upload (syllabi, lecture notes, PDFs, etc.). Use the sidebar to add and select
        documents, then choose a template to generate a study guide, flashcards,
        quizzes, or pacing plans.
      </p>

      <div className="mt-4 space-y-3">
        <div>
          <strong>Quick steps</strong>
          <ol className="list-decimal ml-5 text-gray-700">
            <li>Select or upload one or more documents in the left sidebar.</li>
            <li>Click <em>Template</em> and pick the desired output (study guide, quiz, etc.).</li>
            <li>Click <em>Apply</em> to generate content from the selected sources.</li>
            <li>Use the Save/Print menu to export as HTML, Markdown, PDF, or Word.</li>
          </ol>
        </div>

        <div>
          <strong>Tips</strong>
          <ul className="list-disc ml-5 text-gray-700">
            <li>For best results, include a syllabus or any explicit coverage notes.</li>
            <li>PDF uploads are extracted automatically — the server will read text from them.</li>
            <li>If output looks escaped (e.g., literal markdown), make sure the generated
              content is displayed in the output panel (it is injected as HTML).</li>
          </ul>
        </div>

        <div>
          <strong>Privacy note</strong>
          <p className="text-gray-600">Uploaded documents are used only for generating content in your browser/session.</p>
        </div>
      </div>
    </div>
  );
}
