import React, { forwardRef, useImperativeHandle, useState } from 'react';

// Using forwardRef allows the suggestion logic to trigger key events
const SlashMenu = forwardRef(({ items, command }: any, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const selectItem = (index: number) => {
    const item = items[index];
    if (item) command(item);
  };

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }: any) => {
      if (event.key === 'ArrowUp') {
        setSelectedIndex((selectedIndex + items.length - 1) % items.length);
        return true;
      }
      if (event.key === 'ArrowDown') {
        setSelectedIndex((selectedIndex + 1) % items.length);
        return true;
      }
      if (event.key === 'Enter') {
        selectItem(selectedIndex);
        return true;
      }
      return false;
    },
  }));

  return (
    <div className="bg-white shadow-xl border border-slate-200 rounded-lg overflow-hidden min-w-[280px] py-2 z-50">
      <div className="text-[10px] font-bold text-slate-400 px-4 py-2 uppercase">Basic Blocks</div>
      {items.map((item: any, index: number) => (
        <button
          key={index}
          onClick={() => selectItem(index)}
          className={`flex items-center w-full text-left px-4 py-2 text-sm transition-colors ${
            index === selectedIndex ? 'bg-slate-100 text-blue-600' : 'text-slate-700 hover:bg-slate-50'
          }`}
        >
          {item.title}
        </button>
      ))}
    </div>
  );
});

SlashMenu.displayName = 'SlashMenu';
export default SlashMenu;