import React, { useState } from 'react';
import { Volume2, FileText, MessageCircle, ChevronDown } from 'lucide-react';
import type { Source } from '../App';
import { DefaultStudyContent } from './DefaultStudyContent';

interface MainContentProps {
  sources: Source[];
  generatedContent: { title: string; html: string; text: string } | null;
  onOpenTemplateModal: () => void;
  onOpenChatModal: () => void;
  showNotification: (message: string, isError?: boolean) => void;
}

export function MainContent({
  sources,
  generatedContent,
  onOpenTemplateModal,
  onOpenChatModal,
  showNotification
}: MainContentProps) {
  const [saveMenuOpen, setSaveMenuOpen] = useState(false);

  const hasContent = generatedContent !== null;

  const handleSaveAs = (format: string) => {
    setSaveMenuOpen(false);
    if (format === 'Print') {
      showNotification('Opening print dialogue...');
      window.print();
    } else {
      showNotification(`Simulating save to **${format}**. Content saved locally as a **.txt** file.`);
    }
  };

  return (
    <section
      className="flex-1 p-4 sm:p-6 overflow-y-auto bg-[#F9FAFB]"
      style={{
        scrollbarWidth: 'thin',
        scrollbarColor: '#D1D5DB #F3F4F6'
      }}
    >
      {/* Sticky Menu Bar */}
      <div className="sticky top-0 z-10 bg-white p-4 rounded-lg shadow-xl mb-4 flex flex-col md:flex-row justify-between items-start md:items-center space-y-3 md:space-y-0">
        <h2 className="text-gray-800">Generated Study Content</h2>
        <div className="flex flex-wrap gap-3">
          {/* Audio Button */}
          <button
            disabled={!hasContent}
            className={`px-4 py-2 rounded-lg transition duration-150 shadow-md flex items-center ${
              hasContent
                ? 'bg-green-500 text-white hover:bg-green-600'
                : 'bg-gray-300 text-gray-700 cursor-not-allowed'
            }`}
          >
            <Volume2 className="w-5 h-5 mr-1" />
            Audio
          </button>

          {/* Template Button */}
          <button
            onClick={onOpenTemplateModal}
            className="bg-[#4F46E5] text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition duration-150 shadow-md"
          >
            <FileText className="w-5 h-5 inline-block -mt-0.5 mr-1" />
            Template
          </button>

          {/* ChatBot Button */}
          <button
            onClick={onOpenChatModal}
            className="bg-[#10B981] text-white px-4 py-2 rounded-lg hover:bg-emerald-600 transition duration-150 shadow-md"
          >
            <MessageCircle className="w-5 h-5 inline-block -mt-0.5 mr-1" />
            ChatBot
          </button>

          {/* Save/Print Dropdown */}
          <div className="relative inline-block text-left">
            <button
              disabled={!hasContent}
              onClick={() => setSaveMenuOpen(!saveMenuOpen)}
              className={`px-4 py-2 rounded-lg transition duration-150 shadow-md flex items-center ${
                hasContent
                  ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  : 'bg-gray-300 text-gray-700 cursor-not-allowed'
              }`}
            >
              <svg
                className="w-5 h-5 inline-block -mt-0.5 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7H5a2 2 0 00-2 2v8a2 2 0 002 2h14a2 2 0 002-2v-2m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              Save/Print
              <ChevronDown className="-mr-1 ml-2 h-5 w-5" />
            </button>

            {saveMenuOpen && hasContent && (
              <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                <div className="py-1">
                  <button
                    onClick={() => handleSaveAs('Word')}
                    className="text-gray-700 block w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    Save as Word (.docx)
                  </button>
                  <button
                    onClick={() => handleSaveAs('PDF')}
                    className="text-gray-700 block w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    Save as PDF (.pdf)
                  </button>
                  <button
                    onClick={() => handleSaveAs('Markdown')}
                    className="text-gray-700 block w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    Save as Markdown (.md)
                  </button>
                  <button
                    onClick={() => handleSaveAs('Excel')}
                    className="text-gray-700 block w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    Save as Excel (.xlsx)
                  </button>
                  <button
                    onClick={() => handleSaveAs('PowerPoint')}
                    className="text-gray-700 block w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    Save as PowerPoint (.pptx)
                  </button>
                  <button
                    onClick={() => handleSaveAs('HTML')}
                    className="text-gray-700 block w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    Save as HTML (.html)
                  </button>
                  <div className="border-t border-gray-100 my-1" />
                  <button
                    onClick={() => handleSaveAs('Print')}
                    className="text-gray-700 block w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    Print Document
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dynamic Output Content */}
      <div className="bg-white p-6 rounded-lg shadow-xl min-h-[60vh] overflow-hidden">
        {generatedContent ? (
          <div>
            <h3 className="text-gray-900 mb-4">{generatedContent.title}</h3>
            <div dangerouslySetInnerHTML={{ __html: generatedContent.html }} />
          </div>
        ) : (
          <DefaultStudyContent />
        )}
      </div>
    </section>
  );
}
