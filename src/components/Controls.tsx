import type { RouletteState } from '../types'

type ControlsProps = {
  state: RouletteState
  canStart: boolean
  canSkip: boolean
  availableCount: number
  totalCount: number
  errorMessage: string
  skipRestorePreviousWinner: boolean
  onStart: () => void
  onSkip: (restorePreviousWinner: boolean) => void
  onReset: () => void
  onOpenSettings: () => void
  onChangeSkipRestore: (nextValue: boolean) => void
}

export const Controls = ({
  state,
  canStart,
  canSkip,
  availableCount,
  totalCount,
  errorMessage,
  skipRestorePreviousWinner,
  onStart,
  onSkip,
  onReset,
  onOpenSettings,
  onChangeSkipRestore,
}: ControlsProps) => {
  const rotationLocked =
    state === 'spinning' || state === 'fakeStop' || state === 'twistEvent'
  const buttonsLocked = state === 'countdown' || rotationLocked

  return (
    <section className="space-y-4 rounded-2xl bg-slate-50 p-4 shadow-sm">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onStart}
          disabled={!canStart}
          className="rounded-xl bg-indigo-600 px-6 py-3 text-lg font-bold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          スタート
        </button>

        <button
          type="button"
          onClick={() => onSkip(skipRestorePreviousWinner)}
          disabled={!canSkip || buttonsLocked}
          className="rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          次の人
        </button>

        <button
          type="button"
          onClick={onReset}
          disabled={buttonsLocked}
          className="rounded-xl bg-slate-700 px-5 py-3 font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          全員リセット
        </button>

        <button
          type="button"
          onClick={onOpenSettings}
          disabled={rotationLocked}
          className="rounded-xl border border-slate-300 bg-white px-4 py-3 font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="設定"
        >
          ⚙️ 設定
        </button>
      </div>

      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input
          type="checkbox"
          checked={skipRestorePreviousWinner}
          onChange={(event) => onChangeSkipRestore(event.target.checked)}
          disabled={buttonsLocked}
          className="h-4 w-4 rounded border-slate-300"
        />
        スキップ時に直前当選者を抽選対象へ戻す
      </label>

      <div className="rounded-xl bg-white px-4 py-3 text-sm text-slate-700">
        <p className="font-semibold">
          抽選対象: {availableCount} / {totalCount}
        </p>
        {availableCount === 0 && (
          <p className="mt-1 text-amber-700">全員当選済みです。全員リセットしてください。</p>
        )}
        {errorMessage && <p className="mt-1 text-rose-600">{errorMessage}</p>}
      </div>
    </section>
  )
}
