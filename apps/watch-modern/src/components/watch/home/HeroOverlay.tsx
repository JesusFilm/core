export function HeroOverlay() {
  return (
    <div className="pointer-events-none absolute inset-0 z-10">
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-background" />
      <div
        className="absolute inset-0 opacity-[0.08] mix-blend-overlay"
        style={{
          backgroundImage:
            'radial-gradient(circle at 25% 25%, rgba(255,255,255,0.2) 0, transparent 40%), radial-gradient(circle at 75% 75%, rgba(255,255,255,0.2) 0, transparent 40%)'
        }}
      />
    </div>
  )
}

