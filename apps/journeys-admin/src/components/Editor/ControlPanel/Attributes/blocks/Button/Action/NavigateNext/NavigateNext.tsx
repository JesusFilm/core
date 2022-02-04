import { ReactElement } from 'react'
import { useEditor } from '@core/journeys/ui'
import { CardPreview } from '../../../../../../../CardPreview'

export function NavigateNext(): ReactElement {
  const { state } = useEditor()

  const selectedIndex = state.steps.findIndex(
    (step) => step === state.selectedStep
  )
  const nextIndex =
    state.steps.length > selectedIndex + 1 ? selectedIndex + 1 : 0

  // update mutation to set action to navigate to next step

  return (
    <>
      {/* Grey out cards, swiper focus on selected */}
      <CardPreview selected={state.steps[nextIndex]} steps={state.steps} />
    </>
  )
}
