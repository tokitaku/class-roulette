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

export type TwistType = 'bird' | 'wind' | 'sparkle'
export type SegmentStyle = 'solid' | 'striped' | 'outlined'
export type LabelMode = 'full' | 'initial' | 'number'
export type ColorScheme = 'pastel' | 'vivid' | 'mono'

export type RouletteSettings = {
  twistEnabled: boolean
  twistProbability: number
  twistCooldownSpins: number
  enabledTwistTypes: Record<TwistType, boolean>
  segmentStyle: SegmentStyle
  showDividers: boolean
  showLabels: boolean
  labelMode: LabelMode
  colorScheme: ColorScheme
}
