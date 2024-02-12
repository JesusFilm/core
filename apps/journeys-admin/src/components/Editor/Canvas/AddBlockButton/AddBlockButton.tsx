import { ReactElement, useState } from 'react'
import { TreeBlock } from '@core/journeys/ui/block'
import MuiFab from '@mui/material/Fab'
import { GetJourney_journey_blocks_CardBlock as CardBlock } from '../../../../../__generated__/GetJourney'
import Plus3 from '@core/shared/ui/icons/Plus3'
import { AddBlockDrawer } from '../../AddBlockDrawer'
import { Drawer } from '../../Drawer'

interface AddBlockButtonProps {
  selectedCard: TreeBlock<CardBlock>
}

export function AddBlockButton({
  selectedCard
}: AddBlockButtonProps): ReactElement {
  const [open, setOpen] = useState(false)

  function toggleOpen(): void {
    setOpen(!open)
  }

  return (
    <>
      <MuiFab size="large" color="primary" onClick={toggleOpen}>
        <Plus3 sx={{ fontSize: 29 }} />
      </MuiFab>
      <Drawer title={'Add new blocks'} open={open} onClose={toggleOpen}>
        <AddBlockDrawer />
      </Drawer>
    </>
  )
}

// import Card from '@mui/material/Card'
// import { ReactElement } from 'react'

// import { useFlags } from '@core/shared/ui/FlagsProvider'

// import { NewButtonButton } from './NewButtonButton'
// import { NewFormButton } from './NewFormButton'
// import { NewImageButton } from './NewImageButton'
// import { NewRadioQuestionButton } from './NewRadioQuestionButton'
// import { NewSignUpButton } from './NewSignUpButton'
// import { NewTextResponseButton } from './NewTextResponseButton'
// import { NewTypographyButton } from './NewTypographyButton'
// import { NewVideoButton } from './NewVideoButton'
// import { TreeBlock } from '@core/journeys/ui/block'
// import MuiFab from '@mui/material/Fab'
// import { GetJourney_journey_blocks_CardBlock as CardBlock } from '../../../../../__generated__/GetJourney'
// import IconButton from '@mui/material/IconButton'
// import Plus3 from '@core/shared/ui/icons/Plus3'

// interface AddBlockButtonProps {
//   selectedCard: TreeBlock<CardBlock>
// }

// export function AddBlockButton({
//   selectedCard
// }: AddBlockButtonProps): ReactElement {
//   const { formiumForm } = useFlags()

//   const hasVideoBlock =
//     selectedCard?.children?.find(
//       (block) =>
//         block.__typename === 'VideoBlock' &&
//         selectedCard?.coverBlockId !== block.id
//     ) != null

//   const hasChildBlock = selectedCard?.children?.some(
//     (block) => block.id !== selectedCard.coverBlockId
//   )

//   return (
//     <Card
//       variant="outlined"
//       data-testid="AddBlockButton"
//       sx={{
//         display: 'flex',
//         flexDirection: 'column',
//         borderRadius: 2,
//         alignItems: 'center',
//         pointerEvents: hasVideoBlock ? 'none' : 'auto',
//         color: hasVideoBlock ? 'secondary.light' : 'auto'
//       }}
//     >
//       <AddIcon sx={{ m: 3 }} />
//       <NewTypographyButton />
//       <NewImageButton />
//       <NewVideoButton disabled={hasChildBlock} />
//       <NewRadioQuestionButton />
//       <NewTextResponseButton />
//       <NewSignUpButton />
//       <NewButtonButton />
//       {formiumForm && <NewFormButton />}
//     </Card>
//   )
// }
