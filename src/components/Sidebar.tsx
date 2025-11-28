import React, { useRef } from 'react';
import { X } from 'lucide-react';
import type { Source } from '../App';

interface SidebarProps {
  sources: Source[];
  isOpen: boolean;
  onClose: () => void;
  onToggleSource: (id: number) => void;
  onToggleSelectAll: () => void;
  onFileUpload: (files: FileList) => void;
}

export function Sidebar({
  sources,
  isOpen,
  onClose,
  onToggleSource,
  onToggleSelectAll,
  onFileUpload
}: SidebarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileUpload(e.target.files);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const checkedCount = sources.filter(s => s.checked).length;
  const allChecked = sources.every(s => s.checked);

  return (
    <aside
      className={`w-full md:w-80 bg-white border-r border-gray-200 p-4 flex flex-col transition-all duration-300 ease-in-out md:static absolute z-10 h-full overflow-y-auto shadow-xl md:shadow-none ${
        isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}
      style={{
        scrollbarWidth: 'thin',
        scrollbarColor: '#D1D5DB #F3F4F6'
      }}
    >
      <h2 className="text-gray-800 mb-4 flex justify-between items-center">
        Sources & Input
        <button
          onClick={onClose}
          className="md:hidden text-gray-500 hover:text-gray-700"
        >
          <X className="w-6 h-6" />
        </button>
      </h2>

      {/* Document Upload */}
      <div className="mb-6 p-4 border-2 border-dashed border-[#4F46E5] rounded-lg text-center hover:bg-indigo-50 transition duration-200 cursor-pointer">
        <input
          ref={fileInputRef}
          type="file"
          id="document-upload"
          className="hidden"
          multiple
          onChange={handleFileChange}
        />
        <label htmlFor="document-upload" className="block py-2 cursor-pointer">
          <p className="text-[#4F46E5]">Click to Upload Documents</p>
          <p className="text-xs text-gray-500">Notes, Syllabi, PDFs, or Scans (AI will classify)</p>
        </label>
      </div>

      {/* Source List & Selection */}
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-gray-600">
          Active Sources (<span>{checkedCount}</span>)
        </h3>
        <button
          onClick={onToggleSelectAll}
          className="text-xs text-[#10B981] hover:text-emerald-600"
        >
          {allChecked ? 'Deselect All' : 'Select All'}
        </button>
      </div>

      <div className="space-y-3 flex-1 overflow-y-auto pr-1"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: '#D1D5DB #F3F4F6'
        }}
      >
        {sources.length === 0 ? (
          <p className="text-gray-500 p-2">No documents uploaded yet.</p>
        ) : (
          sources.map(source => {
            const typeColor = source.type === 'Syllabus' ? 'indigo' : 'emerald';
            return (
              <div
                key={source.id}
                className="flex items-center p-3 bg-gray-50 rounded-lg shadow-sm hover:bg-gray-100 transition"
              >
                <input
                  type="checkbox"
                  id={`source-${source.id}`}
                  checked={source.checked}
                  onChange={() => onToggleSource(source.id)}
                  className="w-4 h-4 text-[#4F46E5] bg-gray-100 border-gray-300 rounded focus:ring-[#4F46E5]"
                />
                <label
                  htmlFor={`source-${source.id}`}
                  className="ml-3 text-gray-700 truncate flex-1 cursor-pointer"
                >
                  {source.name}
                </label>
                <span
                  className={`ml-auto text-xs px-2 py-0.5 rounded-full ${
                    typeColor === 'indigo'
                      ? 'text-indigo-500 bg-indigo-100'
                      : 'text-emerald-500 bg-emerald-100'
                  }`}
                >
                  {source.type}
                </span>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
}
