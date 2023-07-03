import { ReactElement, useState } from 'react'
import ThumbsUp from '@core/shared/ui/icons/ThumbsUp'
import ThumbsDown from '@core/shared/ui/icons/ThumbsDown'
import Button from '@mui/material/Button'
import { styled } from '@mui/material/styles'

type ReactionVariant = 'thumbsup' | 'thumbsdown'

interface ReactionButtonProps {
  variant: ReactionVariant
}

const StyledButton = styled(Button)<{ clicked: boolean }>(
  ({ theme, clicked }) => ({
    minWidth: 56,
    borderRadius: 20,
    backgroundColor: theme.palette.mode === 'dark' ? '#DCDDE526' : '#DCDDE54D',
    ...(clicked && {
      animation: 'bounce 0.5s',
      '@keyframes bounce': {
        '0%': { transform: 'translateY(0)' },
        '40%': { transform: 'translateY(-10px)' },
        '50%': { transform: 'translateY(0)' },
        '60%': { transform: 'translateY(-5px)' },
        '100%': { transform: 'translateY(0)' }
      }
    })
  })
)

export function ReactionButton({ variant }: ReactionButtonProps): ReactElement {
  const [clicked, setClicked] = useState(false)

  const handleClick = (): void => {
    setClicked(true)
    setTimeout(() => {
      setClicked(false)
    }, 1000)
  }

  return (
    <StyledButton onClick={handleClick} clicked={clicked}>
      {variant === 'thumbsup' && <ThumbsUp />}
      {variant === 'thumbsdown' && <ThumbsDown />}
    </StyledButton>
  )
}
