import { useMemo, useState } from 'react'
import type { Student } from '../types'

type StudentEditorProps = {
  open: boolean
  students: Student[]
  locked: boolean
  onAddStudent: (name: string) => void
  onToggleAvailability: (id: string, isAvailable: boolean) => void
  onApplyBulk: (bulkText: string) => void
  onClose: () => void
}

export const StudentEditor = ({
  open,
  students,
  locked,
  onAddStudent,
  onToggleAvailability,
  onApplyBulk,
  onClose,
}: StudentEditorProps) => {
  const [newName, setNewName] = useState('')
  const [bulkText, setBulkText] = useState('')

  const availableCount = useMemo(
    () => students.filter((student) => student.isAvailable).length,
    [students],
  )

  const handleAddStudent = () => {
    const trimmed = newName.trim()
    if (!trimmed) {
      return
    }
    onAddStudent(trimmed)
    setNewName('')
  }

  const handleBulkApply = () => {
    if (!bulkText.trim()) {
      return
    }
    onApplyBulk(bulkText)
    setBulkText('')
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="student-editor-title"
      className={`fixed inset-0 z-50 transition ${open ? 'pointer-events-auto' : 'pointer-events-none'}`}
    >
      <button
        type="button"
        aria-label="生徒リストを閉じる"
        tabIndex={-1}
        disabled={!open}
        className={`absolute inset-0 bg-slate-900/45 transition ${open ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />

      <aside
        className={`absolute left-0 top-0 h-full w-full max-w-md overflow-y-auto bg-white p-5 shadow-2xl transition-transform ${open ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 id="student-editor-title" className="text-2xl font-bold text-slate-900">生徒リスト</h2>
            <p className="mt-1 text-sm text-slate-600">
              抽選対象 {availableCount} / 全体 {students.length}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-100"
          >
            閉じる
          </button>
        </div>

        <div className="mb-4 flex gap-2">
          <input
            type="text"
            value={newName}
            onChange={(event) => setNewName(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                handleAddStudent()
              }
            }}
            placeholder="生徒名を入力"
            disabled={locked}
            className="flex-1 rounded-xl border border-slate-300 px-3 py-2 text-base outline-none ring-indigo-300 transition focus:ring-2 disabled:bg-slate-100"
          />
          <button
            type="button"
            onClick={handleAddStudent}
            disabled={locked}
            className="rounded-xl bg-indigo-600 px-4 py-2 font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            追加
          </button>
        </div>

        <div className="max-h-[360px] space-y-2 overflow-y-auto rounded-2xl border border-slate-200 p-3">
          {students.length === 0 && (
            <p className="text-sm text-slate-500">まだ生徒が登録されていません。</p>
          )}

          {students.map((student, index) => (
            <div
              key={student.id}
              className="flex items-center gap-2 rounded-xl bg-slate-50 px-2 py-2"
            >
              <input
                type="checkbox"
                checked={student.isAvailable}
                onChange={(event) =>
                  onToggleAvailability(student.id, event.target.checked)
                }
                disabled={locked}
                className="h-4 w-4 rounded border-slate-300"
                title="抽選対象に含める"
              />

              <div className="min-w-0 flex-1 px-2 py-1.5 text-sm font-medium text-slate-700">
                {index + 1}番
              </div>

            </div>
          ))}
        </div>

        <div className="mt-5 space-y-2 rounded-2xl border border-slate-200 p-3">
          <p className="text-sm font-semibold text-slate-700">
            一括編集（改行区切り）
          </p>
          <textarea
            value={bulkText}
            onChange={(event) => setBulkText(event.target.value)}
            placeholder="例:\nあおい\nゆうた\nみさき"
            disabled={locked}
            rows={6}
            className="w-full resize-y rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none ring-indigo-300 transition focus:ring-2 disabled:bg-slate-100"
          />
          <button
            type="button"
            onClick={handleBulkApply}
            disabled={locked}
            className="rounded-xl bg-slate-700 px-4 py-2 font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            一括反映
          </button>
        </div>

        {locked && (
          <p className="mt-3 text-sm font-semibold text-amber-700">
            回転中は生徒編集できません
          </p>
        )}
      </aside>
    </div>
  )
}
