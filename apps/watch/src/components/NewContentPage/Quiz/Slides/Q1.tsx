import { useTranslation } from 'next-i18next'

import { Options } from '../Templates/Options'

export function Q1() {
  const { t } = useTranslation('apps-watch')

  return (
    <Options
      bgImage="https://cdn-std.droplr.net/files/acc_760170/MiVmxZ"
      headings={[
        {
          variant: 'h4',
          text: t('Question 1: What do you believe a human being is?')
        }
      ]}
      options={[
        {
          id: 'rare_view',
          label: t('Only a body, nothing more'),
          tags: ['materialist_view'],
          next: 'rare_view'
        },
        {
          id: 'question_2',
          label: t('Body and soul / spirit'),
          tags: ['dualist_view'],
          next: 'question_2'
        },
        {
          id: 'question_2',
          label: t('Not sure, but open to exploring'),
          tags: ['exploring_view'],
          next: 'question_2'
        }
      ]}
    />
  )
}
