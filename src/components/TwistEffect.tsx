type TwistEffectProps = {
  active: boolean
}

export const TwistEffect = ({ active }: TwistEffectProps) => {
  if (!active) {
    return null
  }

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="twist-wind-line twist-wind-line-1" />
      <div className="twist-wind-line twist-wind-line-2" />
      <div className="twist-wind-line twist-wind-line-3" />
    </div>
  )
}
