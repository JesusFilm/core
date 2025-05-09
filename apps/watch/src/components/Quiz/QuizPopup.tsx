import X2Icon from '@core/shared/ui/icons/X2'

import { QuizModalProps } from './types'
import { useQuizEngine } from './useQuizEngine'

export function QuizPopup({
  isOpen,
  onClose,
  startSlideId = 'intro'
}: QuizModalProps) {
  const { Slide, ctx } = useQuizEngine(startSlideId)

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      style={{ viewTransitionName: 'quiz-container' }}
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
        style={{ viewTransitionName: 'quiz-backdrop' }}
      />

      {/* Modal */}
      <div
        className="relative w-full h-full bg-white text-black shadow-xl"
        style={{ viewTransitionName: 'quiz-modal' }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 text-black hover:bg-black/10 rounded-full transition-colors"
          aria-label="Close quiz"
        >
          <X2Icon />
        </button>

        <div
          className="relative h-full p-0"
          style={{ viewTransitionName: 'quiz-content' }}
        >
          {Slide?.render(ctx)}
        </div>
      </div>
    </div>
  )
}
