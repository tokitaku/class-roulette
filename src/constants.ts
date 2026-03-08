import type { ColorScheme, RouletteSettings, Student } from './types'

export const STORAGE_KEYS = {
  students: 'class-roulette:students:v1',
  settings: 'class-roulette:settings:v1',
  sidebarVisible: 'class-roulette:sidebarVisible:v1',
} as const

export const TWIST_PROBABILITY_PRESETS = [0, 0.03, 0.05, 0.08, 0.1, 1] as const
export const TWIST_COOLDOWN_PRESETS = [0, 3, 5, 10] as const

export const DEFAULT_SETTINGS: RouletteSettings = {
  twistEnabled: true,
  twistProbability: 0.05,
  twistCooldownSpins: 5,
  segmentStyle: 'solid',
  showDividers: true,
  showLabels: true,
  colorScheme: 'pastel',
}

const DEFAULT_NAMES = [
  'あおい',
  'ゆうた',
  'みさき',
  'こうた',
  'さくら',
  'りく',
  'ひなた',
  'ゆい',
]

const createId = () =>
  globalThis.crypto?.randomUUID?.() ??
  `student-${Date.now()}-${Math.random().toString(16).slice(2)}`

export const createDefaultStudents = (): Student[] =>
  DEFAULT_NAMES.map((name) => ({
    id: createId(),
    name,
    isAvailable: true,
  }))


export const COLOR_PALETTES: Record<ColorScheme, string[]> = {
  pastel: [
    '#FECACA',
    '#FDE68A',
    '#BBF7D0',
    '#BFDBFE',
    '#DDD6FE',
    '#FBCFE8',
    '#CFFAFE',
    '#E9D5FF',
  ],
  vivid: [
    '#EF4444',
    '#F59E0B',
    '#10B981',
    '#3B82F6',
    '#8B5CF6',
    '#EC4899',
    '#06B6D4',
    '#22C55E',
  ],
  mono: ['#E2E8F0', '#CBD5E1', '#94A3B8', '#64748B', '#475569', '#334155'],
}

export const ROTATION_PHASE_STATES = ['spinning', 'fakeStop', 'twistEvent'] as const

export const COUNTDOWN_MS = 420
export const NORMAL_SPIN_MIN_MS = 4000
export const NORMAL_SPIN_MAX_MS = 5500
export const TWIST_SPIN_MIN_MS = 3400
export const TWIST_SPIN_MAX_MS = 4300
export const FAKE_STOP_HOLD_MS = 1200
export const NUDGE_MS = 260
export const TWIST_FINAL_MS = 420
export const TWIST_MESSAGE_HOLD_MS = 1600
export const MIN_FULL_TURNS = 4
