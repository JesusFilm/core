import { gql, useQuery } from '@apollo/client'
import Box from '@mui/material/Box'
import Fade from '@mui/material/Fade'
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
  NodeDragHandler,
  OnConnect,
  OnConnectEnd,
  OnConnectStart,
  OnConnectStartParams,
  OnEdgeUpdateFunc,
  Panel,
  ReactFlow,
  ReactFlowInstance,
  ReactFlowProps,
  updateEdge as reactFlowUpdateEdge,
  useEdgesState,
  useNodesState
} from 'reactflow'

import { ActiveSlide, useEditor } from '@core/journeys/ui/EditorProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { useFlags } from '@core/shared/ui/FlagsProvider'
import ArrowRefresh6Icon from '@core/shared/ui/icons/ArrowRefresh6'

import {
  GetStepBlocksWithPosition,
  GetStepBlocksWithPositionVariables
} from '../../../../../__generated__/GetStepBlocksWithPosition'
import { useStepBlockPositionUpdateMutation } from '../../../../libs/useStepBlockPositionUpdateMutation'

import { AnalyticsOverlaySwitch } from './AnalyticsOverlaySwitch'
import { JourneyAnalyticsCard } from './JourneyAnalyticsCard'
import { NewStepButton } from './NewStepButton'
import { CustomEdge } from './edges/CustomEdge'
import { StartEdge } from './edges/StartEdge'
import { PositionMap, arrangeSteps } from './libs/arrangeSteps'
import { transformSteps } from './libs/transformSteps'
import { useCreateStep } from './libs/useCreateStep'
import { useDeleteEdge } from './libs/useDeleteEdge'
import { useDeleteOnKeyPress } from './libs/useDeleteOnKeyPress'
import { useUpdateEdge } from './libs/useUpdateEdge'
import { LinkNode } from './nodes/LinkNode'
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
  const { journeyFlowAnalytics } = useFlags()
  const theme = useTheme()
  const {
    state: {
      steps,
      activeSlide,
      showJourneyFlowAnalytics,
      journeyStatsBreakdown
    }
  } = useEditor()
  const [reactFlowInstance, setReactFlowInstance] =
    useState<ReactFlowInstance | null>(null)
  const connectingParams = useRef<OnConnectStartParams | null>(null)
  const edgeUpdateSuccessful = useRef<boolean | null>(null)
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])

  const createStep = useCreateStep()
  const updateEdge = useUpdateEdge()
  const deleteEdge = useDeleteEdge()
  const { onSelectionChange } = useDeleteOnKeyPress()
  const [stepBlockPositionUpdate] = useStepBlockPositionUpdateMutation()

  async function blockPositionsUpdate(): Promise<void> {
    if (journey == null || steps == null) return
    const positions = arrangeSteps(steps)

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
        void blockPositionsUpdate()
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
    async (event) => {
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

        void createStep({
          x: Math.trunc(x),
          y: Math.trunc(y) - STEP_NODE_CARD_HEIGHT / 2,
          source: connectingParams.current.nodeId,
          sourceHandle: connectingParams.current.handleId
        })
      }
    },
    [reactFlowInstance, connectingParams, createStep]
  )
  const onNodeDragStop: NodeDragHandler = async (
    _event,
    node
  ): Promise<void> => {
    if (journey == null || node.type !== 'StepBlock') return

    const x = Math.trunc(node.position.x)
    const y = Math.trunc(node.position.y)
    await stepBlockPositionUpdate({
      variables: {
        id: node.id,
        journeyId: journey.id,
        x,
        y
      }
    })
  }
  const onEdgeUpdateStart = useCallback<
    NonNullable<ReactFlowProps['onEdgeUpdateStart']>
  >(() => {
    edgeUpdateSuccessful.current = false
  }, [])

  const onEdgeUpdate = useCallback<OnEdgeUpdateFunc>(
    (oldEdge, newConnection) => {
      const { source, sourceHandle, target } = newConnection
      setEdges((prev) => reactFlowUpdateEdge(oldEdge, newConnection, prev))
      edgeUpdateSuccessful.current = true
      void updateEdge({ source, sourceHandle, target, oldEdge })
    },
    [setEdges, updateEdge]
  )

  const onEdgeUpdateEnd = useCallback<
    NonNullable<ReactFlowProps['onEdgeUpdateEnd']>
  >(
    (_, edge) => {
      const { source, sourceHandle } = edge
      if (edgeUpdateSuccessful.current === false) {
        setEdges((eds) => eds.filter((e) => e.id !== edge.id))
        void deleteEdge({ source, sourceHandle })
      }
      edgeUpdateSuccessful.current = true
    },
    [deleteEdge, setEdges]
  )

  const nodeTypes = useMemo(
    () => ({
      StepBlock: StepBlockNode,
      SocialPreview: SocialPreviewNode,
      Link: LinkNode
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
        onEdgeUpdate={showJourneyFlowAnalytics ? undefined : onEdgeUpdate}
        onEdgeUpdateStart={onEdgeUpdateStart}
        onEdgeUpdateEnd={onEdgeUpdateEnd}
        onSelectionChange={onSelectionChange}
        fitView
        fitViewOptions={{ nodes: [nodes[0]], minZoom: 1, maxZoom: 0.7 }}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        proOptions={{ hideAttribution: true }}
        onInit={setReactFlowInstance}
        deleteKeyCode={[]}
        connectionLineStyle={{
          stroke: theme.palette.primary.main,
          strokeWidth: 2
        }}
        elevateEdgesOnSelect
      >
        {activeSlide === ActiveSlide.JourneyFlow && (
          <>
            <Panel position="top-right">
              {!showJourneyFlowAnalytics && <NewStepButton />}
            </Panel>
            {journeyFlowAnalytics && (
              <Panel position="top-left">
                <div>
                  <AnalyticsOverlaySwitch />
                  <Fade in={showJourneyFlowAnalytics}>
                    <div>
                      <JourneyAnalyticsCard {...journeyStatsBreakdown} />
                    </div>
                  </Fade>
                </div>
              </Panel>
            )}
            <Controls showInteractive={false}>
              <ControlButton onClick={blockPositionsUpdate}>
                <ArrowRefresh6Icon />
              </ControlButton>
            </Controls>
          </>
        )}
        <Background color="#aaa" gap={16} />
      </ReactFlow>
    </Box>
  )
}
