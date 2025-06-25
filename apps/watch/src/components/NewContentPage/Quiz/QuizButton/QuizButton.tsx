import Button from '@mui/material/Button'
import { useTranslation } from 'next-i18next'
import { useState } from 'react'

import { QuizModal } from '../QuizModal'

export function QuizButton() {
  const { t } = useTranslation('apps-watch')
  const [showQuiz, setShowQuiz] = useState(false)

  return (
    <>
      <button
        onClick={() => setShowQuiz(true)}
        className="relative overflow-hidden bg-gradient-to-tr from-yellow-500 via-amber-500 to-red-700 bg-blend-multiply animate-mesh-gradient hover:animate-mesh-gradient-fast rounded-lg shadow-lg group hover:bg-orange-500"
        aria-label="Open faith quiz"
        tabIndex={0}
      >
        <div className="flex justify-between items-center gap-4 cursor-pointer p-4 xl:p-6">
          <div className="absolute inset-0 bg-[url(./assets/overlay.svg)] bg-repeat mix-blend-multiply opacity-50"></div>
          <div className="relative z-1 flex w-full items-center font-semibold leading-[1.2] md:text-xl xl:text-2xl">
            <span className="flex-none uppercase font-extrabold text-xs border-2 tracking-wider border-white rounded-lg px-2 py-1 mr-4">
              {'Quiz'}
            </span>
            <div className="text-center flex-auto">{t('Quiz')}</div>
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
      {/* <Button onClick={() => setShowQuiz(true)}>{t('Quiz')}</Button> */}
      <QuizModal open={showQuiz} onClose={() => setShowQuiz(false)} />
    </>
  )
}
