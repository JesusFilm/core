import AddIcon from '@mui/icons-material/Add'
import Card from '@mui/material/Card'
import { ReactElement } from 'react'

import { TreeBlock } from '@core/journeys/ui/block'
import { useFlags } from '@core/shared/ui/FlagsProvider'

import { GetJourney_journey_blocks_CardBlock as CardBlock } from '../../../../../__generated__/GetJourney'

import { NewButtonButton } from './NewButtonButton'
import { NewFormButton } from './NewFormButton'
import { NewImageButton } from './NewImageButton'
import { NewRadioQuestionButton } from './NewRadioQuestionButton'
import { NewSignUpButton } from './NewSignUpButton'
import { NewTextResponseButton } from './NewTextResponseButton'
import { NewTypographyButton } from './NewTypographyButton'
import { NewVideoButton } from './NewVideoButton'

interface AddBlockToolbarProps {
  selectedCard: TreeBlock<CardBlock>
}

export function AddBlockToolbar({
  selectedCard
}: AddBlockToolbarProps): ReactElement {
  const { formiumForm } = useFlags()

  const hasVideoBlock =
    selectedCard?.children?.find(
      (block) =>
        block.__typename === 'VideoBlock' &&
        selectedCard?.coverBlockId !== block.id
    ) != null

  const hasChildBlock = selectedCard?.children?.some(
    (block) => block.id !== selectedCard.coverBlockId
  )

  return (
    <Card
      variant="outlined"
      data-testid="AddBlockToolbar"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 2,
        alignItems: 'center',
        pointerEvents: hasVideoBlock ? 'none' : 'auto',
        color: hasVideoBlock ? 'secondary.light' : 'auto'
      }}
    >
      <AddIcon sx={{ m: 3 }} />
      <NewTypographyButton />
      <NewImageButton />
      <NewVideoButton disabled={hasChildBlock} />
      <NewRadioQuestionButton />
      <NewTextResponseButton />
      <NewSignUpButton />
      <NewButtonButton />
      {formiumForm && <NewFormButton />}
    </Card>
  )
}
