import { ReactElement, useState } from 'react'

import ThumbsDown from '@core/shared/ui/icons/ThumbsDown'
import ThumbsUp from '@core/shared/ui/icons/ThumbsUp'

import { StyledFooterButton } from '../StyledFooterButton'

interface ReactionButtonProps {
  variant: 'thumbsup' | 'thumbsdown'
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
