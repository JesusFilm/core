export function HeroOverlay() {
  return (
    <div className="pointer-events-none absolute inset-0 z-10">
      {/* Primary gradient overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(0deg, rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3))'
        }}
      />

      {/* Secondary gradient overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(180.21deg, rgba(50, 50, 51, 0) 63.7%, rgba(38, 38, 38, 0.25) 75.85%, rgba(27, 27, 28, 0.46) 85.7%, #000000 99.82%)'
        }}
      />

      {/* Side fade gradient overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(89.75deg, #141414 16.19%, rgba(10, 10, 10, 0.5) 24.01%, rgba(4, 4, 4, 0.2) 30.68%, rgba(0, 0, 0, 0) 39.07%)'
        }}
      />

      {/* Grain texture overlay */}
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

