import { gql, useQuery } from '@apollo/client'
import Box from '@mui/material/Box'
import {
  MouseEvent,
  ReactElement,
  TouchEvent,
  useCallback,
  useEffect,
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
  const [stepAndCardBlockCreate] = useStepAndCardBlockCreateMutation({
    update(cache, { data }) {
      if (data?.stepBlockCreate != null && data?.cardBlockCreate != null) {
        cache.modify({
          fields: {
            blocks(existingBlockRefs = []) {
              const newStepBlockRef = cache.writeFragment({
                data: data.stepBlockCreate,
                fragment: gql`
                  fragment NewBlock on Block {
                    id
                  }
                `
              })
              return [...existingBlockRefs, newStepBlockRef]
            }
          }
        })
      }
    }
  })
  const [stepBlockNextBlockUpdate] = useStepBlockNextBlockUpdateMutation()
  const [stepBlockPositionUpdate] = useStepBlockPositionUpdateMutation()
  const [navigateToBlockActionUpdate] = useNavigateToBlockActionUpdateMutation()
  const { data, refetch } = useQuery<
    GetStepBlocksWithPosition,
    GetStepBlocksWithPositionVariables
  >(GET_STEP_BLOCKS_WITH_POSITION, {
    notifyOnNetworkStatusChange: true,
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
  })

  useEffect(() => {
    if (steps == null || data?.blocks == null) return
    const positions: PositionMap =
      data.blocks.reduce((acc, block) => {
        if (
          block.__typename === 'StepBlock' &&
          block.x != null &&
          block.y != null
        ) {
          acc[block.id] = { x: block.x, y: block.y }
        }
        return acc
      }, {}) ?? {}

    const validSteps = steps.every((step) => {
      return (
        positions[step.id] != null &&
        positions[step.id].x != null &&
        positions[step.id].y != null
      )
    })

    if (!validSteps) return

    const { nodes, edges } = transformSteps(steps, positions)
    setEdges(edges)
    setNodes(nodes)
  }, [steps, data, setEdges, setNodes, refetch])

  const createStepAndCardBlock = useCallback(
    async function createStepAndCardBlock(
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
      if (step.id === block.id) {
        // step
        await stepBlockNextBlockUpdate({
          variables: {
            id: step.id,
            journeyId: journey.id,
            input: {
              nextBlockId: newStepId
            }
          }
        })
      } else {
        // action
        await navigateToBlockActionUpdate(block, newStepId)
      }
    },
    [
      journey,
      navigateToBlockActionUpdate,
      stepAndCardBlockCreate,
      stepBlockNextBlockUpdate
    ]
  )
  const onConnect = useCallback<OnConnect>(() => {
    // reset the start node on connections
    connectingParams.current = null
  }, [])
  const onConnectStart = useCallback<OnConnectStart>((_, params) => {
    connectingParams.current = params
  }, [])
  const onConnectEnd = useCallback<OnConnectEnd>(
    (event) => {
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

      let clientX = 0
      let clientY = 0
      if (event.type === 'touchend') {
        const touchEvent = event as unknown as TouchEvent
        touchEvent.preventDefault()
        clientX = touchEvent.changedTouches[0].clientX
        clientY = touchEvent.changedTouches[0].clientY
      } else if (event.type === 'mouseup') {
        const mouseEvent = event as unknown as MouseEvent
        clientX = mouseEvent.clientX
        clientY = mouseEvent.clientY
      }

      const { x, y } = reactFlowInstance.screenToFlowPosition({
        x: clientX,
        y: clientY
      })

      void createStepAndCardBlock(
        step,
        block,
        parseInt(x.toString()) - STEP_NODE_WIDTH / 2,
        parseInt(y.toString())
      )
    },
    [reactFlowInstance, connectingParams, createStepAndCardBlock, steps]
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
      }
    })
  }

  const nodeTypes = useMemo(
    () => ({
      StepBlock: StepBlockNode,
      SocialPreview: SocialPreviewNode
    }),
    []
  )

  return (
    <Box sx={{ width: '100%', height: '100%' }} data-testid="JourneyFlow">
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
