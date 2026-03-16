export default function Toolbar({ editor }: any) {
  if (!editor) return null

  return (
    <div className="flex gap-2 mb-3">
      <button onClick={() => editor.chain().focus().toggleBold().run()}>
        Bold
      </button>

      <button onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
        H1
      </button>

      <button onClick={() => editor.chain().focus().toggleTaskList().run()}>
        Task
      </button>

      <button
        onClick={() =>
          editor.chain().focus().insertTable({ rows: 3, cols: 3 }).run()
        }
      >
        Table
      </button>
    </div>
  )
}