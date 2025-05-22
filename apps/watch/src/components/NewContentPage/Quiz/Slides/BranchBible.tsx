import { useTranslation } from 'next-i18next'

import { Options } from '../Templates/Options'

export function BranchBible() {
  const { t } = useTranslation('apps-watch')

  return (
    <Options
      bgColor="#f5f5dc"
      bgImage="https://example.com/images/beyond.jpg"
      headings={[
        {
          variant: 'h4',
          text: t('🙏 Most believe in something beyond')
        },
        {
          variant: 'body1',
          text: t(
            "The majority of people believe in a spiritual realm. Let's explore what it means to believe in the God of the Bible."
          )
        }
      ]}
      options={[
        {
          id: 'question_bible_path',
          label: t("What's next?"),
          tags: ['explore_bible'],
          next: 'question_bible_path'
        }
      ]}
    />
  )
}
