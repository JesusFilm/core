import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

import { SlideWrapper } from '../SlideComponents/SlideWrapper'
import { Options } from '../SlideComponents/Options'
import { ActionMetadata } from '../SlideComponents/Action'

const actions: ActionMetadata[] = [
  {
    id: 'question_2',
    label: 'Is there more to us?',
    tags: ['exploring_more'],
    next: 'question_2'
  }
]

export function RareView() {
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
          A RARE BUT REAL VIEW
        </Typography>

        <Typography
          variant="h5"
          sx={{
            textAlign: 'center',
            color: 'text.secondary'
          }}
        >
          ~20% of people believe humans are only physical
        </Typography>

        <Typography
          variant="body1"
          sx={{
            textAlign: 'center',
            color: 'text.secondary'
          }}
        >
          Roughly 1 in 5 share your view — but what if there's something beyond
          the physical?
        </Typography>

        <Options actions={actions} />
      </Stack>
    </SlideWrapper>
  )
}
