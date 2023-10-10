import { ReactElement } from 'react'

import { useEditor } from '@core/journeys/ui/EditorProvider'

import { Button } from '../../Button'

interface AttributeProps {
  id: string
  icon: ReactElement
  name: string
  value: string
  description: string
  onClick?: () => void
  testId?: string
}

export function Attribute(props: AttributeProps): ReactElement {
  const {
    state: { selectedAttributeId },
    dispatch
  } = useEditor()

  const handleClick = (): void => {
    dispatch({ type: 'SetSelectedAttributeIdAction', id: props.id })
    props.onClick?.()
  }

  return (
    <Button
      {...props}
      selected={props.id === selectedAttributeId}
      onClick={handleClick}
      testId={props.testId ?? 'Attribute'}
    />
  )
}
