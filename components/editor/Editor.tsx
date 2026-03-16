"use client";

import { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus'; // Fixed import
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import { Table } from '@tiptap/extension-table'; // Fixed import
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { Bold, Italic, CheckSquare } from 'lucide-react';

// Custom Slash Command Logic
import { SlashCommands } from './SlashCommand';
import { suggestion } from './suggestions';

interface EditorProps {
  journal: any; 
  setJournal: (data: any) => void;
}

const Editor = ({ journal, setJournal }: EditorProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      TaskList,
      TaskItem.configure({
        nested: true, // Notion-style nesting
      }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      Placeholder.configure({
        placeholder: "Press '/' for commands...",
      }),
      SlashCommands.configure({
        suggestion: {
          ...suggestion, // Connects to your suggestions.ts
        }
      }),
    ],
    content: journal?.content || '',
    immediatelyRender: false, // Fix for SSR error
    editorProps: {
      attributes: {
        // Notion-like UI: uses tailwind typography 'prose'
        class: 'prose prose-lg prose-slate max-w-none focus:outline-none min-h-[500px] py-10 px-4',
      },
    },
    onUpdate: ({ editor }) => {
      // Immediate state update for local UI responsiveness
      const html = editor.getHTML();
      // Auto-save logic is handled by the useEffect below
    },
  });

  // --- Auto-save Implementation ---
  useEffect(() => {
    if (!editor) return;

    // Debounce: save 1 second after typing stops to preserve performance
    const timer = setTimeout(() => {
      const currentHTML = editor.getHTML();
      if (currentHTML !== journal.content) {
        setJournal({ ...journal, content: currentHTML });
        console.log("Journal auto-saved.");
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [editor?.getHTML(), journal, setJournal]);

  if (!editor) return null;

  return (
    <div className="max-w-4xl mx-auto group">
      <BubbleMenu 
        editor={editor} 
        className="flex bg-white shadow-xl border border-slate-200 rounded-lg overflow-hidden p-1"
      >
        <button 
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded hover:bg-slate-100 ${editor.isActive('bold') ? 'text-blue-600' : 'text-slate-600'}`}
        >
          <Bold size={18} />
        </button>
        <button 
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded hover:bg-slate-100 ${editor.isActive('italic') ? 'text-blue-600' : 'text-slate-600'}`}
        >
          <Italic size={18} />
        </button>
      </BubbleMenu>

      <div className="relative border border-transparent hover:border-slate-100 rounded-xl transition-all">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};

export default Editor;