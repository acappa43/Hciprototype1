import React from 'react';

export function DefaultStudyContent() {
  return (
    <>
      <h3 className="text-gray-900 mb-4">
        Unified Study Guide: The French Revolution (1789-1799)
      </h3>

      <div className="space-y-6">
        {/* Key Concept Section */}
        <div className="border-l-4 border-[#10B981] pl-4">
          <h4 className="text-[#10B981] mb-2">Key Concepts & Definitions</h4>
          <p className="text-gray-500 mb-3">
            Generated from Syllabus Learning Objectives and Notes Definitions.
          </p>
          <ul className="list-disc ml-5 space-y-2 text-gray-700">
            <li className="group">
              <strong>Estates-General:</strong> Assembly representing the three estates of
              French society. Last met in 1614.
              <span className="text-xs text-blue-500 hover:text-blue-700 cursor-pointer ml-2 opacity-0 group-hover:opacity-100 transition duration-150">
                [Source: Syllabus, p. 2]
              </span>
            </li>
            <li className="group">
              <strong>National Assembly:</strong> Formed by the representatives of the Third
              Estate; marked the first formal act of the revolution.
              <span className="text-xs text-blue-500 hover:text-blue-700 cursor-pointer ml-2 opacity-0 group-hover:opacity-100 transition duration-150">
                [Source: Notes 10/24, ¶3]
              </span>
            </li>
            <li className="group">
              <strong>The Reign of Terror:</strong> Period of state-sanctioned violence and
              mass executions (Sept 1793 – July 1794).
              <span className="text-xs text-blue-500 hover:text-blue-700 cursor-pointer ml-2 opacity-0 group-hover:opacity-100 transition duration-150">
                [Source: Syllabus, p. 4]
              </span>
            </li>
          </ul>
        </div>

        {/* Pacing/Schedule Integration */}
        <div className="bg-indigo-50 p-4 rounded-lg border-l-4 border-[#4F46E5]">
          <h4 className="text-[#4F46E5] mb-2">Personalized Study Pacing</h4>
          <p className="text-gray-600">
            Based on the Syllabus (Exam Date: 11/30) and content length.
          </p>
          <div className="flex items-center mt-2 space-x-4">
            <span className="text-[#4F46E5] text-3xl">15 min</span>
            <span className="text-gray-700">Flashcards on Key Concepts.</span>
            <span className="text-xs text-gray-500 ml-auto">Due Today</span>
          </div>
        </div>

        {/* Auto-Generated Quiz Section */}
        <div className="pt-4 border-t border-gray-200">
          <h4 className="text-gray-800 mb-2">
            Practice Question (Template: Quiz)
          </h4>
          <p className="text-gray-500 mb-3">
            Generated from Notes section on Causes of the Revolution.
          </p>

          <div className="p-4 bg-gray-50 rounded-lg shadow-sm">
            <p className="text-gray-800 mb-3">
              Which of the following was a primary financial pressure contributing to the
              French Revolution?
            </p>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="q1"
                  className="text-[#10B981] focus:ring-[#10B981]"
                />
                <span className="ml-2 text-gray-700">
                  A. Trade tariffs on American goods.
                </span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="q1"
                  className="text-[#10B981] focus:ring-[#10B981]"
                />
                <span className="ml-2 text-gray-700">
                  B. The massive debt from the Seven Years' War and American Revolution.
                </span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="q1"
                  className="text-[#10B981] focus:ring-[#10B981]"
                />
                <span className="ml-2 text-gray-700">
                  C. Excessive spending by the Third Estate.
                </span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
