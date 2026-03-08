import { useMemo, useState } from 'react'
import { Controls } from '../components/Controls'
import { Pointer } from '../components/Pointer'
import { SettingsPanel } from '../components/SettingsPanel'
import { StudentEditor } from '../components/StudentEditor'
import { TwistEffect } from '../components/TwistEffect'
import { Wheel } from '../components/Wheel'
import { WinnerWidget } from '../components/WinnerWidget'

import { DEFAULT_SETTINGS, STORAGE_KEYS, createDefaultStudents } from '../constants'
import { useLocalStorageState } from '../hooks/useLocalStorageState'
import { useRouletteEngine } from '../hooks/useRouletteEngine'
import type { Student } from '../types'
import { createStudentId } from '../utils/roulette'

export const RoulettePage = () => {
  const [students, setStudents] = useLocalStorageState<Student[]>(
    STORAGE_KEYS.students,
    createDefaultStudents,
  )
  const [settings, setSettings] = useLocalStorageState(
    STORAGE_KEYS.settings,
    DEFAULT_SETTINGS,
  )
  const [isSettingsOpen, setSettingsOpen] = useState(false)
  const [isSidebarVisible, setSidebarVisible] = useLocalStorageState(
    STORAGE_KEYS.sidebarVisible,
    true,
  )

  const normalizedSettings = useMemo(
    () => ({
      ...DEFAULT_SETTINGS,
      ...settings,
    }),
    [settings],
  )

  const engine = useRouletteEngine({
    students,
    settings: normalizedSettings,
    setStudents,
  })


  const isEditingLocked = engine.isBusy

  const handleAddStudent = (name: string) => {
    if (isEditingLocked) {
      return
    }

    setStudents((previous) => [
      ...previous,
      {
        id: createStudentId(),
        name,
        isAvailable: true,
      },
    ])
  }


  const handleToggleAvailability = (id: string, isAvailable: boolean) => {
    if (isEditingLocked) {
      return
    }

    setStudents((previous) =>
      previous.map((student) =>
        student.id === id ? { ...student, isAvailable } : student,
      ),
    )
  }

  const handleApplyBulk = (bulkText: string) => {
    if (isEditingLocked) {
      return
    }

    const names = bulkText
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0)

    if (names.length === 0) {
      return
    }

    setStudents(
      names.map((name) => ({
        id: createStudentId(),
        name,
        isAvailable: true,
      })),
    )
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <header className="border-b border-slate-200 bg-white/85 backdrop-blur z-10 relative">
        <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between px-4 py-4 md:px-6">
          <div>
            <h1 className="text-2xl font-extrabold md:text-3xl">学級ルーレット</h1>
            <p className="hidden text-sm font-semibold text-slate-600 sm:block">
              公平抽選・非復元・Twist演出
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSettingsOpen(true)}
              disabled={engine.rotationPhaseLocked}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ⚙️ 設定
            </button>
            <button
              type="button"
              onClick={() => setSidebarVisible((prev) => !prev)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {isSidebarVisible ? 'リストを隠す' : 'リストを表示'}
            </button>
          </div>
        </div>
      </header>

      <main
        className="mx-auto grid w-full max-w-[1440px] gap-6 px-4 py-6 md:px-6"
      >
        <section className="rounded-3xl bg-white p-5 shadow-lg">
          <div className="relative mx-auto w-full max-w-[760px]">
            <div className="relative">
              <Pointer />
              <Wheel
                students={students
                  .map((student, index) => ({ ...student, originalIndex: index }))
                  .filter((student) => student.isAvailable)}
                settings={normalizedSettings}
                rotation={engine.rotation}
                transitionDurationMs={engine.transitionDurationMs}
                transitionEasing={engine.transitionEasing}
                winnerId={engine.winnerId}
                rouletteState={engine.state}
              />

              <TwistEffect
                active={engine.state === 'twistEvent'}
              />

              {engine.state === 'countdown' && (
                <div className="absolute inset-0 grid place-items-center">
                  <div className="rounded-2xl bg-slate-900/70 px-5 py-3 text-3xl font-black text-white">
                    START!
                  </div>
                </div>
              )}

              {engine.state === 'twistEvent' && engine.twistMessage && (
                <div className="absolute inset-0 grid place-items-center">
                  <div className="rounded-2xl bg-indigo-600/95 px-5 py-3 text-2xl font-black text-white shadow-xl">
                    {engine.twistMessage}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-5">
              <Controls
                state={engine.state}
                canStart={engine.canStart}
                availableCount={engine.availableCount}
                totalCount={students.length}
                errorMessage={engine.errorMessage}
                onStart={() => {
                  void engine.startSpin()
                }}
                onReset={engine.resetAll}
              />
            </div>
          </div>
        </section>
      </main>

      <StudentEditor
        open={isSidebarVisible}
        students={students}
        locked={isEditingLocked}
        onAddStudent={handleAddStudent}
        onToggleAvailability={handleToggleAvailability}
        onApplyBulk={handleApplyBulk}
        onClose={() => setSidebarVisible(false)}
      />

      <SettingsPanel
        open={isSettingsOpen}
        locked={engine.rotationPhaseLocked}
        settings={normalizedSettings}
        setSettings={setSettings}
        onClose={() => setSettingsOpen(false)}
      />

      {engine.state === 'result' && engine.winnerId && (
        <WinnerWidget
          winnerName={students.find((s) => s.id === engine.winnerId)?.name ?? '不明な生徒'}
          onClose={engine.clearResult}
        />
      )}
    </div>
  )
}
