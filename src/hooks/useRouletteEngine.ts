import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from 'react'
import {
  COUNTDOWN_MS,
  FAKE_STOP_HOLD_MS,
  MIN_FULL_TURNS,
  NORMAL_SPIN_MAX_MS,
  NORMAL_SPIN_MIN_MS,
  NUDGE_MS,
  TWIST_FINAL_MS,
  TWIST_MESSAGE_HOLD_MS,
  TWIST_MESSAGES,
  TWIST_SPIN_MAX_MS,
  TWIST_SPIN_MIN_MS,
} from '../constants'
import type { RouletteSettings, RouletteState, Student, TwistType } from '../types'
import {
  getTargetRotation,
  pickRandom,
  randomFloat,
  randomInt,
} from '../utils/roulette'

type StartSpinOptions = {
  restorePreviousWinner?: boolean
}

type UseRouletteEngineParams = {
  students: Student[]
  settings: RouletteSettings
  setStudents: Dispatch<SetStateAction<Student[]>>
}

type TwistShiftConfig = {
  availableShift: number
  message: string
}

const resolveTwistShift = (
  twistType: TwistType,
  settings: RouletteSettings,
): TwistShiftConfig => {
  if (twistType === 'wind') {
    return { availableShift: -1, message: '1つ前の人へ！' }
  }
  if (twistType === 'bird') {
    return { availableShift: 1, message: '1つ後の人へ！' }
  }

  if (settings.sparkleShiftMode === 'backward2') {
    return { availableShift: -2, message: '2つ前の人へ！' }
  }
  if (settings.sparkleShiftMode === 'forward3') {
    return { availableShift: 3, message: '3つ後の人へ！' }
  }
  return { availableShift: 2, message: '2つ後の人へ！' }
}

const getShiftedWinnerByAvailableOrder = (
  students: Student[],
  currentWinnerId: string,
  shiftByAvailableOrder: number,
) => {
  const availableEntries = students
    .map((student, index) => ({ student, index }))
    .filter((entry) => entry.student.isAvailable)

  if (availableEntries.length < 2) {
    return null
  }

  const currentPosition = availableEntries.findIndex(
    (entry) => entry.student.id === currentWinnerId,
  )
  if (currentPosition < 0) {
    return null
  }

  let normalizedShift = shiftByAvailableOrder % availableEntries.length
  if (normalizedShift === 0) {
    normalizedShift = shiftByAvailableOrder >= 0 ? 1 : -1
  }

  const targetPosition =
    (currentPosition + normalizedShift + availableEntries.length) %
    availableEntries.length

  const sourceEntry = availableEntries[currentPosition]
  const targetEntry = availableEntries[targetPosition]
  if (!targetEntry || sourceEntry.index === targetEntry.index) {
    return null
  }

  const forwardSteps =
    (targetEntry.index - sourceEntry.index + students.length) % students.length
  const backwardSteps =
    (sourceEntry.index - targetEntry.index + students.length) % students.length
  const wheelSignedSteps =
    normalizedShift > 0 ? forwardSteps : -backwardSteps

  if (wheelSignedSteps === 0) {
    return null
  }

  return {
    winnerStudent: targetEntry.student,
    wheelSignedSteps,
  }
}

export const useRouletteEngine = ({
  students,
  settings,
  setStudents,
}: UseRouletteEngineParams) => {
  const [rouletteState, setRouletteState] = useState<RouletteState>('idle')
  const [rotation, setRotation] = useState(0)
  const [transitionDurationMs, setTransitionDurationMs] = useState(0)
  const [transitionEasing, setTransitionEasing] = useState('linear')
  const [winnerId, setWinnerId] = useState<string | null>(null)
  const [activeTwistType, setActiveTwistType] = useState<TwistType | null>(null)
  const [twistMessage, setTwistMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [spinsSinceLastTwist, setSpinsSinceLastTwist] = useState(
    settings.twistCooldownSpins,
  )

  const studentsRef = useRef(students)
  const settingsRef = useRef(settings)
  const rotationRef = useRef(rotation)
  const winnerIdRef = useRef<string | null>(winnerId)
  const spinsRef = useRef(spinsSinceLastTwist)
  const spinTokenRef = useRef(0)
  const timersRef = useRef<number[]>([])

  useEffect(() => {
    studentsRef.current = students
  }, [students])

  useEffect(() => {
    settingsRef.current = settings
  }, [settings])

  useEffect(() => {
    rotationRef.current = rotation
  }, [rotation])

  useEffect(() => {
    winnerIdRef.current = winnerId
  }, [winnerId])

  useEffect(() => {
    spinsRef.current = spinsSinceLastTwist
  }, [spinsSinceLastTwist])

  const clearTimers = useCallback(() => {
    for (const timerId of timersRef.current) {
      window.clearTimeout(timerId)
    }
    timersRef.current = []
  }, [])

  const wait = useCallback((ms: number) => {
    return new Promise<void>((resolve) => {
      const timerId = window.setTimeout(resolve, ms)
      timersRef.current.push(timerId)
    })
  }, [])

  const availableCount = useMemo(
    () => students.filter((student) => student.isAvailable).length,
    [students],
  )

  const isBusy =
    rouletteState === 'countdown' ||
    rouletteState === 'spinning' ||
    rouletteState === 'fakeStop' ||
    rouletteState === 'twistEvent'

  const rotationPhaseLocked =
    rouletteState === 'spinning' ||
    rouletteState === 'fakeStop' ||
    rouletteState === 'twistEvent'

  const startSpin = useCallback(
    async (options: StartSpinOptions = {}) => {
      if (isBusy) {
        return
      }

      let workingStudents = studentsRef.current

      if (options.restorePreviousWinner && winnerIdRef.current) {
        workingStudents = workingStudents.map((student) =>
          student.id === winnerIdRef.current
            ? { ...student, isAvailable: true }
            : student,
        )
        studentsRef.current = workingStudents
        setStudents(workingStudents)
      }

      const availableStudents = workingStudents.filter(
        (student) => student.isAvailable,
      )

      if (availableStudents.length < 2) {
        setErrorMessage('抽選対象が足りません（2人以上必要です）')
        return
      }

      const selectedStudent = pickRandom(availableStudents)
      if (!selectedStudent) {
        setErrorMessage('抽選対象が足りません（2人以上必要です）')
        return
      }

      const winnerIndex = workingStudents.findIndex(
        (student) => student.id === selectedStudent.id,
      )
      if (winnerIndex < 0) {
        return
      }

      const selectedTargetRotation = getTargetRotation(
        rotationRef.current,
        winnerIndex,
        workingStudents.length,
        MIN_FULL_TURNS,
      )

      const enabledTwistTypes = (
        Object.entries(settingsRef.current.enabledTwistTypes) as [
          TwistType,
          boolean,
        ][]
      )
        .filter(([, enabled]) => enabled)
        .map(([type]) => type)

      const twistCandidate =
        settingsRef.current.twistEnabled &&
        enabledTwistTypes.length > 0 &&
        spinsRef.current >= settingsRef.current.twistCooldownSpins &&
        Math.random() < settingsRef.current.twistProbability

      let resolvedTwistType: TwistType | null = null
      let resolvedTwistShift: TwistShiftConfig | null = null
      let finalWinnerStudent = selectedStudent
      let targetRotation = selectedTargetRotation

      if (twistCandidate) {
        resolvedTwistType = pickRandom(enabledTwistTypes) ?? 'wind'
        resolvedTwistShift = resolveTwistShift(
          resolvedTwistType,
          settingsRef.current,
        )

        const shifted = getShiftedWinnerByAvailableOrder(
          workingStudents,
          selectedStudent.id,
          resolvedTwistShift.availableShift,
        )

        if (shifted) {
          const segmentAngle = 360 / workingStudents.length
          finalWinnerStudent = shifted.winnerStudent
          targetRotation = selectedTargetRotation - shifted.wheelSignedSteps * segmentAngle
        }
      }

      const applyTwist = twistCandidate && resolvedTwistType !== null

      const token = spinTokenRef.current + 1
      spinTokenRef.current = token
      clearTimers()

      setErrorMessage('')
      setWinnerId(null)
      setTwistMessage('')
      setActiveTwistType(null)
      setRouletteState('countdown')

      await wait(COUNTDOWN_MS)
      if (spinTokenRef.current !== token) {
        return
      }

      if (applyTwist && resolvedTwistType) {
        const twistType = resolvedTwistType
        const fakeStopOffset = randomFloat(8, 18)
        const fakeStopRotation = selectedTargetRotation - fakeStopOffset
        const finalDelta = targetRotation - fakeStopRotation
        const nudgeSign = finalDelta >= 0 ? 1 : -1
        const nudgeMagnitude = Math.min(
          18,
          Math.max(6, Math.abs(finalDelta) * 0.35),
        )
        const nudgeRotation = fakeStopRotation + nudgeSign * nudgeMagnitude
        const mainDuration = randomInt(TWIST_SPIN_MIN_MS, TWIST_SPIN_MAX_MS)
        const shiftMessage = resolvedTwistShift?.message ?? '別の人へ！'

        setRouletteState('spinning')
        setTransitionEasing('cubic-bezier(0.12, 0.86, 0.2, 1)')
        setTransitionDurationMs(mainDuration)
        setRotation(fakeStopRotation)

        await wait(mainDuration)
        if (spinTokenRef.current !== token) {
          return
        }

        setRouletteState('fakeStop')
        setTransitionDurationMs(0)

        await wait(FAKE_STOP_HOLD_MS)
        if (spinTokenRef.current !== token) {
          return
        }

        setRouletteState('twistEvent')
        setActiveTwistType(twistType)
        setTwistMessage(`${TWIST_MESSAGES[twistType]} ${shiftMessage}`)
        setTransitionEasing('ease-out')
        setTransitionDurationMs(NUDGE_MS)
        setRotation(nudgeRotation)

        await wait(NUDGE_MS)
        if (spinTokenRef.current !== token) {
          return
        }

        setTransitionEasing('cubic-bezier(0.2, 0.9, 0.28, 1)')
        setTransitionDurationMs(TWIST_FINAL_MS)
        setRotation(targetRotation)

        await wait(TWIST_FINAL_MS)
        if (spinTokenRef.current !== token) {
          return
        }

        await wait(TWIST_MESSAGE_HOLD_MS)
        if (spinTokenRef.current !== token) {
          return
        }
      } else {
        const normalDuration = randomInt(NORMAL_SPIN_MIN_MS, NORMAL_SPIN_MAX_MS)

        setRouletteState('spinning')
        setTransitionEasing('cubic-bezier(0.12, 0.86, 0.2, 1)')
        setTransitionDurationMs(normalDuration)
        setRotation(targetRotation)

        await wait(normalDuration)
        if (spinTokenRef.current !== token) {
          return
        }
      }

      const updatedStudents = studentsRef.current.map((student) =>
        student.id === finalWinnerStudent.id
          ? { ...student, isAvailable: false }
          : student,
      )
      studentsRef.current = updatedStudents
      setStudents(updatedStudents)

      setWinnerId(finalWinnerStudent.id)
      setTwistMessage('')
      setRouletteState('result')
      setTransitionDurationMs(0)
      setTransitionEasing('linear')

      if (applyTwist) {
        spinsRef.current = 0
        setSpinsSinceLastTwist(0)
      } else {
        setSpinsSinceLastTwist((previous) => {
          const next = previous + 1
          spinsRef.current = next
          return next
        })
      }
    },
    [clearTimers, isBusy, setStudents, wait],
  )

  const skipToNext = useCallback(
    async (restorePreviousWinner: boolean) => {
      if (rouletteState !== 'result') {
        return
      }
      await startSpin({ restorePreviousWinner })
    },
    [rouletteState, startSpin],
  )

  const resetAll = useCallback(() => {
    if (isBusy) {
      return
    }

    spinTokenRef.current += 1
    clearTimers()

    const resetStudents = studentsRef.current.map((student) => ({
      ...student,
      isAvailable: true,
    }))
    studentsRef.current = resetStudents
    setStudents(resetStudents)

    setRouletteState('idle')
    setWinnerId(null)
    setTransitionDurationMs(0)
    setTransitionEasing('linear')
    setTwistMessage('')
    setActiveTwistType(null)
    setErrorMessage('')
    setSpinsSinceLastTwist(settingsRef.current.twistCooldownSpins)
    spinsRef.current = settingsRef.current.twistCooldownSpins
  }, [clearTimers, isBusy, setStudents])

  useEffect(() => {
    return () => {
      spinTokenRef.current += 1
      clearTimers()
    }
  }, [clearTimers])

  const canStart = !isBusy && availableCount >= 2
  const canSkip = rouletteState === 'result' && availableCount >= 1

  return {
    state: rouletteState,
    rotation,
    transitionDurationMs,
    transitionEasing,
    winnerId,
    activeTwistType,
    twistMessage,
    errorMessage,
    availableCount,
    isBusy,
    rotationPhaseLocked,
    spinsSinceLastTwist,
    canStart,
    canSkip,
    startSpin,
    skipToNext,
    resetAll,
  }
}
