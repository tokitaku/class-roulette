import type { TwistType } from '../types'

type TwistEffectProps = {
  twistType: TwistType | null
}

export const TwistEffect = ({ twistType }: TwistEffectProps) => {
  if (!twistType) {
    return null
  }

  if (twistType === 'bird') {
    return (
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="twist-bird absolute top-1/3 text-5xl">🕊️</div>
      </div>
    )
  }

  if (twistType === 'wind') {
    return (
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="twist-wind-line twist-wind-line-1" />
        <div className="twist-wind-line twist-wind-line-2" />
        <div className="twist-wind-line twist-wind-line-3" />
      </div>
    )
  }

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="twist-sparkle twist-sparkle-1">✦</div>
      <div className="twist-sparkle twist-sparkle-2">✧</div>
      <div className="twist-sparkle twist-sparkle-3">✦</div>
    </div>
  )
}
