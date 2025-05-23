import { useTranslation } from 'next-i18next'

import { Options } from '../Templates/Options'

export function RareView() {
  const { t } = useTranslation('apps-watch')

  return (
    <Options
      bgColor="#fffaf0"
      headings={[
        {
          variant: 'h4',
          text: t('A RARE BUT REAL VIEW')
        },
        {
          variant: 'h5',
          text: t('~20% of people believe humans are only physical')
        },
        {
          variant: 'body1',
          text: t(
            "Roughly 1 in 5 share your view — but what if there's something beyond the physical?"
          )
        }
      ]}
      options={[
        {
          id: 'question_2',
          label: t('Is there more to us?'),
          tags: ['explore_more'],
          next: 'question_2'
        }
      ]}
    />
  )
}
