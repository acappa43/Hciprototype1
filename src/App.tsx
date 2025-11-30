import React, { useState } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { MainContent } from './components/MainContent';
import { TemplateModal } from './components/TemplateModal';
import { CustomTemplateCreatorModal } from './components/CustomTemplateCreatorModal';
import { ChatModal } from './components/ChatModal';
import { NotificationToast } from './components/NotificationToast';
import { Model } from './components/Model';

export interface Source {
  id: number;
  name: string;
  type: 'Syllabus' | 'Notes';
  checked: boolean;
  filepath: string;
  content: string;
  uploadStatus?: 'idle' | 'uploading' | 'processed' | 'failed';
}

export interface CustomTemplate {
  id: number;
  value: string;
  name: string;
  type: 'Custom';
  definition: string;
}

export default function App() {
  const [sources, setSources] = useState<Source[]>([]);

  const [customTemplates, setCustomTemplates] = useState<CustomTemplate[]>([
    {
      id: 8,
      value: 'custom-a-team-guide-action/target/result',
      name: 'A-Team Guide (Action/Target/Result)',
      type: 'Custom',
      definition: 'Generate a concise, three-part summary of the main historical event in the source material. Use the following structure, with bolded headings and short bullet points:\n\n1. A) ACTION (What was done?)\n2. T) TARGET (Who or what was the focus?)\n3. R) RESULT (What was the immediate consequence?).'
    }
  ]);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [customTemplateModalOpen, setCustomTemplateModalOpen] = useState(false);
  const [chatModalOpen, setChatModalOpen] = useState(false);
  const [notification, setNotification] = useState<{ message: string; isError: boolean } | null>(null);
  const [generatedContent, setGeneratedContent] = useState<{ title: string; html: string; text: string } | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState('flashcards');
  const [nextSourceId, setNextSourceId] = useState(3);
  const [nextCustomTemplateId, setNextCustomTemplateId] = useState(9);

  const showNotification = (message: string, isError: boolean = false) => {
    setNotification({ message, isError });
    setTimeout(() => setNotification(null), 3000);
  };

  const toggleSource = (id: number) => {
    setSources(sources.map(s => s.id === id ? { ...s, checked: !s.checked } : s));
    showNotification('Sources updated. Click "Template" to re-generate content.');
  };

  const toggleSelectAll = () => {
    const allChecked = sources.every(s => s.checked);
    setSources(sources.map(s => ({ ...s, checked: !allChecked })));
    showNotification(`All sources ${allChecked ? 'deselected' : 'selected'}.`);
  };

  const handleFileUpload = async (files: FileList) => {
    const baseId = nextSourceId;
    const newSources: Source[] = [];

    Array.from(files).forEach((file, idx) => {
      const isSyllabus = file.name.toLowerCase().includes('syllabus') || file.name.toLowerCase().includes('exam');
      const newSource: Source = {
        id: baseId + idx,
        name: file.name,
        type: isSyllabus ? 'Syllabus' : 'Notes',
        checked: true,
        filepath: file.name,
        content: `Uploading ${file.name}...`,
        uploadStatus: 'uploading'
      };
      newSources.push(newSource);
    });

    // Insert placeholders immediately
    setSources(prev => [...prev, ...newSources]);
    setNextSourceId(baseId + newSources.length);
    showNotification(`Uploading ${files.length} document(s) ...`);

    // Upload each file and update state (do not store remote URI in state)
    await Promise.all(
      Array.from(files).map(async (file, idx) => {
        const sourceId = baseId + idx;
        try {
          await Model.uploadLocalFile(file);
          setSources(prev =>
            prev.map(s =>
              s.id === sourceId
                ? { ...s, content: `Processed: ${file.name}`, uploadStatus: 'processed' }
                : s
            )
          );
          showNotification(`${file.name} uploaded and processed.`);
        } catch (err) {
          setSources(prev =>
            prev.map(s =>
              s.id === sourceId
                ? { ...s, content: `Failed to process ${file.name}`, uploadStatus: 'failed' }
                : s
            )
          );
          const errMsg = err instanceof Error ? err.message : 'Unknown error';
          showNotification(`Failed to upload ${file.name}: ${errMsg}`, true);
        }
      })
    );
  };

  const deleteCustomTemplate = (templateId: number) => {
    setCustomTemplates(customTemplates.filter(t => t.id !== templateId));
    showNotification('Custom template deleted successfully!');
  };

  const saveCustomTemplate = (name: string, definition: string) => {
    if (!name || !definition) {
      showNotification('Please provide both a name and a definition for your custom template.', true);
      return;
    }

    const newTemplate: CustomTemplate = {
      id: nextCustomTemplateId,
      value: `custom-${name.toLowerCase().replace(/\s+/g, '-')}`,
      name: name,
      type: 'Custom',
      definition: definition
    };

    setCustomTemplates([...customTemplates, newTemplate]);
    setNextCustomTemplateId(nextCustomTemplateId + 1);
    setCustomTemplateModalOpen(false);
    showNotification(`Custom template '${name}' saved successfully!`);
    setTemplateModalOpen(true);
    setSelectedTemplate(newTemplate.value);
  };

  const deleteSource = (id: number) => {
    setSources(sources.filter(s => s.id !== id));
    showNotification('Source deleted.');
  };

  return (
    <div className="h-screen flex flex-col bg-[#F9FAFB]">
      <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      
      <main className="flex flex-1 overflow-hidden">
        <Sidebar
          sources={sources}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onToggleSource={toggleSource}
          onToggleSelectAll={toggleSelectAll}
          onFileUpload={handleFileUpload}
          onDeleteSource={deleteSource}  // ← Add this
        />
        
        <MainContent
          sources={sources}
          generatedContent={generatedContent}
          onOpenTemplateModal={() => setTemplateModalOpen(true)}
          onOpenChatModal={() => setChatModalOpen(true)}
          showNotification={showNotification}
        />
      </main>

      {templateModalOpen && (
        <TemplateModal
          customTemplates={customTemplates}
          selectedTemplate={selectedTemplate}
          onSelectTemplate={setSelectedTemplate}
          onClose={() => setTemplateModalOpen(false)}
          onOpenCustomCreator={() => {
            setTemplateModalOpen(false);
            setCustomTemplateModalOpen(true);
          }}
          onDeleteCustomTemplate={deleteCustomTemplate}
          onApply={(template) => {
            setTemplateModalOpen(false);
            setGeneratedContent({
              title: `Generated Content: ${template}`,
              html: '',
              text: ''
            });
            showNotification(`Template '${template}' applied successfully!`);
          }}
          sources={sources}
          setGeneratedContent={setGeneratedContent}
          showNotification={showNotification}
        />
      )}

      {customTemplateModalOpen && (
        <CustomTemplateCreatorModal
          onClose={() => setCustomTemplateModalOpen(false)}
          onSave={saveCustomTemplate}
        />
      )}

      {chatModalOpen && (
        <ChatModal
          sources={sources}
          onClose={() => setChatModalOpen(false)}
        />
      )}

      {notification && (
        <NotificationToast
          message={notification.message}
          isError={notification.isError}
        />
      )}
    </div>
  );
}
