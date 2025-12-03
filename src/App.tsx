import React, { useState } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { MainContent } from './components/MainContent';
import { TemplateModal } from './components/TemplateModal';
import { CustomTemplateCreatorModal } from './components/CustomTemplateCreatorModal';
import { ChatModal } from './components/ChatModal';
import { NotificationToast } from './components/NotificationToast';

export interface Source {
  id: number;
  name: string;
  type: 'Syllabus' | 'Notes';
  checked: boolean;
  filepath: string;
  content: string;       // for plain text docs (txt, md, etc.)
  rawData?: string;      // for PDFs: base64 data URL
}


export interface CustomTemplate {
  id: number;
  value: string;
  name: string;
  type: 'Custom';
  definition: string;
}

type GeneratedContent = { title: string; html: string; text: string };

export default function App() {
  const [sources, setSources] = useState<Source[]>([]);

  const [customTemplates, setCustomTemplates] = useState<CustomTemplate[]>([]);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [customTemplateModalOpen, setCustomTemplateModalOpen] = useState(false);
  const [chatModalOpen, setChatModalOpen] = useState(false);
  const [notification, setNotification] = useState<{ message: string; isError: boolean } | null>(null);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);

  const [selectedTemplate, setSelectedTemplate] = useState('study-guide');


  const [nextSourceId, setNextSourceId] = useState(1);
  const [nextCustomTemplateId, setNextCustomTemplateId] = useState(1);
  const [loading, setLoading] = useState(false);

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

  const deleteSource = (id: number) => {
    setSources(sources.filter(s => s.id !== id));
    showNotification('Document deleted.');
  };

  const handleFileUpload = (files: FileList) => {
  const fileArray = Array.from(files);

  const processFile = (file: File, index: number): Promise<Source> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      const lowerName = file.name.toLowerCase();

      const isPdf =
        file.type === 'application/pdf' || lowerName.endsWith('.pdf');

      const isSyllabus =
        lowerName.includes('syllabus') || lowerName.includes('exam');

      reader.onload = (event) => {
        const result = event.target?.result;

        if (result == null) {
          reject(new Error('Empty file result'));
          return;
        }

        // PDFs: store as data URL in rawData, leave content empty.
        if (isPdf) {
          const rawData = typeof result === 'string' ? result : '';
          const src: Source = {
            id: nextSourceId + index,
            name: file.name,
            type: isSyllabus ? 'Syllabus' : 'Notes',
            checked: true,
            filepath: file.name,
            content: '',      // server will extract text from rawData
            rawData,
          };
          resolve(src);
        } else {
          // Non-PDF: treat as plain text like before
          const text = typeof result === 'string' ? result : '';
          const src: Source = {
            id: nextSourceId + index,
            name: file.name,
            type: isSyllabus ? 'Syllabus' : 'Notes',
            checked: true,
            filepath: file.name,
            content: text,
          };
          resolve(src);
        }
      };

      reader.onerror = (error) => reject(error);

      if (isPdf) {
        // e.g. "data:application/pdf;base64,AAAA..."
        reader.readAsDataURL(file);
      } else {
        reader.readAsText(file);
      }
    });

  Promise.all(fileArray.map(processFile))
    .then((newSources) => {
      setSources((prev) => [...prev, ...newSources]);
      setNextSourceId((prev) => prev + newSources.length);
      showNotification(`Added ${newSources.length} document(s).`);
    })
    .catch((err) => {
      console.error(err);
      showNotification('Failed to read one of the files.', true);
    });
};



  const generateWithGemini = async (templateId: string, options: { showLoading?: boolean } = { showLoading: true }) => {
    const selectedSources = sources.filter((s) => s.checked);

    if (selectedSources.length === 0) {
      showNotification('Please select at least one document first.', true);
      return;
    }

    const { showLoading = true } = options;
    if (showLoading) setLoading(true);
    try {
      const res = await fetch('http://localhost:5001/generate_stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId,
          sources: selectedSources.map((s) => ({
            name: s.name,
            type: s.type,
            filepath: s.filepath,
            content: s.content,
            rawData: s.rawData,   // will be undefined for non-PDFs
          })),
        }),
      });

      if (!res.ok || !res.body) {
        throw new Error(`HTTP ${res.status}`);
      }

      // Initialize generated content so UI has something to append to
      setGeneratedContent({ title: `${templateId} result`, html: '', text: '' });

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let firstChunkReceived = false;
      let accumulatedText = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        // Split by newline to handle NDJSON (one JSON object per line)
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const obj = JSON.parse(line);
            if (obj.error) {
              throw new Error(obj.error);
            }

            const textChunk = obj.text || '';
            accumulatedText += textChunk;

            // Hide loading spinner on first chunk
            if (!firstChunkReceived && showLoading) {
              setLoading(false);
              firstChunkReceived = true;
            }

            // Update displayed content with accumulated text for streaming preview
            setGeneratedContent((prev) => {
              return {
                title: prev?.title || `${templateId} result`,
                html: accumulatedText,
                text: accumulatedText,
              } as GeneratedContent;
            });
          } catch (e) {
            console.error('Failed to parse stream line', e, line);
          }
        }
      }

      // Handle any trailing buffer
      if (buffer.trim()) {
        try {
          const obj = JSON.parse(buffer);
          if (!obj.error && obj.text) {
            accumulatedText += obj.text;
            setGeneratedContent((prev) => ({
              title: prev?.title || `${templateId} result`,
              html: accumulatedText,
              text: accumulatedText,
            } as GeneratedContent));
          }
        } catch (e) {
          console.error('Failed to parse trailing buffer', e, buffer);
        }
      }

      showNotification(`Generated with Gemini (${templateId}).`);
    } catch (err) {
      console.error(err);
      showNotification('Gemini request failed. Check server.', true);
    } finally {
      if (showLoading) setLoading(false);
    }
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
          onDeleteSource={deleteSource}
        />
        
        <MainContent
          sources={sources}
          generatedContent={generatedContent}
          loading={loading}
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
          onApply={async (templateId) => {
            setTemplateModalOpen(false);
            await generateWithGemini(templateId);
          }}
          sources={sources}
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
