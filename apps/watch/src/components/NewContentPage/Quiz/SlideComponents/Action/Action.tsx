import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Image from 'next/image'
import { useCallback } from 'react'

import { useQuiz } from '../../QuizProvider'

export interface ActionMetadata {
  id: string
  label: string
  imageUrl?: string
  tags: string[]
  next: string | null
}

interface ActionButtonProps extends ActionMetadata {
  idx: number
  onHover: (idx: number | null) => void
}

export const Action = ({
  idx,
  label,
  imageUrl,
  tags,
  next,
  onHover
}: ActionButtonProps) => {
  const { addTags, goTo } = useQuiz()

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        addTags(tags)
        if (next) {
          goTo(next)
        }
      }
    },
    [idx, next, addTags, goTo]
  )

  const handleClick = () => {
    addTags(tags)
    if (next) {
      goTo(next)
    }
  }

  if (idx != 0) {
    return (
      <Stack
        role="option"
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onMouseEnter={() => onHover(idx)}
        onMouseLeave={() => onHover(null)}
        onFocus={() => onHover(idx)}
        onBlur={() => onHover(null)}
        tabIndex={0}
        aria-label={label}
        sx={{
          position: 'relative',
          width: '320px',
          height: '320px',
          overflow: 'hidden',
          borderRadius: 4,
          boxShadow: 2,
          cursor: 'pointer',
          justifyContent: 'flex-end',
          p: 4,
          transition: 'all 150ms ease',
          '&:hover, &:focus': {
            outline: '3px solid white',
            scale: 1.05,
            boxShadow: 3
          }
        }}
      >
        {imageUrl && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%'
            }}
          >
            <Image
              src={imageUrl}
              alt={label}
              fill
              style={{
                objectFit: 'cover',
                width: '100%',
                height: '100%'
              }}
            />
          </Box>
        )}
        <Typography
          variant="h6"
          color="white"
          sx={{
            position: 'relative',
            zIndex: 10,
            textAlign: 'center',
            fontWeight: 'bold',
            fontSize: '1.25rem',
            lineHeight: 'calc(1.75rem / 1.25)',
            fontFamily: 'var(--font-noto-serif)'
          }}
        >
          {label}
        </Typography>
      </Stack>
    )
  }
}
