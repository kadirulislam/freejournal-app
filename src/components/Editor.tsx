import React, { useEffect, useRef, useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import StarterKit from "@tiptap/starter-kit";
import { Placeholder } from "@tiptap/extension-placeholder";
import { Image } from "@tiptap/extension-image";
import { TableKit } from "@tiptap/extension-table";
import { TaskList } from "@tiptap/extension-task-list";
import { TaskItem } from "@tiptap/extension-task-item";
import SlashCommands from "./SlashCommands";
import { Journal } from "../types/journal";
import { saveJournal } from "../lib/journalStore";

interface EditorProps {
  journal: Journal;
  onUpdate: (journal: Journal) => void;
  saveStatus: "idle" | "saving" | "saved";
  setSaveStatus: (status: "idle" | "saving" | "saved") => void;
  onSaved?: (updated: Journal) => void;
}

export default function Editor({ journal, onUpdate, saveStatus, setSaveStatus, onSaved }: EditorProps) {
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const titleRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Placeholder.configure({
        placeholder: ({ node }) => {
          if (node.type.name === "heading") return "Heading";
          return "Type '/' for commands, or start writing...";
        },
      }),
      Image.configure({ inline: false }),
      TableKit,
      TaskList,
      TaskItem.configure({ nested: true }),
      SlashCommands,
    ],
    content: journal.content || "",
    editorProps: {
      attributes: {
        class: "prose-editor focus:outline-none",
        spellcheck: "true",
      },
    },
    onUpdate: ({ editor }) => {
      const content = editor.getHTML();
      const updated = { ...journal, content, updatedAt: new Date().toISOString() };
      onUpdate(updated);
      setSaveStatus("saving");

      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        saveJournal(updated);
        setSaveStatus("saved");
        onSaved?.(updated);
        setTimeout(() => setSaveStatus("idle"), 2000);
      }, 2000);
    },
  });

  // Wire the hidden file input to the global trigger set by slash commands
  useEffect(() => {
    const input = document.getElementById("fj-image-upload") as HTMLInputElement | null;
    if (!input) return;

    const handleChange = (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = () => {
        const src = reader.result as string;
        const ed: any = (window as any).__fjPendingImageEditor || editor;
        const range = (window as any).__fjPendingImageRange;

        if (ed) {
          if (range) {
            ed.chain().focus().deleteRange(range).setImage({ src }).run();
          } else {
            ed.chain().focus().setImage({ src }).run();
          }
        }
        delete (window as any).__fjPendingImageRange;
        delete (window as any).__fjPendingImageEditor;
        (e.target as HTMLInputElement).value = "";
      };
      reader.readAsDataURL(file);
    };

    input.addEventListener("change", handleChange);
    return () => input.removeEventListener("change", handleChange);
  }, [editor]);

  useEffect(() => {
    if (!editor) return;
    const currentContent = editor.getHTML();
    if (currentContent !== journal.content) {
      editor.commands.setContent(journal.content || "", false);
    }
  }, [journal.id]);

  useEffect(() => {
    if (titleRef.current) {
      titleRef.current.value = journal.title;
    }
  }, [journal.id]);

  const handleTitleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const title = e.target.value;
      const updated = { ...journal, title, updatedAt: new Date().toISOString() };
      onUpdate(updated);
      setSaveStatus("saving");

      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        saveJournal(updated);
        setSaveStatus("saved");
        onSaved?.(updated);
        setTimeout(() => setSaveStatus("idle"), 2000);
      }, 2000);
    },
    [journal, onUpdate, setSaveStatus, onSaved]
  );

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      editor?.commands.focus("start");
    }
  };

  return (
    <div className="editor-wrapper">
      {/* Hidden image file input — triggered globally by slash commands */}
      <input
        id="fj-image-upload"
        ref={imageInputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
      />

      <div className="editor-header">
        <div className="save-indicator">
          {saveStatus === "saving" && (
            <span className="save-saving">
              <span className="save-dot saving-dot" />
              Saving...
            </span>
          )}
          {saveStatus === "saved" && (
            <span className="save-saved">
              <span className="save-dot saved-dot" />
              Saved
            </span>
          )}
        </div>
      </div>

      <div className="editor-content-area">
        <input
          ref={titleRef}
          type="text"
          className="journal-title-input"
          placeholder="Untitled"
          defaultValue={journal.title}
          onChange={handleTitleChange}
          onKeyDown={handleTitleKeyDown}
        />

        {editor && (
          <BubbleMenu
            editor={editor}
            tippyOptions={{ duration: 100, placement: "top" }}
            className="bubble-menu"
          >
            <button
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={`bubble-btn ${editor.isActive("bold") ? "active" : ""}`}
              title="Bold (⌘B)"
            >
              <strong>B</strong>
            </button>
            <button
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={`bubble-btn ${editor.isActive("italic") ? "active" : ""}`}
              title="Italic (⌘I)"
            >
              <em>I</em>
            </button>
            <button
              onClick={() => editor.chain().focus().toggleStrike().run()}
              className={`bubble-btn ${editor.isActive("strike") ? "active" : ""}`}
              title="Strikethrough"
            >
              <s>S</s>
            </button>
            <button
              onClick={() => editor.chain().focus().toggleCode().run()}
              className={`bubble-btn ${editor.isActive("code") ? "active" : ""}`}
              title="Inline code"
            >
              {"<>"}
            </button>
            <div className="bubble-divider" />
            <button
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              className={`bubble-btn ${editor.isActive("heading", { level: 1 }) ? "active" : ""}`}
              title="Heading 1"
            >
              H1
            </button>
            <button
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              className={`bubble-btn ${editor.isActive("heading", { level: 2 }) ? "active" : ""}`}
              title="Heading 2"
            >
              H2
            </button>
            <div className="bubble-divider" />
            <button
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className={`bubble-btn ${editor.isActive("bulletList") ? "active" : ""}`}
              title="Bullet List"
            >
              •
            </button>
            <button
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              className={`bubble-btn ${editor.isActive("blockquote") ? "active" : ""}`}
              title="Quote"
            >
              ❝
            </button>
          </BubbleMenu>
        )}

        <EditorContent editor={editor} className="tiptap-editor" />
      </div>
    </div>
  );
}
