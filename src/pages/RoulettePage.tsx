import { useMemo, useState } from 'react'
import { Controls } from '../components/Controls'
import { Pointer } from '../components/Pointer'
import { SettingsPanel } from '../components/SettingsPanel'
import { StudentEditor } from '../components/StudentEditor'
import { TwistEffect } from '../components/TwistEffect'
import { Wheel } from '../components/Wheel'
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
  const [skipRestorePreviousWinner, setSkipRestorePreviousWinner] = useState(false)

  const normalizedSettings = useMemo(
    () => ({
      ...DEFAULT_SETTINGS,
      ...settings,
      enabledTwistTypes: {
        ...DEFAULT_SETTINGS.enabledTwistTypes,
        ...settings.enabledTwistTypes,
      },
    }),
    [settings],
  )

  const engine = useRouletteEngine({
    students,
    settings: normalizedSettings,
    setStudents,
  })

  const currentWinner = useMemo(
    () => students.find((student) => student.id === engine.winnerId) ?? null,
    [engine.winnerId, students],
  )

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

  const handleDeleteStudent = (id: string) => {
    if (isEditingLocked) {
      return
    }

    setStudents((previous) => previous.filter((student) => student.id !== id))
  }

  const handleRenameStudent = (id: string, name: string) => {
    if (isEditingLocked) {
      return
    }

    setStudents((previous) =>
      previous.map((student) =>
        student.id === id ? { ...student, name } : student,
      ),
    )
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
      <header className="border-b border-slate-200 bg-white/85 backdrop-blur">
        <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between px-4 py-4 md:px-6">
          <h1 className="text-2xl font-extrabold md:text-3xl">学級ルーレット</h1>
          <p className="text-sm font-semibold text-slate-600">
            公平抽選・非復元・Twist演出
          </p>
        </div>
      </header>

      <main className="mx-auto grid w-full max-w-[1440px] gap-6 px-4 py-6 md:px-6 lg:grid-cols-[380px_minmax(0,1fr)]">
        <StudentEditor
          students={students}
          locked={isEditingLocked}
          onAddStudent={handleAddStudent}
          onDeleteStudent={handleDeleteStudent}
          onRenameStudent={handleRenameStudent}
          onToggleAvailability={handleToggleAvailability}
          onApplyBulk={handleApplyBulk}
        />

        <section className="rounded-3xl bg-white p-5 shadow-lg">
          <div className="relative mx-auto w-full max-w-[760px]">
            <div className="relative">
              <Pointer />
              <Wheel
                students={students}
                settings={normalizedSettings}
                rotation={engine.rotation}
                transitionDurationMs={engine.transitionDurationMs}
                transitionEasing={engine.transitionEasing}
                winnerId={engine.winnerId}
                rouletteState={engine.state}
              />

              <TwistEffect
                twistType={engine.state === 'twistEvent' ? engine.activeTwistType : null}
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

            <div className="mt-5 rounded-2xl bg-slate-900 px-4 py-4 text-center text-white">
              <p className="text-sm font-semibold text-slate-300">当選者</p>
              <p className="mt-1 min-h-14 text-4xl font-black tracking-wide">
                {currentWinner?.name ?? '---'}
              </p>
            </div>

            <div className="mt-5">
              <Controls
                state={engine.state}
                canStart={engine.canStart}
                canSkip={engine.canSkip}
                availableCount={engine.availableCount}
                totalCount={students.length}
                errorMessage={engine.errorMessage}
                skipRestorePreviousWinner={skipRestorePreviousWinner}
                onStart={() => {
                  void engine.startSpin()
                }}
                onSkip={(restorePreviousWinner) => {
                  void engine.skipToNext(restorePreviousWinner)
                }}
                onReset={engine.resetAll}
                onOpenSettings={() => setSettingsOpen(true)}
                onChangeSkipRestore={setSkipRestorePreviousWinner}
              />
            </div>
          </div>
        </section>
      </main>

      <SettingsPanel
        open={isSettingsOpen}
        locked={engine.rotationPhaseLocked}
        settings={normalizedSettings}
        setSettings={setSettings}
        onClose={() => setSettingsOpen(false)}
      />
    </div>
  )
}
