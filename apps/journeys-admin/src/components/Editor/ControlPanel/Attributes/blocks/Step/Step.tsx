import dynamic from 'next/dynamic'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import type { TreeBlock } from '@core/journeys/ui/block'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import { getStepHeading } from '@core/journeys/ui/getStepHeading'
import Lock1Icon from '@core/shared/ui/icons/Lock1'
import LockOpen1Icon from '@core/shared/ui/icons/LockOpen1'

import { GetJourney_journey_blocks_StepBlock as StepBlock } from '../../../../../../../__generated__/GetJourney'
import { Attribute } from '../../Attribute'

const NextCard = dynamic(
  async () =>
    await import(/* webpackChunkName: "NextCard" */ './NextCard').then(
      (module) => module.NextCard
    ),
  { ssr: false }
)

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
      : t('None')

  return (
    <Attribute
      id={`next-step-${id}`}
      icon={locked ? <Lock1Icon /> : <LockOpen1Icon />}
      name={t('Next Card')}
      value={heading}
      description={locked ? t('Locked With Interaction') : t('Unlocked Card')}
      onClick={() => {
        dispatch({
          type: 'SetDrawerPropsAction',
          title: t('Next Card Properties'),
          mobileOpen: true,
          children: <NextCard />
        })
      }}
      testId={`Step-${id}`}
    />
  )
}
