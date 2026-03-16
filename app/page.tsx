"use client"

import { useEffect, useState } from "react"
import Sidebar from "@/components/Sidebar"
import Editor from "@/components/editor/Editor"
import {
  getAllJournals,
  createJournal
} from "@/lib/journalStore"

export default function Home() {

  const [journals, setJournals] = useState<any[]>([])
  const [current, setCurrent] = useState<any>(null)

  useEffect(() => {
    const data = getAllJournals()
    setJournals(data)
  }, [])

  const handleNew = () => {
    const j = createJournal()
    setCurrent(j)
  }

  const handleSelect = (j: any) => {
    setCurrent(j)
  }

  return (
    <div className="flex h-screen bg-gray-50">

      <Sidebar
        journals={journals}
        onSelect={handleSelect}
        onNew={handleNew}
      />

      <div className="flex-1 p-12 overflow-auto">

        {current ? (
          <Editor
            journal={current ?? {}}
            setJournal={setCurrent}
          />
        ) : (
          <div className="text-gray-400">
            Select or create a journal
          </div>
        )}

      </div>

    </div>
  )
}