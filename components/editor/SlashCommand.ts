import { Extension } from '@tiptap/core';
import Suggestion from '@tiptap/suggestion';
import { suggestion } from './suggestions'; // Make sure this path is correct

export const SlashCommands = Extension.create({
  name: 'slashCommands',

  addOptions() {
    return {
      suggestion: {
       
        ...suggestion, // This merges your logic from suggestions.ts
      },
    };
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
      }),
    ];
  },
});