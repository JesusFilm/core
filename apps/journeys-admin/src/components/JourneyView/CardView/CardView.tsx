import { ReactElement } from 'react'
import Typography from '@mui/material/Typography'
import Skeleton from '@mui/material/Skeleton'
import Box from '@mui/material/Box'
import type { TreeBlock } from '@core/journeys/ui/block'
import { useBreakpoints } from '@core/shared/ui/useBreakpoints'
import { useRouter } from 'next/router'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { BlockFields_StepBlock as StepBlock } from '../../../../__generated__/BlockFields'
import { CardPreview } from '../../CardPreview'
import { OnSelectProps } from '../../CardPreview/CardPreview'

export interface CardViewProps {
  id?: string
  blocks?: Array<TreeBlock<StepBlock>>
  isPublisher?: boolean
}

export function CardView({
  id,
  blocks,
  isPublisher
}: CardViewProps): ReactElement {
  const { journey } = useJourney()
  const breakpoints = useBreakpoints()
  const router = useRouter()

  const handleSelect = ({ step, view }: OnSelectProps): void => {
    if (id == null) return

    let location = `${id}/edit`
    if (step != null) {
      location += `?stepId=${step.id}`
    }
    if (journey?.template !== true) {
      void router.push(`/journeys/${location}`, undefined, {
        shallow: true
      })
    }
    if (view != null) {
      void router.push(`/journeys/${location}?view=${view}`, undefined, {
        shallow: true
      })
    }

    if (journey?.template === true && isPublisher === true) {
      void router.push(`/publisher/${location}`, undefined, {
        shallow: true
      })
    }
  }

  const stepBlockLength =
    blocks?.filter((block) => block.__typename === 'StepBlock').length ?? 0

  const cardNumber =
    stepBlockLength === 1
      ? `${stepBlockLength} card`
      : `${stepBlockLength} cards`

  return (
    <>
      <CardPreview
        onSelect={handleSelect}
        steps={blocks}
        showAddButton={journey?.template !== true || isPublisher}
        isDraggable={false}
        showActionButton
      />
      <Box sx={{ pt: 2, display: 'flex', justifyContent: 'center' }}>
        <Typography variant="body1">
          {blocks != null ? (
            stepBlockLength > 0 ? (
              breakpoints.md ? (
                `${cardNumber} in this journey`
              ) : (
                `${cardNumber}`
              )
            ) : (
              'Select Empty Card to add'
            )
          ) : (
            <Skeleton variant="text" width={200} />
          )}
        </Typography>
      </Box>
    </>
  )
}
