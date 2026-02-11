import type { Dispatch, SetStateAction } from 'react'
import {
  TWIST_COOLDOWN_PRESETS,
  TWIST_PROBABILITY_PRESETS,
} from '../constants'
import type { RouletteSettings, TwistType } from '../types'

type SettingsPanelProps = {
  open: boolean
  locked: boolean
  settings: RouletteSettings
  setSettings: Dispatch<SetStateAction<RouletteSettings>>
  onClose: () => void
}

const TWIST_TYPE_LABELS: Record<TwistType, string> = {
  bird: '鳥',
  wind: '風',
  sparkle: 'きらめき',
}

export const SettingsPanel = ({
  open,
  locked,
  settings,
  setSettings,
  onClose,
}: SettingsPanelProps) => {
  const update = (partial: Partial<RouletteSettings>) => {
    setSettings((previous) => ({ ...previous, ...partial }))
  }

  const updateTwistType = (type: TwistType, enabled: boolean) => {
    setSettings((previous) => ({
      ...previous,
      enabledTwistTypes: {
        ...previous.enabledTwistTypes,
        [type]: enabled,
      },
    }))
  }

  return (
    <div
      className={`fixed inset-0 z-50 transition ${
        open ? 'pointer-events-auto' : 'pointer-events-none'
      }`}
    >
      <button
        type="button"
        aria-label="設定を閉じる"
        className={`absolute inset-0 bg-slate-900/45 transition ${
          open ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
      />

      <aside
        className={`absolute right-0 top-0 h-full w-full max-w-md overflow-y-auto bg-white p-5 shadow-2xl transition-transform ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">設定</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-100"
          >
            閉じる
          </button>
        </div>

        {locked && (
          <p className="mb-4 rounded-lg bg-amber-100 px-3 py-2 text-sm font-semibold text-amber-700">
            回転中は変更できません
          </p>
        )}

        <div className="space-y-6">
          <section className="space-y-3 rounded-2xl border border-slate-200 p-4">
            <h3 className="text-lg font-bold text-slate-900">Twist設定</h3>

            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={settings.twistEnabled}
                disabled={locked}
                onChange={(event) => update({ twistEnabled: event.target.checked })}
              />
              Twist演出を有効化
            </label>

            <div>
              <p className="mb-2 text-sm font-semibold text-slate-700">発生率</p>
              <div className="flex flex-wrap gap-2">
                {TWIST_PROBABILITY_PRESETS.map((rate) => (
                  <button
                    type="button"
                    key={rate}
                    disabled={locked}
                    onClick={() => update({ twistProbability: rate })}
                    className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
                      settings.twistProbability === rate
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    } disabled:cursor-not-allowed disabled:bg-slate-200`}
                  >
                    {Math.round(rate * 100)}%
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm font-semibold text-slate-700">
                クールダウン回数
              </p>
              <div className="flex flex-wrap gap-2">
                {TWIST_COOLDOWN_PRESETS.map((count) => (
                  <button
                    type="button"
                    key={count}
                    disabled={locked}
                    onClick={() => update({ twistCooldownSpins: count })}
                    className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
                      settings.twistCooldownSpins === count
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    } disabled:cursor-not-allowed disabled:bg-slate-200`}
                  >
                    {count}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm font-semibold text-slate-700">Twist種別</p>
              <div className="space-y-1">
                {(Object.keys(TWIST_TYPE_LABELS) as TwistType[]).map((type) => (
                  <label
                    key={type}
                    className="flex items-center gap-2 text-sm text-slate-700"
                  >
                    <input
                      type="checkbox"
                      checked={settings.enabledTwistTypes[type]}
                      disabled={locked}
                      onChange={(event) => updateTwistType(type, event.target.checked)}
                    />
                    {TWIST_TYPE_LABELS[type]}
                  </label>
                ))}
              </div>
            </div>
          </section>

          <section className="space-y-3 rounded-2xl border border-slate-200 p-4">
            <h3 className="text-lg font-bold text-slate-900">マス目表示</h3>

            <label className="block text-sm font-semibold text-slate-700">
              セグメント表示スタイル
              <select
                value={settings.segmentStyle}
                disabled={locked}
                onChange={(event) =>
                  update({
                    segmentStyle: event.target.value as RouletteSettings['segmentStyle'],
                  })
                }
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              >
                <option value="solid">solid</option>
                <option value="striped">striped</option>
                <option value="outlined">outlined</option>
              </select>
            </label>

            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={settings.showDividers}
                disabled={locked}
                onChange={(event) => update({ showDividers: event.target.checked })}
              />
              区切り線を表示
            </label>

            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={settings.showLabels}
                disabled={locked}
                onChange={(event) => update({ showLabels: event.target.checked })}
              />
              ラベルを表示
            </label>

            <label className="block text-sm font-semibold text-slate-700">
              ラベル形式
              <select
                value={settings.labelMode}
                disabled={locked}
                onChange={(event) =>
                  update({ labelMode: event.target.value as RouletteSettings['labelMode'] })
                }
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              >
                <option value="full">full</option>
                <option value="initial">initial</option>
                <option value="number">number</option>
              </select>
            </label>

            <label className="block text-sm font-semibold text-slate-700">
              配色
              <select
                value={settings.colorScheme}
                disabled={locked}
                onChange={(event) =>
                  update({
                    colorScheme: event.target.value as RouletteSettings['colorScheme'],
                  })
                }
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              >
                <option value="pastel">pastel</option>
                <option value="vivid">vivid</option>
                <option value="mono">mono</option>
              </select>
            </label>
          </section>
        </div>
      </aside>
    </div>
  )
}
