import { ReactElement, useContext } from 'react'
import { EditorContext } from '@core/journeys/ui'
import { Button } from '../../Button'

interface AttributeProps {
  id: string
  icon: ReactElement
  name: string
  value: string
  description: string
  onClick?: () => void
}

export function Attribute(props: AttributeProps): ReactElement {
  const {
    state: { selectedAttributeId },
    dispatch
  } = useContext(EditorContext)

  const handleClick = (): void => {
    dispatch({ type: 'SetSelectedAttributeIdAction', id: props.id })
    props.onClick?.()
  }

  return (
    <Button
      {...props}
      selected={props.id === selectedAttributeId}
      onClick={handleClick}
    />
  )
}
