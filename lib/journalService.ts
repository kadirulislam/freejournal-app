import { v4 as uuid } from "uuid"

const STORAGE_KEY = "freejournal_entries"

export const getJournals = () => {
  const data = localStorage.getItem(STORAGE_KEY)
  return data ? JSON.parse(data) : []
}

export const saveJournal = (journal: any) => {
  const journals = getJournals()

  const updated = [...journals, journal]

  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
}

export const updateJournal = (journal: any) => {
  const journals = getJournals()

  const updated = journals.map((j: any) =>
    j.id === journal.id ? journal : j
  )

  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
}

export const createNewJournal = () => {
  return {
    id: uuid(),
    title: "Untitled",
    content: "",
    createdAt: new Date().toISOString()
  }
}