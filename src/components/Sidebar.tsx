import React, { useState, useMemo } from "react";
import { Journal } from "../types/journal";
import JournalCalendar from "./JournalCalendar";
import DriveStatus from "./DriveStatus";
import { DriveStatus as DriveStatusType } from "../lib/driveSync";

interface SidebarProps {
  journals: Journal[];
  activeId: string | null;
  onSelect: (journal: Journal) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  driveStatus: DriveStatusType;
  lastSynced: Date | null;
  onDriveConnect: () => void;
  onDriveSync: () => void;
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function formatDate(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

export default function Sidebar({
  journals,
  activeId,
  onSelect,
  onNew,
  onDelete,
  driveStatus,
  lastSynced,
  onDriveConnect,
  onDriveSync,
}: SidebarProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [calendarOpen, setCalendarOpen] = useState(true);

  const filteredJournals = useMemo(() => {
    if (!selectedDate) return journals;
    return journals.filter((j) => isSameDay(new Date(j.updatedAt), selectedDate));
  }, [journals, selectedDate]);

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm("Delete this journal?")) {
      onDelete(id);
    }
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-brand">
          <span className="sidebar-brand-icon">📓</span>
          <span className="sidebar-brand-name">FreeJournal</span>
        </div>
        <button onClick={onNew} className="new-journal-btn" title="New Journal">
          <span className="new-journal-icon">+</span>
        </button>
      </div>

      {/* Calendar toggle */}
      <button
        className="cal-toggle-btn"
        onClick={() => setCalendarOpen((o) => !o)}
        aria-expanded={calendarOpen}
      >
        <span className="cal-toggle-icon">📅</span>
        <span className="cal-toggle-label">Calendar</span>
        <span className={`cal-toggle-chevron ${calendarOpen ? "open" : ""}`}>›</span>
      </button>

      {calendarOpen && (
        <div className="cal-panel">
          <JournalCalendar
            journals={journals}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
          />
        </div>
      )}

      <div className="sidebar-section-label">
        {selectedDate
          ? selectedDate.toLocaleDateString([], { month: "short", day: "numeric" })
          : "All Journals"}
        {filteredJournals.length > 0 && (
          <span className="sidebar-count">{filteredJournals.length}</span>
        )}
      </div>

      <nav className="sidebar-nav">
        {filteredJournals.length === 0 && (
          <div className="sidebar-empty">
            {selectedDate ? (
              <>
                <p>No journals on this day.</p>
                <button
                  className="sidebar-empty-link"
                  onClick={() => setSelectedDate(null)}
                >
                  Show all →
                </button>
              </>
            ) : (
              <>
                <p>No journals yet.</p>
                <p>Click + to create one.</p>
              </>
            )}
          </div>
        )}
        {filteredJournals.map((journal) => (
          <div
            key={journal.id}
            className={`sidebar-item ${journal.id === activeId ? "active" : ""}`}
            onClick={() => onSelect(journal)}
          >
            <span className="sidebar-item-icon">📄</span>
            <div className="sidebar-item-content">
              <span className="sidebar-item-title">
                {journal.title || "Untitled"}
              </span>
              <span className="sidebar-item-date">{formatDate(journal.updatedAt)}</span>
            </div>
            <button
              className="sidebar-item-delete"
              onClick={(e) => handleDelete(e, journal.id)}
              title="Delete journal"
            >
              ×
            </button>
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <DriveStatus
          status={driveStatus}
          lastSynced={lastSynced}
          onConnect={onDriveConnect}
          onSync={onDriveSync}
        />
        <div className="sidebar-footer-text" style={{ marginTop: 6 }}>
          {selectedDate ? (
            <span>
              {filteredJournals.length} of {journals.length} journals &nbsp;
              <button className="footer-clear-link" onClick={() => setSelectedDate(null)}>
                Clear filter
              </button>
            </span>
          ) : (
            `${journals.length} journal${journals.length !== 1 ? "s" : ""}`
          )}
        </div>
      </div>
    </aside>
  );
}
