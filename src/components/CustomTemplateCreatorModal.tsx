import React, { useState } from 'react';

interface CustomTemplateCreatorModalProps {
  onClose: () => void;
  onSave: (name: string, definition: string) => void;
}

export function CustomTemplateCreatorModal({
  onClose,
  onSave
}: CustomTemplateCreatorModalProps) {
  const [name, setName] = useState('');
  const [definition, setDefinition] = useState('');

  const handleSave = () => {
    onSave(name, definition);
    setName('');
    setDefinition('');
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center p-4 z-30">
      <div className="bg-white w-full max-w-2xl p-6 rounded-xl shadow-2xl transform scale-100 transition-all duration-300">
        <h3 className="text-[#10B981] mb-4">Define Custom Template</h3>
        <p className="text-gray-600 mb-4">
          Define the exact output structure you want the AI to follow. Use Markdown for formatting.
        </p>

        <div className="space-y-4">
          <div>
            <label htmlFor="custom-template-name" className="block text-gray-700 mb-1">
              Template Name (e.g., "Socratic Dialogue")
            </label>
            <input
              type="text"
              id="custom-template-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-[#10B981] focus:border-[#10B981]"
            />
          </div>
          <div>
            <label htmlFor="custom-template-definition" className="block text-gray-700 mb-1">
              AI Instruction/Structure Definition
            </label>
            <textarea
              id="custom-template-definition"
              rows={8}
              value={definition}
              onChange={(e) => setDefinition(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-[#10B981] focus:border-[#10B981]"
              placeholder="Example: Generate a 5-point, structured debate outline between two historical figures regarding the primary cause of the revolution. Use 'Figure A' and 'Figure B' as headings."
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-[#10B981] text-white rounded-lg hover:bg-emerald-600 transition"
          >
            Save & Use
          </button>
        </div>
      </div>
    </div>
  );
}
