import { TreeBlock, useEditor, getStepHeading } from '@core/journeys/ui'
import { ReactElement } from 'react'
import LockIcon from '@mui/icons-material/Lock'
import LockOpenIcon from '@mui/icons-material/LockOpen'
import { GetJourney_journey_blocks_StepBlock as StepBlock } from '../../../../../../../__generated__/GetJourney'
import { Attribute } from '../..'
import { NextCard } from './NextCard'

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
  const heading = getStepHeading({
    stepId: nextBlockId,
    stepChildren: nextBlock?.children,
    steps
  })

  return (
    <Attribute
      id={`${id}-next-block`}
      icon={locked ? <LockIcon /> : <LockOpenIcon />}
      name="Next Card"
      value={heading ?? 'Untitled'}
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
