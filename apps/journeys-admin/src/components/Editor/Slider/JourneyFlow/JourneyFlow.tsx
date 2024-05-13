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
  Panel,
  ReactFlow,
  ReactFlowInstance,
  useEdgesState,
  useNodesState
} from 'reactflow'

import { useEditor } from '@core/journeys/ui/EditorProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import ArrowRefresh6Icon from '@core/shared/ui/icons/ArrowRefresh6'

import {
  GetStepBlocksWithPosition,
  GetStepBlocksWithPositionVariables
} from '../../../../../__generated__/GetStepBlocksWithPosition'
import { useStepBlockPositionUpdateMutation } from '../../../../libs/useStepBlockPositionUpdateMutation'

import { CustomEdge } from './edges/CustomEdge'
import { StartEdge } from './edges/StartEdge'
import { PositionMap, arrangeSteps } from './libs/arrangeSteps'
import { transformSteps } from './libs/transformSteps'
import { useCreateNodeAndEdge } from './libs/useCreateNodeAndEdge'
import { useDeleteEdge } from './libs/useDeleteEdge'
import { useUpdateEdge } from './libs/useUpdateEdge'
import { NewStepButton } from './NewStepButton'
import { SocialPreviewNode } from './nodes/SocialPreviewNode'
import { StepBlockNode } from './nodes/StepBlockNode'
import { STEP_NODE_CARD_HEIGHT } from './nodes/StepBlockNode/libs/sizes'

import 'reactflow/dist/style.css'

// some styles can only be updated through css after render
const additionalEdgeStyles = {
  '.react-flow__edgeupdater.react-flow__edgeupdater-target': { r: 15 }
}

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
  const theme = useTheme()
  const {
    state: { steps }
  } = useEditor()
  const [reactFlowInstance, setReactFlowInstance] =
    useState<ReactFlowInstance | null>(null)
  const connectingParams = useRef<OnConnectStartParams | null>(null)
  const edgeUpdateSuccessful = useRef<boolean | null>(null)
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])

  const createNodeAndEdge = useCreateNodeAndEdge()
  const updateEdge = useUpdateEdge()
  const deleteEdge = useDeleteEdge()
  const [stepBlockPositionUpdate] = useStepBlockPositionUpdateMutation()

  async function blockPositionsUpdate(positions: PositionMap): Promise<void> {
    if (journey == null || steps == null) return
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
      const { nodes, edges } = transformSteps(steps ?? [], positions)
      setEdges(edges)
      setNodes(nodes)
    }
  })

  useEffect(() => {
    if (data?.blocks == null) return
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

    const validSteps =
      steps?.every((step) => {
        return (
          positions[step.id] != null &&
          positions[step.id].x != null &&
          positions[step.id].y != null
        )
      }) ?? false

    if (!validSteps) return

    const { nodes, edges } = transformSteps(steps ?? [], positions)
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

        void createNodeAndEdge(
          parseInt(x.toString()),
          parseInt(y.toString()) - STEP_NODE_CARD_HEIGHT / 2,
          connectingParams.current.nodeId,
          connectingParams.current.handleId
        )
      }
    },
    [reactFlowInstance, connectingParams, createNodeAndEdge]
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
    (_, { source, sourceHandle, target }) => {
      edgeUpdateSuccessful.current = true
      void updateEdge(source, sourceHandle, target)
    },
    [updateEdge]
  )

  const onEdgeUpdateEnd = useCallback(
    (_, edge: Edge) => {
      if (edgeUpdateSuccessful.current === false) {
        void deleteEdge(edge?.source, edge?.sourceHandle)
      }
      edgeUpdateSuccessful.current = true
    },
    [deleteEdge]
  )

  const nodeTypes = useMemo(
    () => ({
      StepBlock: StepBlockNode,
      SocialPreview: SocialPreviewNode
    }),
    []
  )

  const edgeTypes = useMemo(
    () => ({
      Custom: CustomEdge,
      Start: StartEdge
    }),
    []
  )

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        ...additionalEdgeStyles
      }}
      data-testid="JourneyFlow"
    >
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
        <Panel position="top-right">
          <NewStepButton />
        </Panel>
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
