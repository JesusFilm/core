import Stack from '@mui/material/Stack'
import { ReactElement } from 'react'

import { useFlags } from '@core/shared/ui/FlagsProvider'

import { NewButtonButton } from './NewButtonButton'
import { NewFormButton } from './NewFormButton'
import { NewImageButton } from './NewImageButton'
import { NewRadioQuestionButton } from './NewRadioQuestionButton'
import { NewSignUpButton } from './NewSignUpButton'
import { NewTextResponseButton } from './NewTextResponseButton'
import { NewTypographyButton } from './NewTypographyButton'
import { NewVideoButton } from './NewVideoButton'
import AddIcon from '@mui/icons-material/Add'
import { TreeBlock } from '@core/journeys/ui/block'
import { GetJourney_journey_blocks_CardBlock as CardBlock } from '../../../../../__generated__/GetJourney'

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

  return (
    <>
      <Stack
        data-testid="AddBlockToolbar"
        sx={{
          justifyContent: 'space-evenly',
          alignItems: 'center',
          display: 'flex',
          pointerEvents: hasVideoBlock ? 'none' : 'auto',
          color: hasVideoBlock ? 'secondary.light' : 'secondary.dark'
        }}
      >
        <AddIcon sx={{ m: 3 }} />
        <NewTypographyButton />
        <NewImageButton />
        <NewVideoButton disabled={selectedCard?.children?.length > 0} />
        <NewRadioQuestionButton />
        <NewTextResponseButton />
        <NewSignUpButton />
        <NewButtonButton />
        {formiumForm && <NewFormButton />}
      </Stack>
    </>
  )
}
