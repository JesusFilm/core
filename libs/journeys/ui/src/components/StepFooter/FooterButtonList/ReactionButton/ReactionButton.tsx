import { ReactElement, useState } from 'react'
import ThumbsUp from '@core/shared/ui/icons/ThumbsUp'
import ThumbsDown from '@core/shared/ui/icons/ThumbsDown'
import { StyledFooterButton } from '../StyledFooterButton'

type ReactionVariant = 'thumbsup' | 'thumbsdown'

interface ReactionButtonProps {
  variant: ReactionVariant
}

export function ReactionButton({ variant }: ReactionButtonProps): ReactElement {
  const [clicked, setClicked] = useState(false)

  const handleClick = (): void => {
    setClicked(true)
    setTimeout(() => {
      setClicked(false)
    }, 1000)
  }

  return (
    <StyledFooterButton onClick={handleClick} clicked={clicked}>
      {variant === 'thumbsup' && <ThumbsUp />}
      {variant === 'thumbsdown' && <ThumbsDown />}
    </StyledFooterButton>
  )
}
