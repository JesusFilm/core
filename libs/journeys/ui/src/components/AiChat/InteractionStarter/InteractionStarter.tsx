import { useTranslation } from 'next-i18next'

import { Button } from '../../SimpleButton'

export type InteractionType = 'explain' | 'reflect'

interface InteractionStarterProps {
  handleClick: (suggestion: string, type: InteractionType) => void
}

export function InteractionStarter({ handleClick }: InteractionStarterProps) {
  const { t } = useTranslation('apps-journeys')

  return (
    <div className="flex flex-col items-center justify-center space-y-6 px-4 pt-0 pb-4">
      <div className="max-w-xs px-6">
        <h2 className="text-foreground text-center text-2xl leading-tight font-bold text-black">
          {t('How would you like to go deeper?')}
        </h2>
      </div>
      <div className="flex gap-4">
        <Button
          onClick={() => handleClick(t('Explain this content'), 'explain')}
          className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-6 py-3 font-medium text-gray-500 transition-colors duration-200 hover:bg-gray-50"
        >
          {/* eslint-disable-next-line i18next/no-literal-string */}
          <span>💡 {t('Explain')}</span>
        </Button>
        <Button
          onClick={() => handleClick(t('Help me reflect on this'), 'reflect')}
          className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-6 py-3 font-medium text-gray-500 transition-colors duration-200 hover:bg-gray-50"
        >
          {/* eslint-disable-next-line i18next/no-literal-string */}
          <span>☁️ {t('Reflect')}</span>
        </Button>
      </div>
    </div>
  )
}
