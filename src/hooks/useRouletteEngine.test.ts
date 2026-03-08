import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useRouletteEngine } from './useRouletteEngine'
import { DEFAULT_SETTINGS } from '../constants'
import type { Student } from '../types'

describe('useRouletteEngine', () => {
    const mockStudents: Student[] = [
        { id: '1', name: 'Alice', isAvailable: true },
        { id: '2', name: 'Bob', isAvailable: true },
        { id: '3', name: 'Charlie', isAvailable: true },
    ]

    let setStudentsMock = vi.fn()

    beforeEach(() => {
        setStudentsMock = vi.fn()
        vi.useFakeTimers()
    })

    it('initializes with default state', () => {
        const { result } = renderHook(() =>
            useRouletteEngine({
                students: mockStudents,
                settings: DEFAULT_SETTINGS,
                setStudents: setStudentsMock,
            })
        )

        expect(result.current.state).toBe('idle')
        expect(result.current.availableCount).toBe(3)
        expect(result.current.canStart).toBe(true)
        expect(result.current.canSkip).toBe(false)
        expect(result.current.isBusy).toBe(false)
        expect(result.current.winnerId).toBeNull()
    })

    it('updates availableCount when students change', () => {
        const initialProps = {
            students: mockStudents,
            settings: DEFAULT_SETTINGS,
            setStudents: setStudentsMock,
        }

        const { result, rerender } = renderHook((props: any) => useRouletteEngine(props), {
            initialProps
        })

        expect(result.current.availableCount).toBe(3)

        // Simulating one student being made unavailable
        rerender({
            ...initialProps,
            students: [
                { id: '1', name: 'Alice', isAvailable: false },
                { id: '2', name: 'Bob', isAvailable: true },
                { id: '3', name: 'Charlie', isAvailable: true },
            ]
        })

        expect(result.current.availableCount).toBe(2)
    })

    it('resetAll restores all students to available and resets state', () => {
        const { result } = renderHook(() =>
            useRouletteEngine({
                students: [
                    { id: '1', name: 'Alice', isAvailable: false },
                    { id: '2', name: 'Bob', isAvailable: true }
                ],
                settings: DEFAULT_SETTINGS,
                setStudents: setStudentsMock,
            })
        )

        act(() => {
            result.current.resetAll()
        })

        expect(setStudentsMock).toHaveBeenCalledWith([
            { id: '1', name: 'Alice', isAvailable: true },
            { id: '2', name: 'Bob', isAvailable: true }
        ])

        expect(result.current.state).toBe('idle')
        expect(result.current.errorMessage).toBe('')
    })
})
