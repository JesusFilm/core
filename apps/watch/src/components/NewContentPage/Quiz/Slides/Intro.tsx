import { useTranslation } from 'next-i18next'

import { useQuiz } from '../QuizProvider'

export function Intro() {
  const { t } = useTranslation('apps-watch')
  const { goTo } = useQuiz()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 font-sans">
      <div className="flex flex-col items-center w-full max-w-3xl">
        <div className="mb-8 mt-2">
          <h1 className="text-5xl font-bold text-black leading-tight text-center">
            {t('A short quiz to get your curated learning journey')}
          </h1>
        </div>
        <div className="flex flex-col items-center mb-4 w-full">
          <div className="flex flex-row items-center justify-center gap-4">
            <span className="text-md bg-transparent text-slate-500 py-1 px-3 font-medium rounded-full border-2 border-gray-400">
              {t('1 minute quiz')}
            </span>
            <span className="text-md bg-transparent text-slate-500 py-1 px-3 font-medium rounded-full border-2 border-gray-400">
              {t('AI powered')}
            </span>
          </div>
        </div>
        <p className="text-center text-base text-black mt-6 mb-12 max-w-xl">
          <span className="font-bold">*</span>{' '}
          {t(
            'this quiz is for information only and is not mental health diagnostic. If you have physical or mental health symptoms, we recommend seeing your healthcare provider.'
          )}
        </p>
        <button
          onClick={() => goTo('name')}
          className="relative overflow-hidden bg-gradient-to-tr from-yellow-500 via-amber-500 to-red-700 bg-blend-multiply animate-mesh-gradient hover:animate-mesh-gradient-fast rounded-lg shadow-lg group hover:bg-orange-500"
          aria-label="Start Quiz"
          tabIndex={0}
        >
          <div className="flex justify-between items-center cursor-pointer py-4 px-6 xl:py-6 xl:px-8">
            <div className="absolute inset-0 bg-[url(./assets/overlay.svg)] bg-repeat mix-blend-multiply opacity-50"></div>
            <div className="relative z-1 flex w-full items-center font-semibold leading-[1.2] md:text-xl xl:text-2xl">
              <div className="text-center flex-auto text-white">
                {t('Start Quiz')}
              </div>
            </div>
            <span className="transition text-white">
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
    </div>
  )
}
