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
export type ColorScheme = 'pastel' | 'vivid' | 'mono'
export type SparkleShiftMode = 'forward2' | 'backward2' | 'forward3'

export type RouletteSettings = {
  twistEnabled: boolean
  twistProbability: number
  twistCooldownSpins: number
  enabledTwistTypes: Record<TwistType, boolean>
  sparkleShiftMode: SparkleShiftMode
  segmentStyle: SegmentStyle
  showDividers: boolean
  showLabels: boolean
  colorScheme: ColorScheme
}
