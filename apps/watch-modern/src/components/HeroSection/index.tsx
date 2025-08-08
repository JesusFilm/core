import { Clapperboard, Languages } from "lucide-react"
import { Button } from "@/components/ui/button"

export function HeroSection() {
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
      {/* Background Texture */}
      <div
        className="absolute inset-0 opacity-50 z-10"
        style={{
          backgroundImage:
            'url("https://www.jesusfilm.org/_next/static/media/overlay.d86a559d.svg")',
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
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
              Watch the <span className="bg-gradient-to-r from-stone-200 to-stone-100 bg-clip-text text-transparent">Greatest Story</span> Ever Told
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

          {/* Right Side - Audience Segmentation */}
          <div className="lg:p-8">
            <h2 className="text-white text-2xl sm:text-4xl font-semibold mb-3 leading-tight">
              Start your journey today.
            </h2>
            <p className="text-stone-200/80 text-base sm:text-xl leading-relaxed mb-6 sm:mb-8">
              Find personalized videos and guidance based on your faith journey.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
} 