import { useTranslation } from 'next-i18next'

import { useQuiz } from '../QuizProvider'
import { Input } from '../Templates/Input'

export function Name() {
  const { t } = useTranslation('apps-watch')
  const { profile, setName, goTo } = useQuiz()

  const handleSubmit = (value: string) => {
    setName(value)
    goTo('q1')
  }

  return (
    <Input
      label={t('My name is')}
      initialValue={profile.name ?? ''}
      buttonText={t('Next')}
      headings={[
        {
          text: t("OK. Let's get started"),
          variant: 'h4'
        }
      ]}
      onSubmit={handleSubmit}
    />
  )

  return (
    <div className="min-h-screen flex flex-col items-center justify-center  px-4 font-sans">
      <div className="flex flex-col items-center w-full max-w-3xl">
        <div className="mb-8 mt-2">
          <p className="text-center text-xl">{t("OK. Let's get started")}</p>
        </div>
        <div className="flex flex-col items-center mb-4 w-full">
          <h1 className="text-6xl font-bold text-black leading-tight text-center">
            {t('My name is')}
          </h1>
          <input
            type="text"
            aria-label={t('First Name')}
            className="mt-2 text-6xl font-bold text-black placeholder-stone-300 bg-transparent border-0 border-b border-stone-400 focus:border-black focus:outline-none focus:ring-0 min-w-[8ch] w-auto max-w-[360px] px-2 pb-1 overflow-x-auto truncate flex-shrink-0 text-center"
            placeholder={t('First Name')}
            value={name}
            onChange={(e) => setNameValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            tabIndex={0}
            ref={(input) => {
              if (input) {
                input.focus()
              }
            }}
          />
        </div>
        <button
          className="mt-8 px-10 py-3 rounded-md bg-black text-white font-bold text-lg transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleSubmit}
          disabled={!name.trim()}
          tabIndex={0}
        >
          {t('Next')}
        </button>
      </div>
    </div>
  )
}
