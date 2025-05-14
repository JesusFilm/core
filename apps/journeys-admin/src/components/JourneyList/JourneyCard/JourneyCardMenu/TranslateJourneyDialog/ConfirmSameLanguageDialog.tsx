import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import { TranslationDialogWrapper } from '@core/journeys/ui/TranslationDialogWrapper'

export interface ConfirmSameLanguageDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
  loading: boolean
  language: string
}

/**
 * Dialog that asks for confirmation when attempting to translate to the same language
 *
 * @param props Component props
 * @returns React element
 */
export function ConfirmSameLanguageDialog({
  open,
  onClose,
  onConfirm,
  loading,
  language
}: ConfirmSameLanguageDialogProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  return (
    <TranslationDialogWrapper
      open={open}
      onClose={onClose}
      onTranslate={onConfirm}
      loading={loading}
      title={t('Confirm Translation')}
      loadingText={t('Translating your journey...')}
      testId="ConfirmSameLanguageDialog"
    >
      {t(
        'This journey appears to already be in {{language}}. Do you still want to translate it?',
        { language }
      )}
    </TranslationDialogWrapper>
  )
}
