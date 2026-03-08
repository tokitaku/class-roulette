import { useEffect } from 'react'
import type { RouletteState } from '../types'
import { isControlsLocked } from '../utils/stateHelpers'

type ControlsProps = {
  state: RouletteState
  canStart: boolean
  availableCount: number
  totalCount: number
  errorMessage: string
  onStart: () => void
  onReset: () => void
}

export const Controls = ({
  state,
  canStart,
  availableCount,
  totalCount,
  errorMessage,
  onStart,
  onReset,
}: ControlsProps) => {
  const buttonsLocked = isControlsLocked(state)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement instanceof HTMLInputElement ||
        document.activeElement instanceof HTMLTextAreaElement ||
        document.activeElement instanceof HTMLSelectElement
      ) {
        return
      }

      if (
        document.activeElement instanceof HTMLButtonElement &&
        (e.key === ' ' || e.key === 'Enter')
      ) {
        return
      }

      switch (e.key) {
        case ' ':
          e.preventDefault()
          if (canStart && !buttonsLocked) onStart()
          break
        case 'Enter':
        case 'r':
        case 'R':
        case 'Escape':
        case 'Backspace':
          e.preventDefault()
          if (!buttonsLocked) onReset()
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [canStart, buttonsLocked, onStart, onReset])

  return (
    <section className="space-y-4 rounded-2xl bg-white p-5 shadow-sm border border-slate-100 flex flex-col items-center">
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={onStart}
          disabled={!canStart || buttonsLocked}
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-8 py-3.5 text-xl font-bold text-white transition hover:bg-indigo-700 shadow hover:shadow-md disabled:shadow-none disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          スタート
          <kbd className="hidden font-sans rounded border border-indigo-400 bg-indigo-500 px-2 py-1 text-sm font-medium text-white shadow-sm sm:inline-block">Space</kbd>
        </button>

        <button
          type="button"
          onClick={onReset}
          disabled={buttonsLocked}
          className="flex items-center gap-2 rounded-xl bg-slate-700 px-6 py-3 font-semibold text-white transition hover:bg-slate-800 shadow hover:shadow-md disabled:shadow-none disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          全員リセット
          <kbd className="hidden font-sans rounded border border-slate-500 bg-slate-600 px-2 py-0.5 text-xs font-medium text-white shadow-sm sm:inline-block">Esc</kbd>
        </button>
      </div>

      <div className="flex flex-col items-center justify-center text-sm text-slate-500 mt-2">
        <p className="font-semibold text-slate-700 text-base">
          抽選対象: {availableCount} / {totalCount}
        </p>
        {availableCount === 0 && (
          <p className="mt-1 text-amber-600 font-medium">全員当選済みです。全員リセットしてください。</p>
        )}
        {errorMessage && <p className="mt-1 text-rose-500 font-medium">{errorMessage}</p>}
      </div>
    </section>
  )
}
