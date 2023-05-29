import { ReactElement, useState } from 'react'
import IconButton from '@mui/material/IconButton'
import Like from '@core/shared/ui/CustomIcon/outlined/Like'
import ThumbsDown from '@core/shared/ui/CustomIcon/outlined/ThumbsDown'

type ReactionVariant = 'like' | 'thumbsdown'

// remove this once we've decided on the animation
type AnimationVariant = 'bounce' | 'shake'

interface ReactionButtonProps {
  variant: ReactionVariant
  animation?: AnimationVariant
}

export function ReactionButton({
  variant,
  animation
}: ReactionButtonProps): ReactElement {
  const [clicked, setClicked] = useState(false)

  const handleClick = (): void => {
    setClicked(true)
    setTimeout(() => {
      setClicked(false)
    }, 1000)
  }

  return (
    <IconButton
      onClick={handleClick}
      sx={{
        ...(clicked && {
          ...(animation === 'bounce' && {
            animation: 'bounce 0.5s',
            transformOrigin: 'center',
            '@keyframes bounce': {
              '0%': { transform: 'translateY(0)' },
              '50%': { transform: 'translateY(-10px)' },
              '100%': { transform: 'translateY(0)' }
            }
          }),
          ...(animation === 'shake' && {
            animation: 'shake 0.5s',
            transformOrigin: 'center',
            '@keyframes shake': {
              '0%': { transform: 'translateX(0)' },
              '20%': { transform: 'translateX(-5px)' },
              '40%': { transform: 'translateX(5px)' },
              '60%': { transform: 'translateX(-5px)' },
              '80%': { transform: 'translateX(5px)' },
              '100%': { transform: 'translateX(0)' }
            }
          })
        })
      }}
    >
      {variant === 'like' && <Like />}
      {variant === 'thumbsdown' && <ThumbsDown />}
    </IconButton>
  )
}
