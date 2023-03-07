import {
  ActiveJourneyEditContent,
  useEditor
} from '@core/journeys/ui/EditorProvider'
import { ReactElement } from 'react'

export function SocialPreview(): ReactElement {
  const { dispatch } = useEditor()
  return (
    <div>
      <h1>Social Preview</h1>
      <button
        onClick={() =>
          dispatch({
            type: 'SetJourneyEditContentAction',
            component: ActiveJourneyEditContent.Canvas
          })
        }
      >
        <span>test</span>
      </button>
    </div>
  )
}
