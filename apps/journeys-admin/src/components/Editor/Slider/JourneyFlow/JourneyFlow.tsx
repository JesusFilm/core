import { gql, useQuery } from '@apollo/client'
import Box from '@mui/material/Box'
import { ReactElement, useMemo, useState } from 'react'
import {
  Background,
  Controls,
  NodeDragHandler,
  OnConnectEnd,
  OnConnectStart,
  ReactFlow,
  useEdgesState,
  useNodesState
} from 'reactflow'
import { v4 as uuidv4 } from 'uuid'

import { TreeBlock } from '@core/journeys/ui/block'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'

import {
  GetStepBlocksWithPosition,
  GetStepBlocksWithPositionVariables
} from '../../../../../__generated__/GetStepBlocksWithPosition'
import { ThemeMode, ThemeName } from '../../../../../__generated__/globalTypes'
import { useNavigateToBlockActionUpdateMutation } from '../../../../libs/useNavigateToBlockActionUpdateMutation'
import { useStepAndCardBlockCreateMutation } from '../../../../libs/useStepAndCardBlockCreateMutation'
import { useStepBlockNextBlockUpdateMutation } from '../../../../libs/useStepBlockNextBlockUpdateMutation'
import { useStepBlockPositionUpdateMutation } from '../../../../libs/useStepBlockPositionUpdateMutation'

import { PositionMap, arrangeSteps } from './libs/arrangeSteps'
import { isActionBlock } from './libs/isActionBlock'
import { transformSteps } from './libs/transformSteps'
import { SocialPreviewNode } from './nodes/SocialPreviewNode'
import { StepBlockNode } from './nodes/StepBlockNode'

import 'reactflow/dist/style.css'

export const GET_STEP_BLOCKS_WITH_POSITION = gql`
  query GetStepBlocksWithPosition($journeyIds: [ID!]) {
    blocks(where: { journeyIds: $journeyIds, typenames: ["StepBlock"] }) {
      ... on StepBlock {
        id
        x
        y
      }
    }
  }
`

export function JourneyFlow(): ReactElement {
  const { journey } = useJourney()
  const {
    state: { steps }
  } = useEditor()
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [previousNodeId, setPreviousNodeId] = useState<string | null>(null)
  const [stepAndCardBlockCreate] = useStepAndCardBlockCreateMutation()
  const [stepBlockNextBlockUpdate] = useStepBlockNextBlockUpdateMutation()
  const [stepBlockPositionUpdate] = useStepBlockPositionUpdateMutation()
  const [navigateToBlockActionUpdate] = useNavigateToBlockActionUpdateMutation()
  useQuery<GetStepBlocksWithPosition, GetStepBlocksWithPositionVariables>(
    GET_STEP_BLOCKS_WITH_POSITION,
    {
      variables: { journeyIds: journey?.id != null ? [journey.id] : undefined },
      onCompleted: (data) => {
        if (steps == null || journey == null) return
        let positions: PositionMap = {}
        if (
          data.blocks.some(
            (block) =>
              block.__typename === 'StepBlock' &&
              (block.x == null || block.y == null)
          )
        ) {
          // some steps have no x or y coordinates
          positions = arrangeSteps(steps)
          Object.entries(positions).forEach(([id, position]) => {
            void stepBlockPositionUpdate({
              variables: {
                id,
                journeyId: journey.id,
                x: position.x,
                y: position.y
              },
              optimisticResponse: {
                stepBlockUpdate: {
                  id,
                  __typename: 'StepBlock',
                  x: position.x,
                  y: position.y
                }
              }
            })
          })
        } else {
          data.blocks.forEach((block) => {
            if (
              block.__typename === 'StepBlock' &&
              block.x != null &&
              block.y != null
            ) {
              positions[block.id] = { x: block.x, y: block.y }
            }
          })
        }
        const { nodes, edges } = transformSteps(steps, positions)
        setEdges(edges)
        setNodes(nodes)
      }
    }
  )

  const onConnectStart: OnConnectStart = (_, { nodeId }) => {
    setPreviousNodeId(nodeId)
  }

  const onConnectEnd: OnConnectEnd = (event) => {
    if (
      (event.target as HTMLElement | undefined)?.className ===
        'react-flow__pane' &&
      previousNodeId != null
    ) {
      const nodeData = nodes.find((node) => node.id === previousNodeId)?.data
      void createNewStepAndConnectBlock(nodeData)
    }
  }

  async function createNewStepAndConnectBlock(
    block?: TreeBlock
  ): Promise<void> {
    if (journey == null || block == null) return
    const newStepId = uuidv4()
    const newCardId = uuidv4()

    await stepAndCardBlockCreate({
      variables: {
        stepBlockCreateInput: {
          id: newStepId,
          journeyId: journey.id
        },
        cardBlockCreateInput: {
          id: newCardId,
          journeyId: journey.id,
          parentBlockId: newStepId,
          themeMode: ThemeMode.dark,
          themeName: ThemeName.base
        }
      }
    })
    if (block.__typename === 'StepBlock') {
      await stepBlockNextBlockUpdate({
        variables: {
          id: block.id,
          journeyId: journey.id,
          input: {
            nextBlockId: newStepId
          }
        },
        optimisticResponse: {
          stepBlockUpdate: {
            id: block.id,
            __typename: 'StepBlock',
            nextBlockId: newStepId
          }
        }
      })
    } else if (isActionBlock(block)) {
      await navigateToBlockActionUpdate(block, newStepId)
    }
  }
  const nodeTypes = useMemo(
    () => ({
      StepBlock: StepBlockNode,
      SocialPreview: SocialPreviewNode
    }),
    []
  )

  const onNodeDragStop: NodeDragHandler = async (
    _event,
    node
  ): Promise<void> => {
    if (journey == null || node.type !== 'StepBlock') return

    const x = parseInt(node.position.x.toString())
    const y = parseInt(node.position.y.toString())
    await stepBlockPositionUpdate({
      variables: {
        id: node.id,
        journeyId: journey.id,
        x,
        y
      },
      optimisticResponse: {
        stepBlockUpdate: {
          id: node.id,
          __typename: 'StepBlock',
          x,
          y
        }
      }
    })
  }

  return (
    <Box sx={{ width: '100%', height: '100%' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnectEnd={onConnectEnd}
        onConnectStart={onConnectStart}
        onNodeDragStop={onNodeDragStop}
        fitView
        nodeTypes={nodeTypes}
        proOptions={{ hideAttribution: true }}
      >
        <Controls showInteractive={false} />
        <Background color="#aaa" gap={16} />
      </ReactFlow>
    </Box>
  )
}
