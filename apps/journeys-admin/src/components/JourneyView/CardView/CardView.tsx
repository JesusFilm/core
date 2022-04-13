import { ReactElement } from 'react'
import Typography from '@mui/material/Typography'
import Skeleton from '@mui/material/Skeleton'
import Box from '@mui/material/Box'
import { TreeBlock } from '@core/journeys/ui'
import { useBreakpoints } from '@core/shared/ui'
import { useRouter } from 'next/router'
import { BlockFields_StepBlock as StepBlock } from '../../../../__generated__/BlockFields'
import { CardPreview } from '../../CardPreview'

export interface CardViewProps {
  slug?: string
  blocks?: Array<TreeBlock<StepBlock>>
}

export function CardView({ slug, blocks }: CardViewProps): ReactElement {
  const breakpoints = useBreakpoints()
  const router = useRouter()

  const handleSelect = (step: { id: string }): void => {
    if (slug == null) return

    void router.push({
      pathname: '/journeys/[slug]/edit',
      query: { slug, stepId: step.id }
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
      <CardPreview onSelect={handleSelect} steps={blocks} showAddButton />
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
