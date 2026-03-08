import { COLOR_PALETTES } from '../constants'
import type { RouletteSettings, RouletteState, Student } from '../types'
import { getSegmentAngle } from '../utils/roulette'

type WheelProps = {
  students: (Student & { originalIndex: number })[]
  settings: RouletteSettings
  rotation: number
  transitionDurationMs: number
  transitionEasing: string
  winnerId: string | null
  rouletteState: RouletteState
}

const RADIUS = 200

const toCartesian = (radius: number, angleFromTop: number) => {
  const radians = ((angleFromTop - 90) * Math.PI) / 180
  return {
    x: radius * Math.cos(radians),
    y: radius * Math.sin(radians),
  }
}

const describeSectorPath = (
  radius: number,
  startAngle: number,
  endAngle: number,
): string => {
  const start = toCartesian(radius, startAngle)
  const end = toCartesian(radius, endAngle)
  const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0
  return `M 0 0 L ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y} Z`
}

export const Wheel = ({
  students,
  settings,
  rotation,
  transitionDurationMs,
  transitionEasing,
  winnerId,
  rouletteState,
}: WheelProps) => {
  const segmentCount = students.length
  const segmentAngle = getSegmentAngle(segmentCount)
  const palette = COLOR_PALETTES[settings.colorScheme]
  const showWinnerHighlight = rouletteState === 'result' && winnerId !== null

  if (segmentCount === 0) {
    return (
      <div className="flex aspect-square w-full items-center justify-center rounded-full border-4 border-slate-300 bg-white shadow-xl">
        <p className="text-xl font-bold text-slate-500">生徒を追加してください</p>
      </div>
    )
  }

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[560px] rounded-full border-4 border-slate-300 bg-white shadow-2xl">
      <svg
        viewBox="-220 -220 440 440"
        className="h-full w-full rounded-full"
        style={{
          transform: `rotate(${rotation}deg)`,
          transition: `transform ${transitionDurationMs}ms ${transitionEasing}`,
        }}
      >
        {settings.segmentStyle === 'striped' && (
          <defs>
            {students.map((_, index) => {
              const baseColor = palette[index % palette.length]
              return (
                <pattern
                  id={`stripe-${index}`}
                  key={`stripe-${index}`}
                  patternUnits="userSpaceOnUse"
                  width="10"
                  height="10"
                  patternTransform="rotate(45)"
                >
                  <rect width="10" height="10" fill={`${baseColor}33`} />
                  <line x1="0" y1="0" x2="0" y2="10" stroke={baseColor} strokeWidth="5" />
                </pattern>
              )
            })}
          </defs>
        )}

        {students.map((student, index) => {
          const startAngle = index * segmentAngle
          const endAngle = startAngle + segmentAngle
          const midAngle = startAngle + segmentAngle / 2
          const path = describeSectorPath(RADIUS, startAngle, endAngle)

          const baseColor = palette[index % palette.length]
          const fallbackColor = settings.colorScheme === 'mono' ? '#94a3b8' : '#cbd5e1'
          const segmentColor = student.isAvailable ? baseColor : fallbackColor

          const fill =
            settings.segmentStyle === 'outlined'
              ? 'transparent'
              : settings.segmentStyle === 'striped'
                ? `url(#stripe-${index})`
                : segmentColor

          const strokeColor =
            settings.segmentStyle === 'outlined' ? segmentColor : '#0f172a'
          const dividerStroke = settings.showDividers ? strokeColor : 'transparent'
          const isWinner = showWinnerHighlight && student.id === winnerId

          const rotationAngle = midAngle - 90
          const dynamicFontSize = Math.max(8, Math.min(18, 320 / segmentCount))
          const labelColor = settings.colorScheme === 'vivid' ? '#ffffff' : '#0f172a'

          // Move the text relative to the center, slightly outwards from the middle radius
          const labelRadiusOffset = RADIUS * 0.85
          const transform = `rotate(${rotationAngle}) translate(${labelRadiusOffset}, 0)`

          // Depending on the side of the wheel, text can be upside down. 
          // For a spinning wheel reading from the edge inwards or outwards is standard,
          // but rotating it extra 180 on the left side might make reading easier when stopped.
          // However, keeping it consistently pointing outward simplifies the look.
          // Let's use anchor "middle" to balance long names inside the wedge.

          return (
            <g key={student.id}>
              <path
                d={path}
                fill={fill}
                opacity={student.isAvailable ? 1 : 0.55}
                stroke={dividerStroke}
                strokeWidth={settings.segmentStyle === 'outlined' ? 3 : 1.8}
              />

              {isWinner && (
                <path
                  d={path}
                  fill="transparent"
                  stroke="#f59e0b"
                  strokeWidth={5}
                  opacity={0.95}
                />
              )}

              {settings.showLabels && (
                <text
                  transform={transform}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill={labelColor}
                  fontWeight={700}
                  fontSize={dynamicFontSize}
                >
                  {student.originalIndex + 1}
                </text>
              )}
            </g>
          )
        })}

        <circle cx="0" cy="0" r="22" fill="#0f172a" />
        <circle cx="0" cy="0" r="8" fill="#f8fafc" />
      </svg>
    </div>
  )
}
