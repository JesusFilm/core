import { gql, useQuery } from '@apollo/client'
import Box from '@mui/material/Box'
import {
  MouseEvent,
  ReactElement,
  useCallback,
  useMemo,
  useRef,
  useState
} from 'react'
import {
  Background,
  Controls,
  NodeDragHandler,
  OnConnect,
  OnConnectEnd,
  OnConnectStart,
  OnConnectStartParams,
  ReactFlow,
  ReactFlowInstance,
  useEdgesState,
  useNodesState
} from 'reactflow'
import { v4 as uuidv4 } from 'uuid'

import { TreeBlock } from '@core/journeys/ui/block'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { searchBlocks } from '@core/journeys/ui/searchBlocks'

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
import { transformSteps } from './libs/transformSteps'
import { SocialPreviewNode } from './nodes/SocialPreviewNode'
import { STEP_NODE_WIDTH, StepBlockNode } from './nodes/StepBlockNode'

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
  const connectingParams = useRef<OnConnectStartParams | null>(null)
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])

  const [reactFlowInstance, setReactFlowInstance] =
    useState<ReactFlowInstance | null>(null)
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

  const createNewStepAndConnectBlock = useCallback(
    async function createNewStepAndConnectBlock(
      step: TreeBlock,
      block: TreeBlock,
      x: number,
      y: number
    ): Promise<void> {
      if (journey == null) return
      const newStepId = uuidv4()
      const newCardId = uuidv4()

      await stepAndCardBlockCreate({
        variables: {
          stepBlockCreateInput: {
            id: newStepId,
            journeyId: journey.id,
            x,
            y
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
      setNodes((oldNodes) =>
        oldNodes.concat({
          id: newStepId,
          type: 'StepBlock',
          data: {},
          position: { x, y }
        })
      )
      if (step.id === block.id) {
        // step
        await stepBlockNextBlockUpdate({
          variables: {
            id: step.id,
            journeyId: journey.id,
            input: {
              nextBlockId: newStepId
            }
          },
          optimisticResponse: {
            stepBlockUpdate: {
              id: step.id,
              __typename: 'StepBlock',
              nextBlockId: newStepId
            }
          }
        })
        setEdges((oldEdges) =>
          oldEdges.concat({
            id: `${step.id}->${newStepId}`,
            source: step.id,
            target: newStepId,
            style: {
              strokeDasharray: 4
            }
          })
        )
      } else {
        // action
        await navigateToBlockActionUpdate(block, newStepId)
      }
    },
    []
  )
  const onConnect = useCallback<OnConnect>(() => {
    // reset the start node on connections
    connectingParams.current = null
  }, [])
  const onConnectStart = useCallback<OnConnectStart>((_, params) => {
    connectingParams.current = params
  }, [])
  const onConnectEnd = useCallback<OnConnectEnd>(
    (event: MouseEvent) => {
      if (
        reactFlowInstance == null ||
        connectingParams.current == null ||
        connectingParams.current.nodeId == null ||
        connectingParams.current.handleId == null ||
        connectingParams.current.handleType === 'target'
      )
        return

      const step = steps?.find(
        (step) => step.id === connectingParams.current?.nodeId
      )
      const block = searchBlocks(
        step != null ? [step] : [],
        connectingParams.current.handleId
      )

      if (step == null || block == null) return

      const { x, y } = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY
      })

      void createNewStepAndConnectBlock(
        step,
        block,
        parseInt(x.toString()) - STEP_NODE_WIDTH / 2,
        parseInt(y.toString())
      )
    },
    [reactFlowInstance, connectingParams, createNewStepAndConnectBlock]
  )

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
        onConnect={onConnect}
        onConnectEnd={onConnectEnd}
        onConnectStart={onConnectStart}
        onNodeDragStop={onNodeDragStop}
        fitView
        nodeTypes={nodeTypes}
        proOptions={{ hideAttribution: true }}
        onInit={setReactFlowInstance}
      >
        <Controls showInteractive={false} />
        <Background color="#aaa" gap={16} />
      </ReactFlow>
    </Box>
  )
}
