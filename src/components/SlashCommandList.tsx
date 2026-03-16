import React, {
  useState,
  useEffect,
  useCallback,
  useImperativeHandle,
  forwardRef,
  useMemo,
} from "react";
import { SlashCommandItem } from "./SlashCommands";

interface SlashCommandListProps {
  items: SlashCommandItem[];
  command: (item: SlashCommandItem) => void;
}

const SlashCommandList = forwardRef<any, SlashCommandListProps>(
  ({ items, command }, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0);

    const selectItem = useCallback(
      (index: number) => {
        const item = items[index];
        if (item) command(item);
      },
      [command, items]
    );

    useEffect(() => {
      setSelectedIndex(0);
    }, [items]);

    useImperativeHandle(ref, () => ({
      onKeyDown: ({ event }: { event: KeyboardEvent }) => {
        if (event.key === "ArrowUp") {
          setSelectedIndex((i) => (i - 1 + items.length) % items.length);
          return true;
        }
        if (event.key === "ArrowDown") {
          setSelectedIndex((i) => (i + 1) % items.length);
          return true;
        }
        if (event.key === "Enter") {
          selectItem(selectedIndex);
          return true;
        }
        return false;
      },
    }));

    // Group items by category
    const grouped = useMemo(() => {
      const map = new Map<string, SlashCommandItem[]>();
      let flatIdx = 0;
      const indexed: Array<SlashCommandItem & { flatIndex: number }> = items.map((item) => ({
        ...item,
        flatIndex: flatIdx++,
      }));
      indexed.forEach((item) => {
        if (!map.has(item.category)) map.set(item.category, []);
        map.get(item.category)!.push(item);
      });
      return { map, indexed };
    }, [items]);

    if (items.length === 0) {
      return (
        <div className="slash-command-menu">
          <div className="slash-menu-empty">No results — try a different keyword</div>
        </div>
      );
    }

    const categories = Array.from(grouped.map.keys());

    return (
      <div className="slash-command-menu">
        {categories.map((cat) => (
          <div key={cat} className="slash-menu-group">
            <div className="slash-menu-header">{cat}</div>
            {grouped.map.get(cat)!.map((item) => {
              const idx = grouped.indexed.findIndex((i) => i === item || (i.title === item.title && i.category === item.category));
              return (
                <button
                  key={item.title}
                  className={`slash-menu-item ${idx === selectedIndex ? "selected" : ""}`}
                  onClick={() => selectItem(idx)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                >
                  <span className="slash-menu-icon">{item.icon}</span>
                  <span className="slash-menu-text">
                    <span className="slash-menu-title">{item.title}</span>
                    <span className="slash-menu-description">{item.description}</span>
                  </span>
                </button>
              );
            })}
          </div>
        ))}
      </div>
    );
  }
);

SlashCommandList.displayName = "SlashCommandList";
export default SlashCommandList;
