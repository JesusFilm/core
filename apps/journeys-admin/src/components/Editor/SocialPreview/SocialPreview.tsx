import { ReactElement, useReducer } from 'react'
import { reducer } from '../JourneyEdit/JourneyEdit'

export function SocialPreview(): ReactElement {
  const [state, dispatch] = useReducer(reducer, { component: 'canvas' })
  return (
    <div>
      <h1>Social Preview</h1>
      <button onClick={() => dispatch({ type: 'canvas' })}>
        <span>test</span>
      </button>
    </div>
  )
}
