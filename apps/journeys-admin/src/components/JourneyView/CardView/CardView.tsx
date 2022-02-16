import { ReactElement } from 'react'
import Typography from '@mui/material/Typography'
import { TreeBlock } from '@core/journeys/ui'
import { useBreakpoints } from '@core/shared/ui'
import { useRouter } from 'next/router'
import { BlockFields_StepBlock as StepBlock } from '../../../../__generated__/BlockFields'
import { CardPreview } from '../../CardPreview'

export interface CardViewProps {
  slug: string
  blocks: Array<TreeBlock<StepBlock>>
}

export function CardView({ slug, blocks }: CardViewProps): ReactElement {
  const breakpoints = useBreakpoints()
  const router = useRouter()

  const handleSelect = (step: { id: string }): void => {
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
      <Typography variant="body1" sx={{ pt: 2, textAlign: 'center' }}>
        {stepBlockLength > 0
          ? breakpoints.md
            ? `${cardNumber} in this journey`
            : `${cardNumber}`
          : 'Select Empty Card to add'}
      </Typography>
    </>
  )
}
