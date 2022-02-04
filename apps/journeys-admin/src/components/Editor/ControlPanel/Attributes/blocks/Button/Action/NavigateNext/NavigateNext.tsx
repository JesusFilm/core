import { ReactElement } from 'react'
import { useEditor } from '@core/journeys/ui'
import { CardPreview } from '../../../../../../../CardPreview'

export function NavigateNext(): ReactElement {
  const { state } = useEditor()
  return (
    <>
      {/* Grey out cards, show next step selected */}
      <CardPreview selected={state.selectedStep} steps={state.steps} />
    </>
  )
}
