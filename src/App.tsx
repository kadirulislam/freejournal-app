import { useState, useEffect, useCallback, useRef } from "react";
import Sidebar from "./components/Sidebar";
import Editor from "./components/Editor";
import DriveStatus from "./components/DriveStatus";
import { Journal } from "./types/journal";
import {
  getJournals,
  createJournal,
  saveJournal,
  deleteJournal,
} from "./lib/journalStore";
import {
  checkDriveConnection,
  loadFromDrive,
  saveToDrive,
  type DriveStatus as DriveStatusType,
} from "./lib/driveSync";

type SaveStatus = "idle" | "saving" | "saved";

export default function App() {
  const [journals, setJournals] = useState<Journal[]>([]);
  const [activeJournal, setActiveJournal] = useState<Journal | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [driveStatus, setDriveStatus] = useState<DriveStatusType>("disconnected");
  const [lastSynced, setLastSynced] = useState<Date | null>(null);
  const driveConnected = useRef(false);

  // ── Boot ──────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      // 1. Load from localStorage immediately
      let stored = getJournals();
      setJournals(stored);
      if (stored.length > 0) setActiveJournal(stored[0]);

      // 2. Check Drive connection
      setDriveStatus("connecting");
      const connected = await checkDriveConnection();
      driveConnected.current = connected;

      if (connected) {
        // 3. Merge with Drive (Drive wins for same IDs)
        const driveJournals = await loadFromDrive();
        if (driveJournals && driveJournals.length > 0) {
          // Merge: Drive journals override local, keep local-only ones
          const driveMap = new Map(driveJournals.map((j) => [j.id, j]));
          const localOnly = stored.filter((j) => !driveMap.has(j.id));
          const merged = [...driveJournals, ...localOnly].sort(
            (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          );
          merged.forEach((j) => saveJournal(j));
          setJournals(merged);
          if (merged.length > 0) setActiveJournal(merged[0]);
        }
        setDriveStatus("synced");
        setLastSynced(new Date());
      } else {
        setDriveStatus("disconnected");
      }
    })();
  }, []);

  // ── Drive sync ────────────────────────────────────────────
  const syncToDrive = useCallback(async (allJournals: Journal[]) => {
    if (!driveConnected.current) return;
    setDriveStatus("syncing");
    const ok = await saveToDrive(allJournals);
    if (ok) {
      setDriveStatus("synced");
      setLastSynced(new Date());
    } else {
      setDriveStatus("error");
    }
  }, []);

  const handleConnect = useCallback(() => {
    // Reload page — server will redirect to Google OAuth if not authenticated
    window.location.reload();
  }, []);

  // ── Journals ──────────────────────────────────────────────
  const handleNew = useCallback(async () => {
    const journal = createJournal();
    const updated = [journal, ...journals];
    setJournals(updated);
    setActiveJournal(journal);
    await syncToDrive(updated);
  }, [journals, syncToDrive]);

  const handleSelect = useCallback((journal: Journal) => {
    setActiveJournal(journal);
    setSaveStatus("idle");
  }, []);

  const handleUpdate = useCallback((updated: Journal) => {
    setActiveJournal(updated);
    setJournals((prev) => prev.map((j) => (j.id === updated.id ? updated : j)));
  }, []);

  const handleSaved = useCallback(
    async (updated: Journal) => {
      const allJournals = journals.map((j) => (j.id === updated.id ? updated : j));
      await syncToDrive(allJournals);
    },
    [journals, syncToDrive]
  );

  const handleDelete = useCallback(
    async (id: string) => {
      deleteJournal(id);
      const remaining = journals.filter((j) => j.id !== id);
      setJournals(remaining);
      if (activeJournal?.id === id) {
        setActiveJournal(remaining.length > 0 ? remaining[0] : null);
        setSaveStatus("idle");
      }
      await syncToDrive(remaining);
    },
    [journals, activeJournal, syncToDrive]
  );

  return (
    <div className="app-layout">
      <Sidebar
        journals={journals}
        activeId={activeJournal?.id ?? null}
        onSelect={handleSelect}
        onNew={handleNew}
        onDelete={handleDelete}
        driveStatus={driveStatus}
        lastSynced={lastSynced}
        onDriveConnect={handleConnect}
        onDriveSync={() => syncToDrive(journals)}
      />
      <main className="main-content">
        {activeJournal ? (
          <Editor
            key={activeJournal.id}
            journal={activeJournal}
            onUpdate={handleUpdate}
            saveStatus={saveStatus}
            setSaveStatus={setSaveStatus}
            onSaved={handleSaved}
          />
        ) : (
          <div className="empty-state">
            <div className="empty-state-inner">
              <div className="empty-icon">📓</div>
              <h2 className="empty-title">Welcome to FreeJournal</h2>
              <p className="empty-description">
                Your personal writing space. Start by creating a new journal.
              </p>
              <button onClick={handleNew} className="empty-cta">
                Create your first journal
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
