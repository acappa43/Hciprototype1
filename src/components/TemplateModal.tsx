import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { Source, CustomTemplate } from '../App';

interface TemplateModalProps {
  customTemplates: CustomTemplate[];
  selectedTemplate: string;
  onSelectTemplate: (value: string) => void;
  onClose: () => void;
  onOpenCustomCreator: () => void;
  onDeleteCustomTemplate: (id: number) => void;
  onApply: (template: string) => void;
  sources: Source[];
  showNotification: (message: string, isError?: boolean) => void;
}

const defaultTemplates = [
  {
    id: 1,
    value: 'study-guide',
    name: 'General Study Guide: Lesson title, goals, notes, key terms & practice questions (recommended)',
  },
  {
    id: 9,
    value: 'quiz-test-focus',
    name: 'Quiz/Test Focus Study Guide: Quiz & test-specific coverage (uses syllabus)',
  },
  { id: 2, value: 'flashcards', name: 'Flashcards: Key Terms & Definitions (Ideal for memorization)' },
  { id: 3, value: 'quiz', name: 'Practice Quiz: Multiple Choice (Ideal for checking comprehension)' },
  { id: 4, value: 'essay', name: 'Essay Prompts: Generate 3 potential questions (Ideal for argumentative review)' },
  { id: 5, value: 't-chart', name: 'T-Chart: Compare & Contrast (Ideal for analyzing two concepts)' },
  { id: 6, value: 'outline', name: 'Hierarchical Outline: Main topics and sub-points (Ideal for structure review)' },
  { id: 7, value: 'cornell', name: 'Cornell Notes: Cues, Notes, and Summary (Ideal for active recall)' },
  { id: 8, value: 'heuristics', name: 'Heuristics Guide: Problem-Solving Steps (Specialized for technical topics)' },
];



export function TemplateModal({
  customTemplates,
  selectedTemplate,
  onSelectTemplate,
  onClose,
  onOpenCustomCreator,
  onDeleteCustomTemplate,
  onApply,
  sources,
  showNotification
}: TemplateModalProps) {
  const handleApply = () => {
    if (!selectedTemplate) {
      showNotification('Please select a template first.', true);
      return;
    }

    const activeSources = sources.filter(s => s.checked);
    if (activeSources.length === 0) {
      showNotification('Please select at least one source document.', true);
      return;
    }

    // Delegate the actual generation to the parent (Gemini call in App.tsx)
    onApply(selectedTemplate);
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center p-4 z-20">
      <div className="bg-white w-full max-w-lg p-6 rounded-xl shadow-2xl transform scale-100 transition-all duration-300">
        <h3 className="text-[#4F46E5] mb-4">Apply Study Template</h3>
        <p className="text-gray-600 mb-4">
          Select an output format based on your active sources or create a custom one:
        </p>

        <div
          className="space-y-3 max-h-80 overflow-y-auto pr-2"
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: '#D1D5DB #F3F4F6'
          }}
        >
          {defaultTemplates.map((template, index) => (
            <label
              key={template.id}
              className="block p-3 rounded-lg cursor-pointer transition border border-gray-200 hover:bg-indigo-50"
            >
              <input
                type="radio"
                name="template"
                value={template.value}
                checked={selectedTemplate === template.value}
                onChange={(e) => onSelectTemplate(e.target.value)}
                className="text-[#4F46E5] focus:ring-[#4F46E5]"
              />
              <span className="ml-3 text-gray-800">
                {index + 1}. {template.name}
              </span>
            </label>
          ))}

          {customTemplates.length > 0 && (
            <>
              <div className="mt-4 pt-2 border-t border-gray-200">
                <h4 className="text-gray-700 mb-2">
                  Custom Templates ({customTemplates.length})
                </h4>
              </div>
              {customTemplates.map((template, index) => (
                <div
                  key={template.id}
                  className="flex items-center p-3 border border-[#10B981] rounded-lg bg-emerald-50 hover:bg-emerald-100 transition"
                >
                  <label className="flex items-center cursor-pointer flex-1">
                    <input
                      type="radio"
                      name="template"
                      value={template.value}
                      checked={selectedTemplate === template.value}
                      onChange={(e) => onSelectTemplate(e.target.value)}
                      className="text-[#4F46E5] focus:ring-[#4F46E5]"
                    />
                    <span className="ml-3 text-gray-800">
                      C{index + 1}. {template.name}
                    </span>
                  </label>
                  <button
                    onClick={() => onDeleteCustomTemplate(template.id)}
                    className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-200 transition ml-2 z-40"
                    title="Delete Custom Template"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </>
          )}
        </div>

        <div className="mt-4 border-t border-gray-200 pt-4">
          <button
            onClick={onOpenCustomCreator}
            className="w-full bg-indigo-100 text-[#4F46E5] px-4 py-2 rounded-lg hover:bg-indigo-200 transition"
          >
            <Plus className="w-5 h-5 inline-block -mt-0.5 mr-1" />
            Create Custom Template
          </button>
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            className="px-4 py-2 bg-[#4F46E5] text-white rounded-lg hover:bg-indigo-700 transition"
          >
            Generate
          </button>
        </div>
      </div>
    </div>
  );
}
