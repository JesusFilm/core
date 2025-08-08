'use client'

import { Clapperboard, Languages, Compass, Sprout, Footprints, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"

type AudienceOption = {
  text: string
  icon: React.ComponentType<{ className?: string }>
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

export function HeroSection() {
  const [selectedAudience, setSelectedAudience] = useState<number | null>(null)

  const handleAudienceSelection = (index: number) => {
    setSelectedAudience(index)
    // Future: Add navigation or filtering logic
  }

  return (
    <section
      className="min-h-screen text-white relative flex items-end overflow-hidden pt-[60px] sm:pt-[80px] lg:pt-[120px]"
      style={{
        background:
          "linear-gradient(140deg, #0c0a09 0%, #292524 30%, #44403c 60%, #1c1917 100%)",
        backgroundColor: "#0c0a09",
        backgroundBlendMode: "normal",
      }}
    >
      {/* Animated Grid Background */}
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
          }}
        >
          {Array.from({ length: 8 }).map((_, rowIndex) => (
            <div
              key={rowIndex}
              className={`absolute left-0 right-0 flex ${
                rowIndex % 2 === 0 ? 'animate-slide-left' : 'animate-slide-right'
              }`}
              style={{
                top: `${rowIndex * 12}%`,
                height: "10%",
                animationDelay: `${rowIndex * -3}s`,
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
                  }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Background Texture */}
      <div
        className="absolute inset-0 opacity-50 z-10"
        style={{
          backgroundImage: 'url("/overlay.svg")',
          backgroundPosition: "center",
          backgroundRepeat: "repeat",
        }}
      />

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
              Watch the <span className="bg-gradient-to-r from-stone-200 via-orange-200 to-yellow-200 bg-clip-text text-transparent animate-pulse">Greatest Story</span> Ever Told
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