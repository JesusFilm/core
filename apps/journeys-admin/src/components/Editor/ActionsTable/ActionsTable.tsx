import { ReactElement } from 'react'
import { useEditor } from '@core/journeys/ui/EditorProvider'

export function ActionsTable(): ReactElement {
  const { state: { steps } } = useEditor()
  console.log(steps?.map((value) => value.children.map((block) => block)))

  return (
    <div>ActionsTable</div>
  )
}
