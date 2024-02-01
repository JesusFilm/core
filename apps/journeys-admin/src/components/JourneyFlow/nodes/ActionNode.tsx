import { useMutation } from '@apollo/client'
import { ComponentProps, ReactElement } from 'react'

import { useEditor } from '@core/journeys/ui/EditorProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'

import { BlockFields } from '../../../../__generated__/BlockFields'

import { BaseNode } from './BaseNode'
import { useNavigateToBlockActionUpdateMutation } from '../../../libs/useNavigateToBlockActionUpdateMutation'

export interface ActionNodeProps
  extends Omit<ComponentProps<typeof BaseNode>, 'isTargetConnectable'> {
  block: BlockFields
}

export function ActionNode({
  block,
  onSourceConnect,
  ...props
}: ActionNodeProps): ReactElement {
  const [navigateToBlockActionUpdate] = useNavigateToBlockActionUpdateMutation()
  const { journey } = useJourney()

  const {
    state: { selectedBlock }
  } = useEditor()

  async function onConnect(params): Promise<void> {
    if (journey == null) return

    await navigateToBlockActionUpdate(block, params.target)

    onSourceConnect?.(params)
  }

  function handleClick(): void {
    console.log(block.id)
  }

  return (
    <BaseNode
      selected={selectedBlock?.id === block.id}
      isTargetConnectable={false}
      onSourceConnect={onConnect}
      onClick={handleClick}
      variant="action"
      {...props}
    />
  )
}
