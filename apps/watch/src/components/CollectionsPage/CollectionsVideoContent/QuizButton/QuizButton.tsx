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
      <div className="px-6 lg:px-8 pt-12 mx-auto w-full sm:w-auto lg:w-1/2 xl:w-1/2 2xl:w-2xl">
        <button
          onClick={handleClick}
          className="relative w-full overflow-hidden bg-gradient-to-tr from-yellow-500 via-amber-500 to-red-700 bg-blend-multiply animate-mesh-gradient hover:animate-mesh-gradient-fast rounded-lg shadow-lg group hover:bg-orange-500"
          aria-label="Open faith quiz"
          tabIndex={0}
        >
          <div className="flex justify-between items-center cursor-pointer p-4 xl:p-6">
            <div className="absolute inset-0 bg-[url(./assets/overlay.svg)] bg-repeat mix-blend-multiply opacity-50"></div>
            <div className="relative z-1 flex w-full items-center font-semibold leading-[1.2] md:text-xl xl:text-2xl">
              <span className="flex-none uppercase font-extrabold text-xs border-2 tracking-wider border-white rounded-lg px-2 py-1 mr-4">
                {'Quiz'}
              </span>
              <div className="text-center flex-auto">{buttonText}</div>
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
