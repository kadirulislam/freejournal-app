import { Journal } from "../types/journal";

const STORAGE_KEY = "freejournal_journals";

export function getJournals(): Journal[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Journal[];
  } catch {
    return [];
  }
}

export function saveJournal(journal: Journal): void {
  const journals = getJournals();
  const idx = journals.findIndex((j) => j.id === journal.id);
  if (idx !== -1) {
    journals[idx] = journal;
  } else {
    journals.unshift(journal);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(journals));
}

export function createJournal(): Journal {
  const journal: Journal = {
    id: crypto.randomUUID(),
    title: "Untitled",
    content: "",
    updatedAt: new Date().toISOString(),
  };
  saveJournal(journal);
  return journal;
}

export function deleteJournal(id: string): void {
  const journals = getJournals().filter((j) => j.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(journals));
}
