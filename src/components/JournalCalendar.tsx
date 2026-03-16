import React, { useState, useMemo } from "react";
import { Journal } from "../types/journal";

interface JournalCalendarProps {
  journals: Journal[];
  selectedDate: Date | null;
  onSelectDate: (date: Date | null) => void;
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function toKey(d: Date) {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function JournalCalendar({ journals, selectedDate, onSelectDate }: JournalCalendarProps) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const journalDaySet = useMemo(() => {
    const set = new Set<string>();
    journals.forEach((j) => {
      const d = new Date(j.updatedAt);
      set.add(toKey(d));
    });
    return set;
  }, [journals]);

  const journalCountByDay = useMemo(() => {
    const map = new Map<string, number>();
    journals.forEach((j) => {
      const d = new Date(j.updatedAt);
      const key = toKey(d);
      map.set(key, (map.get(key) || 0) + 1);
    });
    return map;
  }, [journals]);

  const days = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

    const cells: Array<{ date: Date; inMonth: boolean }> = [];

    for (let i = firstDay - 1; i >= 0; i--) {
      cells.push({ date: new Date(viewYear, viewMonth - 1, daysInPrevMonth - i), inMonth: false });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push({ date: new Date(viewYear, viewMonth, d), inMonth: true });
    }
    const remaining = 42 - cells.length;
    for (let d = 1; d <= remaining; d++) {
      cells.push({ date: new Date(viewYear, viewMonth + 1, d), inMonth: false });
    }

    return cells;
  }, [viewYear, viewMonth]);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };

  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const goToday = () => {
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
  };

  const handleDayClick = (date: Date, inMonth: boolean) => {
    if (!inMonth) {
      setViewYear(date.getFullYear());
      setViewMonth(date.getMonth());
    }
    if (selectedDate && isSameDay(selectedDate, date)) {
      onSelectDate(null);
    } else {
      onSelectDate(date);
    }
  };

  return (
    <div className="cal-root">
      <div className="cal-header">
        <button className="cal-nav-btn" onClick={prevMonth} title="Previous month">‹</button>
        <button className="cal-month-label" onClick={goToday} title="Go to today">
          {MONTHS[viewMonth]} {viewYear}
        </button>
        <button className="cal-nav-btn" onClick={nextMonth} title="Next month">›</button>
      </div>

      <div className="cal-grid">
        {DAYS.map((d) => (
          <div key={d} className="cal-day-header">{d}</div>
        ))}

        {days.map(({ date, inMonth }, idx) => {
          const key = toKey(date);
          const isToday = isSameDay(date, today);
          const isSelected = selectedDate ? isSameDay(selectedDate, date) : false;
          const hasJournals = journalDaySet.has(key);
          const count = journalCountByDay.get(key) || 0;

          return (
            <button
              key={idx}
              className={[
                "cal-day",
                !inMonth ? "cal-day-out" : "",
                isToday && !isSelected ? "cal-day-today" : "",
                isSelected ? "cal-day-selected" : "",
                hasJournals ? "cal-day-has-entries" : "",
              ].filter(Boolean).join(" ")}
              onClick={() => handleDayClick(date, inMonth)}
              title={hasJournals ? `${count} journal${count !== 1 ? "s" : ""}` : undefined}
            >
              <span className="cal-day-num">{date.getDate()}</span>
              {hasJournals && !isSelected && (
                <span
                  className={`cal-dot ${count > 1 ? "cal-dot-multi" : ""}`}
                />
              )}
            </button>
          );
        })}
      </div>

      {selectedDate && (
        <div className="cal-filter-bar">
          <span className="cal-filter-label">
            {selectedDate.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" })}
          </span>
          <button className="cal-clear-btn" onClick={() => onSelectDate(null)}>
            Clear ×
          </button>
        </div>
      )}
    </div>
  );
}
