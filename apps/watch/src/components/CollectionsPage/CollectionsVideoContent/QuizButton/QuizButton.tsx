import dynamic from 'next/dynamic'
import { useTranslation } from 'next-i18next'
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
  const { t } = useTranslation('apps-watch')

  const [quizModalOpen, setQuizModalOpen] = useState<boolean | null>(null)

  return (
    <>
      <div className="px-6 lg:px-8 pt-12 mx-auto lg:w-1/2 xl:w-1/3">
        <button
          onClick={() => setQuizModalOpen(true)}
          className="relative w-full overflow-hidden bg-gradient-to-tr from-yellow-500 via-amber-500 to-red-700 bg-blend-multiply animate-mesh-gradient hover:animate-mesh-gradient-fast rounded-lg shadow-lg group cursor-pointer border-none text-left p-0 hover:translate-y-[-2px] transition-transform duration-200 ease-in-out"
          aria-label="Open faith quiz"
          tabIndex={0}
        >
          <div className="flex justify-between items-center cursor-pointer p-4">
            <div className="absolute inset-0 overlay-texture"></div>
            <div className="relative z-1 flex w-full items-center font-semibold leading-[1.2]">
              <span className="flex-none uppercase font-extrabold text-xs border-2 tracking-wider border-white rounded-lg px-2 py-1 mr-4">
                {t('Quiz')}
              </span>
              <div className="text-center flex-auto">
                {t("What's your next step of faith?")}
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
