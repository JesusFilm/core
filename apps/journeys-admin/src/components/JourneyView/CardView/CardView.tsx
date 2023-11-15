import Box from '@mui/material/Box'
import Skeleton from '@mui/material/Skeleton'
import Typography from '@mui/material/Typography'
import { useRouter } from 'next/router'
import { ReactElement } from 'react'

import type { TreeBlock } from '@core/journeys/ui/block'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { useBreakpoints } from '@core/shared/ui/useBreakpoints'

import { BlockFields_StepBlock as StepBlock } from '../../../../__generated__/BlockFields'
import { CardPreview, OnSelectProps } from '../../CardPreview'

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

    if (view != null) {
      void router.push(`/journeys/${location}?view=${view}`, undefined, {
        shallow: true
      })
      return
    }

    if (journey?.template !== true) {
      void router.push(`/journeys/${location}`, undefined, {
        shallow: true
      })
    } else if (journey.template && isPublisher === true) {
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
        showNavigationCards
        isDraggable={false}
        testId="CardView"
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
