import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

import { SlideWrapper } from '../SlideComponents/SlideWrapper'
import { Options } from '../SlideComponents/Options'
import { ActionMetadata } from '../SlideComponents/Action'

const actions: ActionMetadata[] = [
  {
    id: 'branch_general_power',
    label: 'A general higher power',
    imageUrl: 'https://cdn-std.droplr.net/files/acc_760170/MiVmxZ',
    tags: ['general_power'],
    next: 'branch_general_power'
  },
  {
    id: 'branch_bible',
    label: 'The God of the Bible',
    imageUrl: 'https://cdn-std.droplr.net/files/acc_760170/MiVmxZ',
    tags: ['bible_god'],
    next: 'branch_bible'
  },
  {
    id: 'branch_islam',
    label: 'Allah (Islam)',
    imageUrl: 'https://cdn-std.droplr.net/files/acc_760170/MiVmxZ',
    tags: ['islam'],
    next: 'branch_islam'
  },
  {
    id: 'branch_hindu',
    label: 'Hindu (many gods)',
    imageUrl: 'https://cdn-std.droplr.net/files/acc_760170/MiVmxZ',
    tags: ['hindu'],
    next: 'branch_hindu'
  },
  {
    id: 'branch_buddhist',
    label: 'Buddhist (no personal creator)',
    imageUrl: 'https://cdn-std.droplr.net/files/acc_760170/MiVmxZ',
    tags: ['buddhist'],
    next: 'branch_buddhist'
  },
  {
    id: 'branch_other',
    label: 'Other',
    imageUrl: 'https://cdn-std.droplr.net/files/acc_760170/MiVmxZ',
    tags: ['other_belief'],
    next: 'branch_other'
  }
]

export function Q2() {
  return (
    <SlideWrapper>
      <Stack
        sx={{
          width: '100%',
          maxWidth: '48rem',
          gap: 4,
          p: 4
        }}
      >
        <Typography
          variant="h4"
          sx={{
            textAlign: 'center',
            fontWeight: 'bold',
            fontFamily: 'var(--font-noto-serif)'
          }}
        >
          ✨ Who do you believe created the soul or spirit?
        </Typography>

        <Options actions={actions} />
      </Stack>
    </SlideWrapper>
  )
}
