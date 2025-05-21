import { useTranslation } from 'next-i18next'

import { Options } from '../Templates/Options'

export function Q2() {
  const { t } = useTranslation('apps-watch')

  return (
    <Options
      bgColor="#f0fff0"
      headings={[
        {
          text: t('Question 2: Who do you believe created the soul or spirit?'),
          variant: 'h4'
        }
      ]}
      options={[
        {
          id: 'branch_general_power',
          label: t('A general higher power'),
          imageUrl: 'https://cdn-std.droplr.net/files/acc_760170/MiVmxZ',
          tags: ['general_power'],
          next: 'branch_bible'
        },
        {
          id: 'branch_bible',
          label: t('The God of the Bible'),
          imageUrl: 'https://cdn-std.droplr.net/files/acc_760170/MiVmxZ',
          tags: ['bible_god'],
          next: 'branch_bible'
        },
        {
          id: 'branch_islam',
          label: t('Allah (Islam)'),
          imageUrl: 'https://cdn-std.droplr.net/files/acc_760170/MiVmxZ',
          tags: ['islam'],
          next: 'branch_islam'
        },
        {
          id: 'branch_hindu',
          label: t('Hindu (many gods)'),
          imageUrl: 'https://cdn-std.droplr.net/files/acc_760170/MiVmxZ',
          tags: ['hindu'],
          next: 'branch_hindu'
        },
        {
          id: 'branch_buddhist',
          label: t('Buddhist (no personal creator)'),
          imageUrl: 'https://cdn-std.droplr.net/files/acc_760170/MiVmxZ',
          tags: ['buddhist'],
          next: 'branch_buddhist'
        },
        {
          id: 'branch_other',
          label: t('Other'),
          imageUrl: 'https://cdn-std.droplr.net/files/acc_760170/MiVmxZ',
          tags: ['other_belief'],
          next: 'branch_other'
        }
      ]}
    />
  )
}
