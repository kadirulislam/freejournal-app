import { Extension } from "@tiptap/core";
import { Suggestion, type SuggestionOptions } from "@tiptap/suggestion";
import tippy, { Instance, GetReferenceClientRect } from "tippy.js";
import { ReactRenderer } from "@tiptap/react";
import SlashCommandList from "./SlashCommandList";

export interface SlashCommandItem {
  title: string;
  description: string;
  icon: string;
  category: string;
  keywords?: string[];
  command: (props: { editor: any; range: any }) => void;
}

const getSlashCommands = (): SlashCommandItem[] => [
  // ── TEXT ──
  {
    title: "Text",
    description: "Just start writing with plain text",
    icon: "¶",
    category: "Text",
    keywords: ["paragraph", "plain", "text", "p"],
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setParagraph().run();
    },
  },
  {
    title: "Heading 1",
    description: "Big title for a new section",
    icon: "H1",
    category: "Text",
    keywords: ["h1", "heading", "title", "big"],
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setNode("heading", { level: 1 }).run();
    },
  },
  {
    title: "Heading 2",
    description: "Medium-size section heading",
    icon: "H2",
    category: "Text",
    keywords: ["h2", "heading", "subtitle"],
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setNode("heading", { level: 2 }).run();
    },
  },
  {
    title: "Heading 3",
    description: "Small section heading",
    icon: "H3",
    category: "Text",
    keywords: ["h3", "heading", "small"],
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setNode("heading", { level: 3 }).run();
    },
  },
  {
    title: "Quote",
    description: "Capture a thought or highlight text",
    icon: "❝",
    category: "Text",
    keywords: ["blockquote", "quote", "callout"],
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setBlockquote().run();
    },
  },
  {
    title: "Divider",
    description: "Visually separate sections",
    icon: "─",
    category: "Text",
    keywords: ["divider", "hr", "rule", "line", "separator"],
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setHorizontalRule().run();
    },
  },

  // ── LISTS ──
  {
    title: "Bullet List",
    description: "Create a simple unordered list",
    icon: "•",
    category: "Lists",
    keywords: ["ul", "bullet", "list", "unordered"],
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleBulletList().run();
    },
  },
  {
    title: "Numbered List",
    description: "Create an ordered numbered list",
    icon: "1.",
    category: "Lists",
    keywords: ["ol", "ordered", "numbered", "list"],
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleOrderedList().run();
    },
  },
  {
    title: "To-do List",
    description: "Track tasks with checkboxes",
    icon: "☑",
    category: "Lists",
    keywords: ["todo", "task", "checkbox", "checklist"],
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleTaskList().run();
    },
  },

  // ── MEDIA ──
  {
    title: "Image from device",
    description: "Upload an image from your computer",
    icon: "⬆",
    category: "Media",
    keywords: ["image", "photo", "upload", "file", "picture"],
    command: ({ editor, range }) => {
      // Store context globally so the Editor file-picker can access it
      (window as any).__fjPendingImageRange = range;
      (window as any).__fjPendingImageEditor = editor;
      document.getElementById("fj-image-upload")?.click();
    },
  },
  {
    title: "Image from URL",
    description: "Embed an image via a web link",
    icon: "🌐",
    category: "Media",
    keywords: ["image", "url", "link", "embed", "web"],
    command: ({ editor, range }) => {
      const url = window.prompt("Paste an image URL:");
      if (url?.trim()) {
        editor.chain().focus().deleteRange(range).setImage({ src: url.trim() }).run();
      } else {
        editor.chain().focus().deleteRange(range).run();
      }
    },
  },

  // ── ADVANCED ──
  {
    title: "Table",
    description: "Insert a 3×3 table",
    icon: "⊞",
    category: "Advanced",
    keywords: ["table", "grid", "rows", "columns"],
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
        .run();
    },
  },
  {
    title: "Code Block",
    description: "Write code with syntax highlighting",
    icon: "</>",
    category: "Advanced",
    keywords: ["code", "codeblock", "snippet", "pre"],
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setCodeBlock().run();
    },
  },
];

const SlashCommands = Extension.create({
  name: "slashCommands",

  addOptions() {
    return {
      suggestion: {
        char: "/",
        command: ({ editor, range, props }: { editor: any; range: any; props: any }) => {
          props.command({ editor, range });
        },
      } as Partial<SuggestionOptions>,
    };
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
        items: ({ query }: { query: string }) => {
          const q = query.toLowerCase().trim();
          if (!q) return getSlashCommands();
          return getSlashCommands().filter(
            (item) =>
              item.title.toLowerCase().includes(q) ||
              item.description.toLowerCase().includes(q) ||
              item.keywords?.some((k) => k.includes(q))
          );
        },
        render: () => {
          let component: ReactRenderer;
          let popup: Instance[];

          return {
            onStart: (props: any) => {
              component = new ReactRenderer(SlashCommandList, {
                props,
                editor: props.editor,
              });

              popup = tippy("body", {
                getReferenceClientRect: props.clientRect as GetReferenceClientRect,
                appendTo: () => document.body,
                content: component.element,
                showOnCreate: true,
                interactive: true,
                trigger: "manual",
                placement: "bottom-start",
              });
            },

            onUpdate: (props: any) => {
              component.updateProps(props);
              popup[0]?.setProps({ getReferenceClientRect: props.clientRect });
            },

            onKeyDown: (props: any) => {
              if (props.event.key === "Escape") {
                popup[0]?.hide();
                return true;
              }
              return (component.ref as any)?.onKeyDown(props);
            },

            onExit: () => {
              popup[0]?.destroy();
              component.destroy();
            },
          };
        },
      }),
    ];
  },
});

export default SlashCommands;
