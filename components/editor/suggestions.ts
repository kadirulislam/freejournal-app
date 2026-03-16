import { ReactRenderer } from '@tiptap/react';
import tippy from 'tippy.js';
import SlashMenu from './SlashMenu'; //

export const suggestion = {
  char: '/',
  command: ({ editor, range, props }: any) => {
    props.command({ editor, range });
  },
  render: () => {
    let component: any;
    let popup: any;

    return {
      onStart: (props: any) => {
        // Bridges Tiptap logic to your SlashMenu component
        component = new ReactRenderer(SlashMenu, { 
          props, 
          editor: props.editor 
        });

        if (!props.clientRect) return;

        popup = tippy('body', {
          getReferenceClientRect: props.clientRect,
          appendTo: () => document.body,
          content: component.element,
          showOnCreate: true,
          interactive: true,
          trigger: 'manual',
          placement: 'bottom-start',
        });
      },
      onUpdate(props: any) {
        component.updateProps(props);
        if (!props.clientRect) return;
        popup[0].setProps({
          getReferenceClientRect: props.clientRect,
        });
      },
      onKeyDown(props: any) {
        if (props.event.key === 'Escape') {
          popup[0].hide();
          return true;
        }
        // Passes arrow keys to the SlashMenu
        return component.ref?.onKeyDown?.(props);
      },
      onExit() {
        popup[0].destroy();
        component.destroy();
      },
    };
  },
};