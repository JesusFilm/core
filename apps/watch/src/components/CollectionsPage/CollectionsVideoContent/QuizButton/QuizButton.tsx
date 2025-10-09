import { sendGTMEvent } from '@next/third-parties/google'
import dynamic from 'next/dynamic'
import { ReactElement, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'

const QuizModal = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "QuizModal" */
      './QuizModal'
    ).then((mod) => mod.QuizModal),
  {
    ssr: false
  }
)

interface QuizButtonProps {
  buttonText: string
  contentId: string
}

export const QuizButton = ({
  buttonText,
  contentId
}: QuizButtonProps): ReactElement => {
  const [quizModalOpen, setQuizModalOpen] = useState<boolean | null>(null)

  function handleClick() {
    setQuizModalOpen(true)
    sendGTMEvent({
      event: 'quiz_button_click',
      eventId: uuidv4(),
      date: new Date().toISOString(),
      contentId
    })
  }

  return (
    <>
      <div className="mx-auto w-full px-6 pt-12 sm:w-auto lg:w-1/2 lg:px-8 xl:w-1/2 2xl:w-2xl">
        <button
          onClick={handleClick}
          className="animate-mesh-gradient hover:animate-mesh-gradient-fast group relative w-full overflow-hidden rounded-lg bg-gradient-to-tr from-yellow-500 via-amber-500 to-red-700 bg-blend-multiply shadow-lg hover:bg-orange-500"
          aria-label="Open faith quiz"
          tabIndex={0}
        >
          <div className="flex cursor-pointer items-center justify-between p-4 xl:p-6">
            <div className="absolute inset-0 bg-[url(./assets/overlay.svg)] bg-repeat opacity-50 mix-blend-multiply"></div>
            <div className="relative z-1 flex w-full items-center leading-[1.2] font-semibold md:text-xl xl:text-2xl">
              <span className="mr-4 flex-none rounded-lg border-2 border-white px-2 py-1 text-xs font-extrabold tracking-wider uppercase">
                {'Quiz'}
              </span>
              <div className="flex-auto text-center">{buttonText}</div>
            </div>
            <span className="transition">
              <svg fill="none" height="24" width="24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 5l7 7m0 0l-7 7m7-7H6"
                />
              </svg>
            </span>
          </div>
        </button>
      </div>

      {quizModalOpen != null && (
        <QuizModal
          open={quizModalOpen}
          onClose={() => setQuizModalOpen(null)}
        />
      )}
    </>
  )
}
