import { useTranslation } from 'next-i18next'

import { Options } from '../Templates/Options'

export function ExploringNow() {
  const { t } = useTranslation('apps-watch')

  return (
    <Options
      bgColor="#e6f2ff"
      headings={[
        {
          variant: 'h4',
          text: t("📖 You're not alone in exploring faith now")
        },
        {
          variant: 'body1',
          text: t(
            'Many people come to faith later in life — not out of pressure, but genuine curiosity.'
          )
        }
      ]}
      options={[
        {
          id: 'recommendation_explore',
          label: t('See where the Bible story begins'),
          tags: ['begin_journey'],
          next: 'recommendation_explore'
        }
      ]}
    />
  )
}
