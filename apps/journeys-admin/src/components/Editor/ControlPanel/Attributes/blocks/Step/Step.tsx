import { TreeBlock, useEditor } from '@core/journeys/ui'
import { ReactElement } from 'react'
import LockIcon from '@mui/icons-material/Lock'
import LockOpenIcon from '@mui/icons-material/LockOpen'
import { GetJourney_journey_blocks_StepBlock as StepBlock } from '../../../../../../../__generated__/GetJourney'
import { Attribute } from '../..'
import { BlockFields_TypographyBlock as TypographyBlock } from '../../../../../../../__generated__/BlockFields'
import { NextCard } from './NextCard'

function flatten(children: TreeBlock[]): TreeBlock[] {
  return children.reduce(
    (result, item) => [...result, item, ...flatten(item.children)],
    []
  )
}

export function Step({
  id,
  nextBlockId,
  locked
}: TreeBlock<StepBlock>): ReactElement {
  const {
    state: { steps },
    dispatch
  } = useEditor()
  const nextBlock = steps?.find(({ id }) => id === nextBlockId)
  const nextBlockDescendants = flatten(nextBlock?.children ?? [])
  const nextBlockHeading = nextBlockDescendants.find(
    (block) => block.__typename === 'TypographyBlock'
  ) as TreeBlock<TypographyBlock> | undefined

  return (
    <Attribute
      id={`${id}-next-block`}
      icon={locked ? <LockIcon /> : <LockOpenIcon />}
      name="Next Card"
      value={
        nextBlock != null ? nextBlockHeading?.content ?? 'Untitled' : 'None'
      }
      description={locked ? 'Locked With Interaction' : 'Unlocked Card'}
      onClick={() => {
        dispatch({
          type: 'SetDrawerPropsAction',
          title: 'Next Card Properties',
          mobileOpen: true,
          children: <NextCard />
        })
      }}
    />
  )
}
