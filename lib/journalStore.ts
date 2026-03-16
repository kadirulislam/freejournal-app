import { Journal } from "@/types/journal"
import { v4 as uuid } from "uuid"

const KEY = "freejournal_data"

export function getAllJournals(): Journal[] {
  if (typeof window === "undefined") return []

  const data = localStorage.getItem(KEY)
  return data ? JSON.parse(data) : []
}

export function saveJournal(journal: Journal) {
  const journals = getAllJournals()

  const exists = journals.find(j => j.id === journal.id)

  let updated

  if (exists) {
    updated = journals.map(j => (j.id === journal.id ? journal : j))
  } else {
    updated = [...journals, journal]
  }

  localStorage.setItem(KEY, JSON.stringify(updated))
}

export function createJournal(): Journal {
  return {
    id: uuid(),
    title: "Untitled",
    content: "",
    updatedAt: new Date().toISOString()
  }
}