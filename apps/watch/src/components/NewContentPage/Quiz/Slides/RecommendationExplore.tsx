import { useTranslation } from 'next-i18next'

import { Options } from '../Templates/Options'

export function RecommendationExplore() {
  const { t } = useTranslation('apps-watch')

  return (
    <Options
      bgColor="#f0fff0"
      bgImage="https://example.com/images/biblestudy.jpg"
      headings={[
        {
          variant: 'h4',
          text: t('🌟 Start your journey with purpose')
        },
        {
          variant: 'body1',
          text: t(
            'We invite you to explore the life of Jesus and what the Bible says about your identity and purpose.'
          )
        }
      ]}
      options={[
        {
          id: 'bible_study',
          label: t('Join a video Bible study'),
          tags: ['bible_study'],
          next: 'https://yourplatform.com/bible-study'
        },
        {
          id: 'mentor',
          label: t('Talk to a mentor'),
          tags: ['mentor'],
          next: 'https://yourplatform.com/mentor'
        },
        {
          id: 'community',
          label: t('Find a local community'),
          tags: ['community'],
          next: 'https://yourplatform.com/connect'
        }
      ]}
    />
  )
}
