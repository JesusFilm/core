import { useTranslation } from 'next-i18next'

import { Button } from '../../SimpleButton'

export type InteractionType = 'explain' | 'reflect'

interface InteractionStarterProps {
  handleClick: (suggestion: string, type: InteractionType) => void
}

export function InteractionStarter({ handleClick }: InteractionStarterProps) {
  const { t } = useTranslation('apps-journeys')

  return (
    <div className="flex flex-col items-center justify-center pt-0 pb-4 px-4 space-y-6">
      <div className="max-w-xs px-6">
        <h2 className="text-2xl font-bold text-black text-center leading-tight text-foreground">
          {t('How would you like to go deeper?')}
        </h2>
      </div>
      <div className="flex gap-4">
        <Button
          onClick={() => handleClick(t('Explain this content'), 'explain')}
          className="bg-white border border-gray-300 text-gray-500 font-medium px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors duration-200 flex items-center gap-2"
        >
          {/* eslint-disable-next-line i18next/no-literal-string */}
          <span>💡 {t('Explain')}</span>
        </Button>
        <Button
          onClick={() => handleClick(t('Help me reflect on this'), 'reflect')}
          className="bg-white border border-gray-300 text-gray-500 font-medium px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors duration-200 flex items-center gap-2"
        >
          {/* eslint-disable-next-line i18next/no-literal-string */}
          <span>☁️ {t('Reflect')}</span>
        </Button>
      </div>
    </div>
  )
}
