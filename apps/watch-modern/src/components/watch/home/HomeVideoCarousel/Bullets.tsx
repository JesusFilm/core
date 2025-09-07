interface BulletsProps {
  total: number
  activeIndex: number
  progress: number
  onBulletClick: (index: number) => void
}

/**
 * Bullet indicators with progress fill
 */
export function Bullets({
  total,
  activeIndex,
  progress,
  onBulletClick
}: BulletsProps) {
  // Calculate progress percentage (0-100) for horizontal fill
  const progressPercent = Math.min((progress / 15) * 100, 100)

  return (
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-6">
      {/* Mixed Progress Indicators */}
      <div className="flex items-center gap-3">
          {Array.from({ length: total }, (_, index) => {
            const isActive = index === activeIndex
            
            if (isActive) {
              // Active slide: horizontal progress bar
              return (
                <button
                  key={index}
                  className="relative group transition-all duration-300 ease-out scale-100"
                  onClick={() => onBulletClick(index)}
                  aria-label={`Go to slide ${index + 1} of ${total}, ${Math.floor(progress)} seconds elapsed`}
                  aria-current="true"
                  style={{ 
                    width: '54px', 
                    height: '8px',
                    borderRadius: '4px'
                  }}
                >
                  {/* Background bar */}
                  <div 
                    className="absolute inset-0 rounded-full bg-white/30 transition-all duration-300"
                    data-testid={`progress-bar-bg-${index}`}
                  />
                  
                  {/* Progress fill */}
                  <div 
                    className="absolute top-0 left-0 h-full bg-white rounded-full transition-all duration-75 ease-linear"
                    style={{ 
                      width: `${progressPercent}%`,
                      boxShadow: '0 0 6px rgba(255,255,255,0.7)',
                      minWidth: progressPercent > 0 ? '8px' : '0px'
                    }}
                    data-testid={`progress-bar-fill-${index}`}
                  />
                </button>
              )
            } else {
              // Inactive slides: plain circles
              return (
                <button
                  key={index}
                  className={`relative group transition-all duration-300 ease-out ${
                    'opacity-60 hover:opacity-80 scale-90 hover:scale-100'
                  }`}
                  onClick={() => onBulletClick(index)}
                  aria-label={`Go to slide ${index + 1} of ${total}`}
                  aria-current="false"
                  style={{ 
                    width: '10px', 
                    height: '10px'
                  }}
                >
                  {/* Plain circle */}
                  <div 
                    className={`absolute inset-0 rounded-full transition-all duration-300 ${
                      index < activeIndex 
                        ? 'bg-white/70' // Completed slides - brighter
                        : 'bg-white/40 group-hover:bg-white/60' // Future slides - dimmer
                    }`}
                    data-testid={`circle-indicator-${index}`}
                  />
                </button>
              )
            }
          })}
      </div>
    </div>
  )
}
