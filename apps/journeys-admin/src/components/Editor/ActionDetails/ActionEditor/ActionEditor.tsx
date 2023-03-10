import { ReactElement } from 'react'
import { LinkAction } from '../../ControlPanel/Attributes/Action/LinkAction'

interface ActionEditorProps {
  url: string
}

export function ActionEditor({ url }: ActionEditorProps): ReactElement {
  return <LinkAction />
}
