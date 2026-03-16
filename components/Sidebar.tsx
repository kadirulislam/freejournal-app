"use client"

import { Journal } from "@/types/journal"

export default function Sidebar({
  journals,
  onSelect,
  onNew
}: {
  journals: Journal[]
  onSelect: (j: Journal) => void
  onNew: () => void
}) {
  return (
    <div className="w-64 border-r bg-white p-4">

      <button
        onClick={onNew}
        className="w-full bg-blue-500 text-white py-2 rounded mb-4"
      >
        + New Journal
      </button>

      {journals.map(j => (
        <div
          key={j.id}
          onClick={() => onSelect(j)}
          className="cursor-pointer p-2 rounded hover:bg-gray-100"
        >
          {j.title}
        </div>
      ))}
    </div>
  )
}