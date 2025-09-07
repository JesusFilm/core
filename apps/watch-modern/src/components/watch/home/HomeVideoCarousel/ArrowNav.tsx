import { Button } from '@/components/ui/button'

interface ArrowNavProps {
  onPrev: () => void
  onNext: () => void
}

/**
 * Left and right arrow navigation controls
 */
export function ArrowNav({ onPrev, onNext }: ArrowNavProps) {
  return (
    <>
      {/* Previous Arrow */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 h-12 w-12 rounded-full bg-black/20 backdrop-blur-sm text-white hover:bg-black/40 transition-all duration-200 hover:scale-110 focus-ring"
        onClick={onPrev}
        aria-label="Go to previous video slide"
      >
        <svg
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </Button>

      {/* Next Arrow */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 h-12 w-12 rounded-full bg-black/20 backdrop-blur-sm text-white hover:bg-black/40 transition-all duration-200 hover:scale-110 focus-ring"
        onClick={onNext}
        aria-label="Go to next video slide"
      >
        <svg
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </Button>
    </>
  )
}
