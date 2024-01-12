import { useMutation } from '@apollo/client'
import { ComponentProps, ReactElement } from 'react'

import { useJourney } from '@core/journeys/ui/JourneyProvider'

import { BlockFields } from '../../../../__generated__/BlockFields'
import {
  NavigateToBlockActionUpdate,
  NavigateToBlockActionUpdateVariables
} from '../../../../__generated__/NavigateToBlockActionUpdate'
import { NAVIGATE_TO_BLOCK_ACTION_UPDATE } from '../../Editor/ControlPanel/Attributes/Action/NavigateToBlockAction/NavigateToBlockAction'

import { BaseNode } from './BaseNode'

export interface ActionNodeProps
  extends Omit<ComponentProps<typeof BaseNode>, 'isTargetConnectable'> {
  block: BlockFields
}

export function ActionNode({
  block,
  onSourceConnect,
  ...props
}: ActionNodeProps): ReactElement {
  const [navigateToBlockActionUpdate] = useMutation<
    NavigateToBlockActionUpdate,
    NavigateToBlockActionUpdateVariables
  >(NAVIGATE_TO_BLOCK_ACTION_UPDATE)

  const { journey } = useJourney()

  async function onConnect(params): Promise<void> {
    if (journey == null) return

    await navigateToBlockActionUpdate({
      variables: {
        id: block.id,
        journeyId: journey.id,
        input: {
          blockId: params.target
        }
      },
      update(cache, { data }) {
        if (data?.blockUpdateNavigateToBlockAction != null) {
          cache.modify({
            id: cache.identify({
              __typename: block.__typename,
              id: block.id
            }),
            fields: {
              action: () => data.blockUpdateNavigateToBlockAction
            }
          })
        }
      }
    })

    onSourceConnect?.(params)
  }

  return (
    <BaseNode
      isTargetConnectable={false}
      onSourceConnect={onConnect}
      {...props}
    />
  )
}
