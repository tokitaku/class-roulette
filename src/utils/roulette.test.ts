import { describe, it, expect, vi } from 'vitest'
import {
    normalizeAngle,
    randomFloat,
    randomInt,
    pickRandom,
    getSegmentAngle,
    getSegmentCenterAngle,
    getTargetRotation,
    createStudentId,
    truncateLabel,
} from './roulette'

describe('roulette utils', () => {
    describe('normalizeAngle', () => {
        it('normalizes positive angles correctly', () => {
            expect(normalizeAngle(360)).toBe(0)
            expect(normalizeAngle(400)).toBe(40)
            expect(normalizeAngle(90)).toBe(90)
        })

        it('normalizes negative angles correctly', () => {
            expect(normalizeAngle(-90)).toBe(270)
            expect(normalizeAngle(-400)).toBe(320)
        })
    })

    describe('randomFloat', () => {
        it('returns a float within the specified range', () => {
            vi.spyOn(Math, 'random').mockReturnValue(0.5)
            expect(randomFloat(10, 20)).toBe(15)
            vi.restoreAllMocks()
        })
    })

    describe('randomInt', () => {
        it('returns an integer within the specified range', () => {
            vi.spyOn(Math, 'random').mockReturnValue(0.5)
            expect(randomInt(10, 20)).toBe(15)
            vi.restoreAllMocks()
        })

        it('includes bounds', () => {
            vi.spyOn(Math, 'random').mockReturnValue(0)
            expect(randomInt(10, 20)).toBe(10)
            vi.spyOn(Math, 'random').mockReturnValue(0.9999)
            expect(randomInt(10, 20)).toBe(20)
            vi.restoreAllMocks()
        })
    })

    describe('pickRandom', () => {
        it('returns an item from the array', () => {
            vi.spyOn(Math, 'random').mockReturnValue(0)
            expect(pickRandom(['a', 'b', 'c'])).toBe('a')

            vi.spyOn(Math, 'random').mockReturnValue(0.99)
            expect(pickRandom(['a', 'b', 'c'])).toBe('c')
            vi.restoreAllMocks()
        })

        it('returns null if array is empty', () => {
            expect(pickRandom([])).toBeNull()
        })
    })

    describe('getSegmentAngle', () => {
        it('returns the correct angle for a given number of segments', () => {
            expect(getSegmentAngle(4)).toBe(90)
            expect(getSegmentAngle(10)).toBe(36)
            expect(getSegmentAngle(0)).toBe(0)
        })
    })

    describe('getSegmentCenterAngle', () => {
        it('calculates the center angle of a segment', () => {
            // 4 segments: each 90 deg. 
            // index 0: 0 to 90 -> center 45
            // index 1: 90 to 180 -> center 135
            expect(getSegmentCenterAngle(0, 4)).toBe(45)
            expect(getSegmentCenterAngle(1, 4)).toBe(135)
        })
    })

    describe('getTargetRotation', () => {
        it('calculates target rotation with minimum turns', () => {
            // Stub randomInt so extraTurns = 0
            vi.spyOn(Math, 'random').mockReturnValue(0)

            const currentRotation = 10
            const winnerIndex = 0
            const segmentCount = 4
            const minTurns = 3

            // Center of segment 0 is 45 deg
            // We want to stop such that segment 0 is at the top (0 deg/360 deg)
            // Alignment angle = 360 - 45 = 315 deg
            // Target delta = 315 - 10 = 305 deg
            // Target rotation = 10 + 3*360 + 0 + 305 = 1090 + 305 = 1395 // wait 10+1080 = 1090 + 305 = 1395

            const res = getTargetRotation(currentRotation, winnerIndex, segmentCount, minTurns)
            expect(res).toBe(1395)

            vi.restoreAllMocks()
        })
    })

    describe('createStudentId', () => {
        it('generates a string id', () => {
            const id = createStudentId()
            expect(typeof id).toBe('string')
            expect(id.length).toBeGreaterThan(0)
        })
    })

    describe('truncateLabel', () => {
        it('truncates if string exceeds max length', () => {
            expect(truncateLabel('hello world', 5)).toBe('hello…')
        })

        it('returns original string if within max length', () => {
            expect(truncateLabel('hello', 10)).toBe('hello')
        })
    })
})
