import LockIcon from '@mui/icons-material/Lock'
import LockOpenIcon from '@mui/icons-material/LockOpen'
import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'

import type { TreeBlock } from '@core/journeys/ui/block'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import { getStepHeading } from '@core/journeys/ui/getStepHeading'

import { GetJourney_journey_blocks_StepBlock as StepBlock } from '../../../../../../../__generated__/GetJourney'
import { Attribute } from '../../Attribute'

import { NextCard } from './NextCard'

export function Step({
  id,
  nextBlockId,
  parentOrder,
  locked
}: TreeBlock<StepBlock>): ReactElement {
  const {
    state: { steps },
    dispatch
  } = useEditor()
  const { t } = useTranslation('apps-journeys-admin')

  let nextStep: TreeBlock<StepBlock> | undefined
  if (nextBlockId != null) {
    nextStep = steps?.find((step) => nextBlockId === step.id)
  } else if (parentOrder != null) {
    nextStep = steps?.find((step) => parentOrder + 1 === step.parentOrder)
  }

  const heading =
    nextStep != null && steps != null
      ? getStepHeading(nextStep.id, nextStep.children, steps, t)
      : 'None'

  return (
    <Attribute
      id={`${id}-next-block`}
      icon={locked ? <LockIcon /> : <LockOpenIcon />}
      name="Next Card"
      value={heading}
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
