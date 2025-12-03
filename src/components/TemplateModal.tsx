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

// ---- layout styles (no Tailwind) ---- //

const overlayStyle: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  left: 0,
  top: 0,
  width: '100vw',
  height: '100vh',
  backgroundColor: 'rgba(0,0,0,0.6)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
};

const modalStyle: React.CSSProperties = {
  backgroundColor: '#ffffff',
  borderRadius: 16,
  width: '100%',
  maxWidth: 520,
  maxHeight: '80vh',
  boxShadow: '0 16px 40px rgba(15,23,42,0.35)',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
};

const headerStyle: React.CSSProperties = {
  padding: '16px 20px',
  borderBottom: '1px solid #e5e7eb',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
};

const bodyStyle: React.CSSProperties = {
  padding: '12px 20px 16px',
  overflowY: 'auto',
};

const footerStyle: React.CSSProperties = {
  padding: '10px 20px',
  borderTop: '1px solid #e5e7eb',
  display: 'flex',
  justifyContent: 'flex-end',
  gap: 8,
};

const sectionTitleStyle: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 600,
  color: '#374151',
  margin: '8px 0 4px',
};

const optionCardStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  border: '1px solid #e5e7eb',
  borderRadius: 10,
  padding: '8px 10px',
  marginBottom: 6,
  cursor: 'pointer',
  backgroundColor: '#ffffff',
};

const optionCardSelected: React.CSSProperties = {
  ...optionCardStyle,
  borderColor: '#4f46e5',
  boxShadow: '0 0 0 1px rgba(79,70,229,0.2)',
  backgroundColor: '#eef2ff',
};

const radioStyle: React.CSSProperties = {
  marginTop: 4,
};

const optionTextTitle: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 600,
  color: '#111827',
};

const optionTextDesc: React.CSSProperties = {
  fontSize: 11,
  color: '#6b7280',
  marginTop: 2,
};

// ---- template groups ---- //

const builtInTemplateGroups = [
  {
    title: 'General Study Guides',
    items: [
      {
        value: 'study-guide',
        label: 'G1. General Study Guide (Master)',
        description:
          'Lesson title, learning goals, notes, definitions, cheat sheet, and practice questions.',
      },
      {
        value: 'course-dashboard',
        label: 'G2. Course Overview / Dashboard',
        description:
          'Course snapshot with topic map, assessment weights, and rubric highlights from the syllabus.',
      },
    ],
  },
  {
    title: 'Quizzes & Tests',
    items: [
      {
        value: 'quiz-test-focus',
        label: 'Q1. Quiz / Test Focused Guide',
        description:
          'Targets what the syllabus says is on each quiz/test, plus high-yield concepts and practice questions.',
      },
      {
        value: 'quiz',
        label: 'Q2. Practice Quiz',
        description: '4–8 multiple-choice questions with an answer key.',
      },
      {
        value: 'exam-preview',
        label: 'Q3. Exam Preview (Mixed Format)',
        description:
          'Simulated exam with MC, short answer, and a mini essay, plus an answer key.',
      },
      {
        value: 'after-action',
        label: 'Q4. After-Action Review',
        description:
          'Model answers, self-check prompts, and source hints for reflection after a quiz/test.',
      },
    ],
  },
  {
    title: 'Pacing & Planning',
    items: [
      {
        value: 'pacing-plan',
        label: 'P1. Study Pacing Plan',
        description:
          'Turns exam coverage into a realistic multi-session study schedule.',
      },
    ],
  },
  {
    title: 'Other Formats',
    items: [
      {
        value: 'flashcards',
        label: 'F1. Flashcards',
        description: 'Simple Q&A flashcards for drilling key ideas and definitions.',
      },
      // You can add outline / cornell / etc back here if you want later
    ],
  },
];

// Templates that really need at least one Syllabus doc selected
const templatesRequiringSyllabus = new Set<string>([
  'course-dashboard',
  'quiz-test-focus',
  'exam-preview',
  'after-action',
  'pacing-plan',
]);

export function TemplateModal({
  customTemplates,
  selectedTemplate,
  onSelectTemplate,
  onClose,
  onOpenCustomCreator,
  onDeleteCustomTemplate,
  onApply,
  sources,
  showNotification,
}: TemplateModalProps) {
  const handleApply = () => {
    if (!selectedTemplate) {
      showNotification('Please choose a template first.', true);
      return;
    }

    if (templatesRequiringSyllabus.has(selectedTemplate)) {
      const hasSyllabusSelected = sources.some(
        (s) => s.checked && s.type === 'Syllabus'
      );
      if (!hasSyllabusSelected) {
        showNotification(
          'This template works best when at least one Syllabus document is selected.',
          true
        );
        return;
      }
    }

    onApply(selectedTemplate);
  };

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        {/* Header */}
        <div style={headerStyle}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>
              Apply Study Template
            </div>
            <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>
              Select an output format based on your active sources or create a
              custom one.
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              border: 'none',
              background: 'transparent',
              color: '#6b7280',
              fontSize: 18,
              cursor: 'pointer',
            }}
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div style={bodyStyle}>
          {builtInTemplateGroups.map((group) => (
            <div key={group.title} style={{ marginBottom: 10 }}>
              <div style={sectionTitleStyle}>{group.title}</div>
              {group.items.map((item) => {
                const selected = selectedTemplate === item.value;
                return (
                  <label
                    key={item.value}
                    style={selected ? optionCardSelected : optionCardStyle}
                  >
                    <input
                      type="radio"
                      name="template"
                      value={item.value}
                      checked={selected}
                      onChange={(e) => onSelectTemplate(e.target.value)}
                      style={radioStyle}
                    />
                    <div style={{ marginLeft: 8 }}>
                      <div style={optionTextTitle}>{item.label}</div>
                      <div style={optionTextDesc}>{item.description}</div>
                    </div>
                  </label>
                );
              })}
            </div>
          ))}

          {/* Custom templates */}
          <div
            style={{
              marginTop: 12,
              paddingTop: 8,
              borderTop: '1px solid #e5e7eb',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 6,
              }}
            >
              <div style={sectionTitleStyle}>
                Custom Templates ({customTemplates.length})
              </div>
              <button
                type="button"
                onClick={onOpenCustomCreator}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  fontSize: 11,
                  padding: '4px 8px',
                  borderRadius: 9999,
                  border: '1px solid #4f46e5',
                  backgroundColor: '#eef2ff',
                  color: '#4f46e5',
                  cursor: 'pointer',
                }}
              >
                <Plus size={12} style={{ marginRight: 4 }} />
                New Custom Template
              </button>
            </div>

            {customTemplates.length === 0 && (
              <div style={{ fontSize: 11, color: '#9ca3af' }}>
                Create your own reusable prompt shapes here.
              </div>
            )}

            {customTemplates.map((template, index) => (
              <div
                key={template.id}
                style={{
                  ...optionCardStyle,
                  borderColor: '#10b981',
                  backgroundColor: '#ecfdf5',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    cursor: 'pointer',
                    flex: 1,
                  }}
                >
                  <input
                    type="radio"
                    name="template"
                    value={template.value}
                    checked={selectedTemplate === template.value}
                    onChange={(e) => onSelectTemplate(e.target.value)}
                    style={radioStyle}
                  />
                  <span
                    style={{
                      marginLeft: 8,
                      fontSize: 13,
                      color: '#065f46',
                    }}
                  >
                    C{index + 1}. {template.name}
                  </span>
                </label>
                <button
                  type="button"
                  onClick={() => onDeleteCustomTemplate(template.id)}
                  title="Delete custom template"
                  style={{
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    color: '#b91c1c',
                    padding: 4,
                  }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={footerStyle}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '6px 14px',
              borderRadius: 9999,
              border: '1px solid #d1d5db',
              backgroundColor: '#f3f4f6',
              color: '#374151',
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            style={{
              padding: '6px 14px',
              borderRadius: 9999,
              border: 'none',
              backgroundColor: '#4f46e5',
              color: '#ffffff',
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            Generate
          </button>
        </div>
      </div>
    </div>
  );
}
