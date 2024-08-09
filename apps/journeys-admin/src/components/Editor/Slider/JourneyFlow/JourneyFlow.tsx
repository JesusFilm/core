import { gql, useQuery } from '@apollo/client'
import Box from '@mui/material/Box'
import Fade from '@mui/material/Fade'
import { useTheme } from '@mui/material/styles'
import {
  type MouseEvent,
  type ReactElement,
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
  type Edge,
  type Node,
  type NodeDragHandler,
  type OnConnect,
  type OnConnectEnd,
  type OnConnectStart,
  type OnConnectStartParams,
  type OnEdgeUpdateFunc,
  Panel,
  ReactFlow,
  type ReactFlowInstance,
  type ReactFlowProps,
  updateEdge as reactFlowUpdateEdge,
  useEdgesState,
  useNodesState
} from 'reactflow'

import { useCommand } from '@core/journeys/ui/CommandProvider'
import { ActiveSlide, useEditor } from '@core/journeys/ui/EditorProvider'
import { isActionBlock } from '@core/journeys/ui/isActionBlock'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { searchBlocks } from '@core/journeys/ui/searchBlocks'
import { useFlags } from '@core/shared/ui/FlagsProvider'
import ArrowRefresh6Icon from '@core/shared/ui/icons/ArrowRefresh6'

import type {
  GetStepBlocksWithPosition,
  GetStepBlocksWithPositionVariables,
  GetStepBlocksWithPosition_blocks_StepBlock
} from '../../../../../__generated__/GetStepBlocksWithPosition'
import { useStepBlockPositionUpdateMutation } from '../../../../libs/useStepBlockPositionUpdateMutation'

import { AnalyticsOverlaySwitch } from './AnalyticsOverlaySwitch'
import { CustomEdge } from './edges/CustomEdge'
import { ReferrerEdge } from './edges/ReferrerEdge'
import { StartEdge } from './edges/StartEdge'
import { JourneyAnalyticsCard } from './JourneyAnalyticsCard'
import { type PositionMap, arrangeSteps } from './libs/arrangeSteps'
import { convertToEdgeSource } from './libs/convertToEdgeSource'
import { transformSteps } from './libs/transformSteps'
import { useCreateStepFromAction } from './libs/useCreateStepFromAction'
import { useCreateStepFromSocialPreview } from './libs/useCreateStepFromSocialPreview'
import { useCreateStepFromStep } from './libs/useCreateStepFromStep'
import { useDeleteEdge } from './libs/useDeleteEdge'
import { useDeleteOnKeyPress } from './libs/useDeleteOnKeyPress'
import { useUpdateEdge } from './libs/useUpdateEdge'
import { NewStepButton } from './NewStepButton'
import { LinkNode } from './nodes/LinkNode'
import { ReferrerNode } from './nodes/ReferrerNode'
import { SocialPreviewNode } from './nodes/SocialPreviewNode'
import { StepBlockNode } from './nodes/StepBlockNode'
import { STEP_NODE_CARD_HEIGHT } from './nodes/StepBlockNode/libs/sizes'

import 'reactflow/dist/style.css'

// some styles can only be updated through css after render
const additionalEdgeStyles = {
  '.react-flow__edgeupdater.react-flow__edgeupdater-target': { r: 15 }
}

const analyticEdgeStyles = {
  '.react-flow__edge, .react-flow__edge-interaction': {
    'pointer-events': 'none'
  }
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
  const { editorAnalytics } = useFlags()
  const theme = useTheme()
  const {
    state: { steps, activeSlide, showAnalytics, analytics },
    dispatch
  } = useEditor()
  const [reactFlowInstance, setReactFlowInstance] =
    useState<ReactFlowInstance | null>(null)
  const connectingParams = useRef<OnConnectStartParams | null>(null)
  const edgeUpdateSuccessful = useRef<boolean | null>(null)
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [referrerNodes, setReferrerNodes] = useNodesState([])
  const [referrerEdges, setReferrerEdges] = useEdgesState([])

  const createStepFromStep = useCreateStepFromStep()
  const createStepFromAction = useCreateStepFromAction()
  const createStepFromSocialPreview = useCreateStepFromSocialPreview()
  const updateEdge = useUpdateEdge()
  const deleteEdge = useDeleteEdge()
  const { onSelectionChange } = useDeleteOnKeyPress()
  const [stepBlockPositionUpdate] = useStepBlockPositionUpdateMutation()
  const { add } = useCommand()

  const { data, refetch } = useQuery<
    GetStepBlocksWithPosition,
    GetStepBlocksWithPositionVariables
  >(GET_STEP_BLOCKS_WITH_POSITION, {
    notifyOnNetworkStatusChange: true,
    variables: { journeyIds: journey?.id != null ? [journey.id] : undefined },
    skip: journey?.id == null,
    onCompleted: (data) => {
      if (
        data.blocks.some(
          (block) =>
            block.__typename === 'StepBlock' &&
            (block.x == null || block.y == null)
        )
      )
        void allBlockPositionUpdate(true)
    }
  })

  function blockPositionUpdate(
    input: Array<{ id: string; x: number; y: number }>
  ): void {
    void stepBlockPositionUpdate({
      variables: {
        input
      },
      optimisticResponse: {
        stepBlockPositionUpdate: input.map((step) => ({
          ...step,
          __typename: 'StepBlock'
        }))
      }
    })
  }

  async function allBlockPositionUpdate(onload = false): Promise<void> {
    if (steps == null || data == null) return

    const input = Object.entries(arrangeSteps(steps)).map(([id, position]) => ({
      id,
      ...position
    }))

    if (onload) {
      blockPositionUpdate(input)
    } else {
      add({
        parameters: {
          execute: {
            input
          },
          undo: {
            input: (
              data.blocks as GetStepBlocksWithPosition_blocks_StepBlock[]
            ).map((step) => ({
              id: step.id,
              x: step.x,
              y: step.y
            }))
          }
        },
        execute({ input }) {
          dispatch({
            type: 'SetEditorFocusAction',
            activeSlide: ActiveSlide.JourneyFlow
          })
          blockPositionUpdate(input)
        }
      })
    }
  }

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

      let eventTarget = event.target
      let xPos = (event as unknown as MouseEvent).clientX
      let yPos = (event as unknown as MouseEvent).clientY

      if (!(event instanceof MouseEvent)) {
        const touchEvent = event.changedTouches[0]

        eventTarget = document.elementFromPoint(
          touchEvent.clientX,
          touchEvent.clientY
        )
        xPos = touchEvent.clientX
        yPos = touchEvent.clientY
      }

      const targetIsPane = (eventTarget as Element)?.classList.contains(
        'react-flow__pane'
      )

      if (targetIsPane) {
        const { x, y } = reactFlowInstance.screenToFlowPosition({
          x: xPos,
          y: yPos
        })

        const edgeSource = convertToEdgeSource({
          source: connectingParams.current.nodeId,
          sourceHandle: connectingParams.current.handleId
        })

        const sourceStep =
          edgeSource.sourceType === 'step' || edgeSource.sourceType === 'action'
            ? steps?.find((step) => step.id === edgeSource.stepId)
            : null

        const sourceBlock =
          edgeSource.sourceType === 'action'
            ? searchBlocks(
                sourceStep != null ? [sourceStep] : [],
                edgeSource.blockId
              )
            : null

        const input = {
          x: Math.trunc(x),
          y: Math.trunc(y) - STEP_NODE_CARD_HEIGHT / 2,
          sourceStep
        }

        switch (edgeSource.sourceType) {
          case 'step':
            createStepFromStep(input)
            break
          case 'socialPreview':
            createStepFromSocialPreview(input)
            break
          case 'action': {
            if (!isActionBlock(sourceBlock)) break
            createStepFromAction({ ...input, sourceBlock })
            break
          }
        }
      }
    },
    [
      reactFlowInstance,
      steps,
      createStepFromStep,
      createStepFromSocialPreview,
      createStepFromAction
    ]
  )
  const onNodeDragStop: NodeDragHandler = (_event, node): void => {
    if (node.type !== 'StepBlock') return

    const step = data?.blocks.find(
      (step) => step.__typename === 'StepBlock' && step.id === node.id
    )
    if (step == null || step.__typename !== 'StepBlock') return

    const x = Math.trunc(node.position.x)
    const y = Math.trunc(node.position.y)
    add({
      parameters: {
        execute: {
          x,
          y
        },
        undo: {
          x: step.x,
          y: step.y
        },
        redo: {
          x,
          y
        }
      },
      execute({ x, y }) {
        dispatch({
          type: 'SetEditorFocusAction',
          activeSlide: ActiveSlide.JourneyFlow
        })
        blockPositionUpdate([{ id: node.id, x, y }])
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
      Link: LinkNode,
      Referrer: ReferrerNode
    }),
    []
  )

  const edgeTypes = useMemo(
    () => ({
      Custom: CustomEdge,
      Start: StartEdge,
      Referrer: ReferrerEdge
    }),
    []
  )

  const hideReferrers =
    <T extends Node | Edge>(hidden: boolean) =>
    (nodeOrEdge: T) => {
      nodeOrEdge.hidden = hidden

      return nodeOrEdge
    }

  useEffect(() => {
    if (analytics?.referrers != null) {
      const { nodes, edges } = analytics.referrers

      setReferrerEdges(edges)
      setReferrerNodes(nodes)
    }
  }, [analytics?.referrers, setReferrerEdges, setReferrerNodes])

  useEffect(() => {
    setReferrerNodes((nds) => nds.map(hideReferrers(showAnalytics === false)))
    setReferrerEdges((eds) => eds.map(hideReferrers(showAnalytics === false)))
  }, [setReferrerEdges, setReferrerNodes, showAnalytics])

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        ...additionalEdgeStyles,
        ...(showAnalytics === true && analyticEdgeStyles)
      }}
      data-testid="JourneyFlow"
    >
      <ReactFlow
        nodes={[...referrerNodes, ...nodes]}
        edges={[...referrerEdges, ...edges]}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onConnectEnd={onConnectEnd}
        onConnectStart={onConnectStart}
        onNodeDragStop={onNodeDragStop}
        onEdgeUpdate={showAnalytics === true ? undefined : onEdgeUpdate}
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
              {showAnalytics !== true && <NewStepButton />}
            </Panel>
            {editorAnalytics && (
              <Panel position="top-left">
                <>
                  <AnalyticsOverlaySwitch />
                  <Fade in={showAnalytics} unmountOnExit>
                    <Box>
                      <JourneyAnalyticsCard />
                    </Box>
                  </Fade>
                </>
              </Panel>
            )}
            <Controls showInteractive={false}>
              <ControlButton
                onClick={async () => await allBlockPositionUpdate()}
              >
                <ArrowRefresh6Icon />
              </ControlButton>
            </Controls>
          </>
        )}
        <Background
          color="#aaa"
          gap={16}
          style={
            showAnalytics === true
              ? {
                  backgroundColor: '#DEE8EF'
                }
              : {
                  backgroundColor: '#EFEFEF'
                }
          }
        />
      </ReactFlow>
    </Box>
  )
}
