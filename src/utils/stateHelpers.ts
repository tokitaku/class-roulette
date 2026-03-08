import type { RouletteState } from '../types'

export const isRotationLocked = (state: RouletteState): boolean =>
    state === 'spinning' || state === 'fakeStop' || state === 'twistEvent'

export const isBusyState = (state: RouletteState): boolean =>
    state === 'countdown' || isRotationLocked(state)

export const isControlsLocked = (state: RouletteState): boolean =>
    isBusyState(state) || state === 'result'
