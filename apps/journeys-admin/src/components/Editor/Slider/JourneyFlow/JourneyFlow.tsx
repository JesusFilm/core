import { gql, useQuery } from '@apollo/client'
import Box from '@mui/material/Box'
import { useTheme } from '@mui/material/styles'
import {
  MouseEvent,
  ReactElement,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react'
import {
  Background,
  ControlButton,
  Controls,
  Edge,
  NodeDragHandler,
  OnConnect,
  OnConnectEnd,
  OnConnectStart,
  OnConnectStartParams,
  OnEdgeUpdateFunc,
  ReactFlow,
  ReactFlowInstance,
  useEdgesState,
  useNodesState
} from 'reactflow'

import { useEditor } from '@core/journeys/ui/EditorProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { searchBlocks } from '@core/journeys/ui/searchBlocks'
import ArrowRefresh6Icon from '@core/shared/ui/icons/ArrowRefresh6'

import {
  GetStepBlocksWithPosition,
  GetStepBlocksWithPositionVariables
} from '../../../../../__generated__/GetStepBlocksWithPosition'
import { useBlockActionDeleteMutation } from '../../../../libs/useBlockActionDeleteMutation'
import { useBlockOrderUpdateMutation } from '../../../../libs/useBlockOrderUpdateMutation'
import { useNavigateToBlockActionUpdateMutation } from '../../../../libs/useNavigateToBlockActionUpdateMutation'
import { useStepBlockNextBlockUpdateMutation } from '../../../../libs/useStepBlockNextBlockUpdateMutation'
import { useStepBlockPositionUpdateMutation } from '../../../../libs/useStepBlockPositionUpdateMutation'

import { CustomEdge } from './edges/CustomEdge'
import { StartEdge } from './edges/StartEdge'
import { PositionMap, arrangeSteps } from './libs/arrangeSteps'
import { transformSteps } from './libs/transformSteps'
import { useCreateStepAndCard } from './libs/useCreateStepAndCard'
import { NewStepButton } from './NewStepButton'
import { SocialPreviewNode } from './nodes/SocialPreviewNode'
import { StepBlockNode } from './nodes/StepBlockNode'
import { STEP_NODE_CARD_HEIGHT } from './nodes/StepBlockNode/libs/sizes'

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
    state: { steps },
    dispatch
  } = useEditor()
  const connectingParams = useRef<OnConnectStartParams | null>(null)
  const edgeUpdateSuccessful = useRef<boolean | null>(null)
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const theme = useTheme()

  const [reactFlowInstance, setReactFlowInstance] =
    useState<ReactFlowInstance | null>(null)
  const [stepBlockNextBlockUpdate] = useStepBlockNextBlockUpdateMutation()
  const [stepBlockPositionUpdate] = useStepBlockPositionUpdateMutation()
  const createStepAndCard = useCreateStepAndCard()
  const [navigateToBlockActionUpdate] = useNavigateToBlockActionUpdateMutation()
  const [blockOrderUpdate] = useBlockOrderUpdateMutation()
  const [blockActionDelete] = useBlockActionDeleteMutation()
  async function blockPositionsUpdate(positions: PositionMap): Promise<void> {
    if (steps == null || journey == null) return
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
  }

  const { data, refetch } = useQuery<
    GetStepBlocksWithPosition,
    GetStepBlocksWithPositionVariables
  >(GET_STEP_BLOCKS_WITH_POSITION, {
    notifyOnNetworkStatusChange: true,
    variables: { journeyIds: journey?.id != null ? [journey.id] : undefined },
    onCompleted: (data) => {
      if (steps == null || journey == null) return
      const positions: PositionMap = {}
      if (
        data.blocks.some(
          (block) =>
            block.__typename === 'StepBlock' &&
            (block.x == null || block.y == null)
        )
      ) {
        // some steps have no x or y coordinates
        void blockPositionsUpdate(positions)
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
  }, [steps, data, theme, setEdges, setNodes, refetch])

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
        connectingParams.current.handleType === 'target' ||
        edgeUpdateSuccessful.current === false
      )
        return

      const targetIsPane = (event.target as Element)?.classList.contains(
        'react-flow__pane'
      )
      if (targetIsPane) {
        const { x, y } = reactFlowInstance.screenToFlowPosition({
          x: (event as unknown as MouseEvent).clientX,
          y: (event as unknown as MouseEvent).clientY
        })

        void createStepAndCard(
          connectingParams.current.nodeId,
          connectingParams.current.handleId,
          parseInt(x.toString()),
          parseInt(y.toString()) - STEP_NODE_CARD_HEIGHT / 2
        )
      }
    },
    [reactFlowInstance, connectingParams, createStepAndCard]
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
  const onEdgeUpdateStart = useCallback(() => {
    edgeUpdateSuccessful.current = false
  }, [])

  const onEdgeUpdate: OnEdgeUpdateFunc = useCallback(
    (_, { target, source, sourceHandle }) => {
      edgeUpdateSuccessful.current = true
      if (journey == null || target == null) return

      if (source === 'SocialPreview') {
        // social preview
        void blockOrderUpdate({
          variables: {
            id: target,
            journeyId: journey.id,
            parentOrder: 0
          },
          optimisticResponse: {
            blockOrderUpdate: [
              {
                id: target,
                __typename: 'StepBlock',
                parentOrder: 0
              }
            ]
          }
        })
      } else if (sourceHandle != null) {
        const step = steps?.find((step) => step.id === source)
        const block = searchBlocks(step != null ? [step] : [], sourceHandle)
        // action
        if (block != null) {
          void navigateToBlockActionUpdate(block, target)
        }
      } else {
        // step
        if (source != null) {
          void stepBlockNextBlockUpdate({
            variables: {
              id: source,
              journeyId: journey.id,
              input: {
                nextBlockId: target
              }
            },
            optimisticResponse: {
              stepBlockUpdate: {
                id: source,
                __typename: 'StepBlock',
                nextBlockId: target
              }
            }
          })
        }
      }
      dispatch({
        type: 'SetSelectedStepAction',
        selectedStep: steps?.find((step) => step.id === target)
      })
    },
    [
      journey,
      steps,
      dispatch,
      stepBlockNextBlockUpdate,
      navigateToBlockActionUpdate,
      blockOrderUpdate
    ]
  )

  const onEdgeUpdateEnd = useCallback(
    (_, edge: Edge) => {
      if (edgeUpdateSuccessful.current === false) {
        const { source, sourceHandle } = edge
        if (journey == null || source === 'SocialPreview') return
        if (sourceHandle != null) {
          // action
          const step = steps?.find((step) => step.id === source)
          const block = searchBlocks(step != null ? [step] : [], sourceHandle)
          if (block != null) {
            void blockActionDelete(block)
          }
        } else if (source != null) {
          // step
          void stepBlockNextBlockUpdate({
            variables: {
              id: source,
              journeyId: journey.id,
              input: {
                nextBlockId: null
              }
            },
            optimisticResponse: {
              stepBlockUpdate: {
                id: source,
                __typename: 'StepBlock',
                nextBlockId: null
              }
            }
          })
        }
      }
      edgeUpdateSuccessful.current = true
    },
    [journey, steps, blockActionDelete, stepBlockNextBlockUpdate]
  )

  const nodeTypes = useMemo(
    () => ({
      StepBlock: StepBlockNode,
      SocialPreview: SocialPreviewNode
    }),
    []
  )

  const edgeTypes = {
    Custom: CustomEdge,
    Start: StartEdge
  }

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        '.react-flow__edgeupdater.react-flow__edgeupdater-target': { r: 15 }
      }}
      data-testid="JourneyFlow"
    >
      <NewStepButton reactFlowInstance={reactFlowInstance} />
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onConnectEnd={onConnectEnd}
        onConnectStart={onConnectStart}
        onNodeDragStop={onNodeDragStop}
        onEdgeUpdate={onEdgeUpdate}
        onEdgeUpdateStart={onEdgeUpdateStart}
        onEdgeUpdateEnd={onEdgeUpdateEnd}
        fitView
        fitViewOptions={{ nodes: [nodes[0]], minZoom: 1, maxZoom: 0.7 }}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        proOptions={{ hideAttribution: true }}
        onInit={setReactFlowInstance}
        connectionLineStyle={{
          stroke: theme.palette.primary.main,
          strokeWidth: 2
        }}
      >
        <Controls showInteractive={false}>
          <ControlButton onClick={async () => await blockPositionsUpdate({})}>
            <ArrowRefresh6Icon />
          </ControlButton>
        </Controls>
        <Background color="#aaa" gap={16} />
      </ReactFlow>
    </Box>
  )
}
