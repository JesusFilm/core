import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

import { SlideWrapper } from '../SlideComponents/SlideWrapper'
import { Options } from '../SlideComponents/Options'
import { ActionMetadata } from '../SlideComponents/Action'

const actions: ActionMetadata[] = [
  {
    id: 'rare_view',
    label: 'Only a body, nothing more',
    tags: ['materialist_view'],
    next: 'rare_view'
  },
  {
    id: 'question_2',
    label: 'Body and soul / spirit',
    tags: ['dualist_view'],
    next: 'question_2'
  },
  {
    id: 'question_2',
    label: 'Not sure, but open to exploring',
    tags: ['exploring_view'],
    next: 'question_2'
  }
]

export function Q1() {
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
          🧍 What do you believe a human being is?
        </Typography>

        <Typography
          variant="body1"
          sx={{
            textAlign: 'center',
            color: 'text.secondary'
          }}
        >
          Choose one:
        </Typography>

        <Options actions={actions} />
      </Stack>
    </SlideWrapper>
  )
}
