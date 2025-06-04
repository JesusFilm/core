import { useTranslation } from 'next-i18next'

import { Options } from '../Templates/Options'

export function QuestionBiblePath() {
  const { t } = useTranslation('apps-watch')

  return (
    <Options
      bgColor="#fff0f5"
      headings={[
        {
          variant: 'h4',
          text: t("🕊️ What's your Christian background?")
        },
        {
          variant: 'body1',
          text: t('Choose what fits best:')
        }
      ]}
      options={[
        {
          id: 'grew_up_church',
          label: t('I grew up in church'),
          tags: ['church_background'],
          next: 'grew_up_church'
        },
        {
          id: 'exploring_now',
          label: t("I'm exploring faith as an adult"),
          tags: ['adult_explorer'],
          next: 'exploring_now'
        },
        {
          id: 'left_church',
          label: t('I left the church'),
          tags: ['church_leaver'],
          next: 'left_church'
        },
        {
          id: 'never_engaged',
          label: t("I've never engaged with Christianity"),
          tags: ['new_to_faith'],
          next: 'never_engaged'
        }
      ]}
    />
  )
}
