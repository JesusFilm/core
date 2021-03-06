import { ReactElement } from 'react'
import Typography from '@mui/material/Typography'
import Skeleton from '@mui/material/Skeleton'
import Box from '@mui/material/Box'
import type { TreeBlock } from '@core/journeys/ui/block'
import { useBreakpoints } from '@core/shared/ui/useBreakpoints'
import { useRouter } from 'next/router'
import { BlockFields_StepBlock as StepBlock } from '../../../../__generated__/BlockFields'
import { CardPreview } from '../../CardPreview'

export interface CardViewProps {
  id?: string
  blocks?: Array<TreeBlock<StepBlock>>
}

export function CardView({ id, blocks }: CardViewProps): ReactElement {
  const breakpoints = useBreakpoints()
  const router = useRouter()

  const handleSelect = (step: { id: string }): void => {
    if (id == null) return

    void router.push(`/journeys/${id}/edit?stepId=${step.id}`, undefined, {
      shallow: true
    })
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
        showAddButton
        isDraggable={false}
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
