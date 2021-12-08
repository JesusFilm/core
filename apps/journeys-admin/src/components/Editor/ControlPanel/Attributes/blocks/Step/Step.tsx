import { TreeBlock } from '@core/journeys/ui'
import { ReactElement, useContext } from 'react'
import { GetJourneyForEdit_journey_blocks_StepBlock as StepBlock } from '../../../../../../../__generated__/GetJourneyForEdit'
import { Lock as LockIcon, LockOpen as LockOpenIcon } from '@mui/icons-material'
import { Attribute } from '../..'
import { EditorContext } from '../../../../Context'
import { BlockFields_TypographyBlock as TypographyBlock } from '../../../../../../../__generated__/BlockFields'

function flatten(children: TreeBlock[]): TreeBlock[] {
  return children.reduce(
    (result, item) => [...result, item, ...flatten(item.children)],
    []
  )
}

export function Step({
  locked,
  nextBlockId
}: TreeBlock<StepBlock>): ReactElement {
  const {
    state: { steps }
  } = useContext(EditorContext)
  const nextBlock = steps.find(({ id }) => id === nextBlockId)
  const nextBlockDescendants = flatten(nextBlock?.children ?? [])
  const nextBlockHeading = nextBlockDescendants.find(
    (block) => block.__typename === 'TypographyBlock'
  ) as TreeBlock<TypographyBlock> | undefined

  return (
    <Attribute
      icon={locked ? <LockIcon /> : <LockOpenIcon />}
      name="Next Card"
      value={
        nextBlock != null ? nextBlockHeading?.content ?? 'Untitled' : 'None'
      }
      description={locked ? 'Locked With Interaction' : 'Unlocked Card'}
    />
  )
}
