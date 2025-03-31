import dynamic from 'next/dynamic'
import { ReactElement, useState } from 'react'

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

export const QuizButton = (): ReactElement => {
  const [quizModalOpen, setQuizModalOpen] = useState<boolean | null>(null)

  return (
    <>
      <div className="px-6 lg:px-8 pt-12 mx-auto lg:w-1/2 xl:w-1/2 2xl:w-2xl">
        <button
          onClick={() => setQuizModalOpen(true)}
          className="relative w-full overflow-hidden bg-gradient-to-tr from-yellow-500 via-amber-500 to-red-700 bg-blend-multiply animate-mesh-gradient hover:animate-mesh-gradient-fast rounded-lg shadow-lg group hover:bg-orange-500"
          aria-label="Open faith quiz"
          tabIndex={0}
        >
          <div className="flex justify-between items-center cursor-pointer p-4 xl:p-6">
            <div className="absolute inset-0 bg-[url(./assets/overlay.svg)] bg-repeat mix-blend-multiply opacity-50"></div>
            <div className="relative z-1 flex w-full items-center font-semibold leading-[1.2] md:text-xl xl:text-2xl">
              <span className="flex-none uppercase font-extrabold text-xs border-2 tracking-wider border-white rounded-lg px-2 py-1 mr-4">
                {'Тест'}
              </span>
              <div className="text-center flex-auto">
                {'Какой ваш следующий шаг веры?'}
              </div>
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
