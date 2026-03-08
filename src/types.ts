export type RouletteState =
  | 'idle'
  | 'countdown'
  | 'spinning'
  | 'fakeStop'
  | 'twistEvent'
  | 'result'

export type Student = {
  id: string
  name: string
  isAvailable: boolean
}

export type SegmentStyle = 'solid' | 'striped' | 'outlined'
export type ColorScheme = 'pastel' | 'vivid' | 'mono'

export type RouletteSettings = {
  twistEnabled: boolean
  twistProbability: number
  twistCooldownSpins: number
  segmentStyle: SegmentStyle
  showDividers: boolean
  showLabels: boolean
  colorScheme: ColorScheme
}
