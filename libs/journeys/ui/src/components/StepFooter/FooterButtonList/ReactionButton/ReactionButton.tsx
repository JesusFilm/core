import { usePlausible } from 'next-plausible'
import { ReactElement, useState } from 'react'

import ThumbsDown from '@core/shared/ui/icons/ThumbsDown'
import ThumbsUp from '@core/shared/ui/icons/ThumbsUp'

import { useBlocks } from '../../../../libs/block'
import { JourneyPlausibleEvents } from '../../../../libs/JourneyPlausibleEvents'
import { useJourney } from '../../../../libs/JourneyProvider'
import { StyledFooterButton } from '../StyledFooterButton'

interface ReactionButtonProps {
  variant: 'thumbsup' | 'thumbsdown'
}

export function ReactionButton({ variant }: ReactionButtonProps): ReactElement {
  const plausible = usePlausible<JourneyPlausibleEvents>()
  const { variant: journeyVariant, journey } = useJourney()
  const { blockHistory } = useBlocks()
  const activeBlock = blockHistory[blockHistory.length - 1]
  const [clicked, setClicked] = useState(false)

  const handleClick = (): void => {
    if (journeyVariant === 'default' || journeyVariant === 'embed') {
      setClicked(true)
      setTimeout(() => {
        setClicked(false)
      }, 1000)

      if (journey != null && activeBlock != null) {
        const input = {
          stepId: activeBlock.id
        }
        plausible(
          `footer${
            variant === 'thumbsup' ? 'ThumbsUp' : 'ThumbsDown'
          }ButtonClick`,
          {
            u: journey.id,
            props: input
          }
        )
      }
    }
  }

  return (
    <StyledFooterButton
      onClick={handleClick}
      clicked={clicked}
      data-testid="ReactionButton"
    >
      {variant === 'thumbsup' && <ThumbsUp sx={{ fontSize: 18 }} />}
      {variant === 'thumbsdown' && <ThumbsDown sx={{ fontSize: 18 }} />}
    </StyledFooterButton>
  )
}
