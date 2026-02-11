export const normalizeAngle = (angle: number): number => {
  const normalized = angle % 360
  return normalized < 0 ? normalized + 360 : normalized
}

export const randomFloat = (min: number, max: number): number =>
  Math.random() * (max - min) + min

export const randomInt = (min: number, max: number): number =>
  Math.floor(randomFloat(min, max + 1))

export const pickRandom = <T,>(items: T[]): T | null => {
  if (items.length === 0) {
    return null
  }
  return items[randomInt(0, items.length - 1)]
}

export const getSegmentAngle = (segmentCount: number): number =>
  segmentCount > 0 ? 360 / segmentCount : 0

export const getSegmentCenterAngle = (
  index: number,
  segmentCount: number,
): number => {
  const segmentAngle = getSegmentAngle(segmentCount)
  return index * segmentAngle + segmentAngle / 2
}

export const getTargetRotation = (
  currentRotation: number,
  winnerIndex: number,
  segmentCount: number,
  minimumTurns: number,
): number => {
  const centerAngle = getSegmentCenterAngle(winnerIndex, segmentCount)
  const alignmentAngle = normalizeAngle(360 - centerAngle)
  const currentModulo = normalizeAngle(currentRotation)
  const delta = normalizeAngle(alignmentAngle - currentModulo)
  const extraTurns = randomInt(0, 2) * 360
  return currentRotation + minimumTurns * 360 + extraTurns + delta
}

export const createStudentId = (): string =>
  globalThis.crypto?.randomUUID?.() ??
  `student-${Date.now()}-${Math.random().toString(16).slice(2)}`

export const truncateLabel = (value: string, maxLength: number): string =>
  value.length <= maxLength ? value : `${value.slice(0, maxLength)}…`
