'use client'

import React, { useCallback, useEffect, useMemo, useState } from "react"
import { ArrowRight, Clapperboard, Compass, Footprints, Languages, Sprout } from "lucide-react"
import { Button } from "@/components/ui/button"

type AudienceOption = {
  text: string
  icon: React.ComponentType<any>
}

const audienceOptions: AudienceOption[] = [
  {
    text: "Discover who Jesus is",
    icon: Compass
  },
  {
    text: "Grow closer to God", 
    icon: Sprout
  },
  {
    text: "Get equipped for ministry",
    icon: Footprints
  }
]

// Performance monitoring hook
const usePerformanceMonitor = () => {
  const [fps, setFps] = useState<number>(60)
  const [animationFrame, setAnimationFrame] = useState<number>(0)

  useEffect(() => {
    let frameCount = 0
    let lastTime = performance.now()
    
    const measureFPS = () => {
      frameCount++
      const currentTime = performance.now()
      
      if (currentTime - lastTime >= 1000) {
        setFps(Math.round((frameCount * 1000) / (currentTime - lastTime)))
        frameCount = 0
        lastTime = currentTime
      }
      
      setAnimationFrame(requestAnimationFrame(measureFPS))
    }
    
    setAnimationFrame(requestAnimationFrame(measureFPS))
    
    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame)
      }
    }
  }, [animationFrame])

  return { fps }
}

// Reduced motion detection
const useReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  
  useEffect(() => {
    // Check if we're in a browser environment
    if (typeof window === 'undefined' || !window.matchMedia) {
      return
    }
    
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)
    
    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches)
    }
    
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])
  
  return prefersReducedMotion
}

export function HeroSection() {
  const [selectedAudience, setSelectedAudience] = useState<number | null>(null)
  const [imagesLoaded, setImagesLoaded] = useState(false)
  const { fps } = usePerformanceMonitor()
  const prefersReducedMotion = useReducedMotion()

  const handleAudienceSelection = useCallback((index: number) => {
    setSelectedAudience(index)
    // Future: Add navigation or filtering logic
  }, [])

  // Memoized grid items for performance
  const gridItems = useMemo(() => {
    return Array.from({ length: 8 }).map((_, rowIndex) => ({
      rowIndex,
      animationDelay: rowIndex * -3,
      animationDirection: rowIndex % 2 === 0 ? 'left' : 'right'
    }))
  }, [])

  // Lazy load background texture
  useEffect(() => {
    const img = new window.Image()
    img.onload = () => setImagesLoaded(true)
    img.src = "/overlay.svg"
  }, [])

  return (
    <section
      className="min-h-screen text-white relative flex items-end overflow-hidden pt-[60px] sm:pt-[80px] lg:pt-[120px]"
      style={{
        background:
          "linear-gradient(140deg, #0c0a09 0%, #292524 30%, #44403c 60%, #1c1917 100%)",
        backgroundColor: "#0c0a09",
        backgroundBlendMode: "normal",
        // Hardware acceleration
        transform: "translateZ(0)",
        willChange: "transform",
      }}
    >
      {/* Performance monitoring (development only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed top-4 right-4 bg-black/80 text-white p-2 rounded text-xs z-50">
          FPS: {fps}
        </div>
      )}

      {/* Animated Grid Background - Optimized for performance */}
      {!prefersReducedMotion && (
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute inset-0"
            style={{
              transform: "rotate(-45deg)",
              transformOrigin: "center center",
              width: "200%",
              height: "200%",
              top: "-50%",
              left: "-50%",
              overflow: "hidden",
              // Hardware acceleration
              willChange: "transform",
            }}
          >
            {gridItems.map(({ rowIndex, animationDelay, animationDirection }) => (
              <div
                key={rowIndex}
                className={`absolute left-0 right-0 flex ${
                  animationDirection === 'left' ? 'animate-slide-left' : 'animate-slide-right'
                }`}
                style={{
                  top: `${rowIndex * 12}%`,
                  height: "10%",
                  animationDelay: `${animationDelay}s`,
                  // Hardware acceleration
                  willChange: "transform",
                }}
              >
                {/* Simplified grid items - just colored rectangles for performance */}
                {Array.from({ length: 6 }).map((_, imageIndex) => (
                  <div
                    key={imageIndex}
                    className="mr-8 flex-shrink-0 w-72 h-96 rounded-2xl shadow-2xl opacity-10"
                    style={{
                      background: `linear-gradient(45deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)`,
                      border: '1px solid rgba(255,255,255,0.1)',
                      // Hardware acceleration
                      willChange: "transform",
                    }}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Background Texture - Lazy loaded */}
      {imagesLoaded && (
        <div
          className="absolute inset-0 opacity-50 z-10"
          style={{
            backgroundImage: 'url("/overlay.svg")',
            backgroundPosition: "center",
            backgroundRepeat: "repeat",
          }}
        />
      )}

      {/* Text Readability Gradient Overlay */}
      <div
        className="absolute inset-0 z-15"
        style={{
          background: "linear-gradient(45deg, rgba(12, 10, 9, 0.9) 0%, rgba(12, 10, 9, 0.6) 30%, rgba(12, 10, 9, 0.2) 60%, transparent 100%)",
        }}
      />

      {/* Bottom Gradient Transition to Next Section */}
      <div
        className="absolute bottom-0 left-0 right-0 z-20 h-32"
        style={{
          background: "linear-gradient(to bottom, transparent 0%, rgba(12, 10, 9, 0.4) 50%, #0c0a09 100%)",
        }}
      />

      <div className="max-w-[1920px] mx-auto px-4 sm:px-8 lg:px-20 pt-8 sm:pt-12 lg:pt-2 pb-12 sm:pb-16 lg:pb-24 relative z-20">
        <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-end">
          {/* Left Content */}
          <div className="max-w-5xl">
            <div className="mb-4">
              <div className="inline-flex items-center gap-2 mb-4">
                <Languages className="w-4 h-4 text-orange-400/80" />
                <span className="text-orange-400/80 text-sm sm:text-lg tracking-wider">
                  ONE STORY. EVERY LANGUAGE.
                </span>
              </div>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-6xl xl:text-7xl font-bold leading-[0.9] tracking-tight text-white mb-4 sm:mb-6">
              Watch the <span className={`bg-gradient-to-r from-stone-200 via-orange-200 to-yellow-200 bg-clip-text text-transparent ${!prefersReducedMotion ? 'animate-pulse' : ''}`}>Greatest Story</span> Ever Told
            </h1>

            <p className="text-stone-100/90 text-base sm:text-xl md:text-2xl leading-relaxed max-w-3xl mb-6 sm:mb-8">
              Watch the life of Jesus through authentic films,
              translated into thousands of languages and shared
              with billions of people worldwide.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 items-start">
              <Button
                size="lg"
                className="bg-white text-slate-900 hover:bg-blue-50 px-8 sm:px-12 py-4 sm:py-6 rounded-full font-semibold tracking-wide transition-all duration-200 flex items-center gap-3 shadow-2xl hover:shadow-white/20 text-base sm:text-lg"
              >
                <Clapperboard
                  style={{ width: "20px", height: "20px" }}
                  className="sm:w-6 sm:h-6"
                />
                Free Bible Videos
              </Button>
            </div>
          </div>

          {/* Right Side - Enhanced Audience Segmentation */}
          <div className="lg:p-8">
            <h2 className="text-white text-2xl sm:text-4xl font-semibold mb-3 leading-tight">
              Start your journey today.
            </h2>
            <p className="text-stone-200/80 text-base sm:text-xl leading-relaxed mb-6 sm:mb-8">
              Find personalized videos and guidance based on your faith journey.
            </p>
            
            <div className="space-y-4">
              {audienceOptions.map((option, index) => {
                const IconComponent = option.icon
                const isSelected = selectedAudience === index
                return (
                  <Button
                    key={index}
                    onClick={() => handleAudienceSelection(index)}
                    className={`w-full bg-white/10 backdrop-blur-sm text-stone-200 hover:bg-white/20 rounded-full font-semibold transition-all duration-200 flex justify-between border border-white/20 shadow-lg hover:shadow-xl text-lg h-auto tracking-wide !px-6 py-[14px] text-left ${
                      isSelected ? 'bg-white/20 border-white/40 shadow-xl' : ''
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <IconComponent 
                        className="flex-shrink-0 text-stone-200" 
                        style={{ width: '40px', height: '40px' }}
                        strokeWidth={1.5}
                      />
                      <span>{option.text}</span>
                    </div>
                    <ArrowRight className="w-6 h-6 flex-shrink-0 text-stone-200" />
                  </Button>
                )
              })}
            </div>

          </div>
        </div>
      </div>
    </section>
  )
} 