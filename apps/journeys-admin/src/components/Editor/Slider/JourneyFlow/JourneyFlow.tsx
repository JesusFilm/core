import { gql, useQuery } from '@apollo/client'
import Box from '@mui/material/Box'
import Fade from '@mui/material/Fade'
import { useTheme } from '@mui/material/styles'
import { useRouter } from 'next/compat/router'
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
  SelectionDragHandler,
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

import type {
  GetStepBlocksWithPosition,
  GetStepBlocksWithPositionVariables,
  GetStepBlocksWithPosition_blocks_StepBlock
} from '../../../../../__generated__/GetStepBlocksWithPosition'
import { useJourneyUpdateMutation } from '../../../../libs/useJourneyUpdateMutation'
import { useStepBlockPositionUpdateMutation } from '../../../../libs/useStepBlockPositionUpdateMutation'

import { AnalyticsOverlaySwitch } from './AnalyticsOverlaySwitch'
import { Controls } from './Controls'
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
import {
  DEFAULT_SOCIAL_NODE_X,
  DEFAULT_SOCIAL_NODE_Y
} from './nodes/SocialPreviewNode/libs/positions'
import { StepBlockNode } from './nodes/StepBlockNode'
import { STEP_NODE_CARD_HEIGHT } from './nodes/StepBlockNode/libs/sizes'
import 'reactflow/dist/style.css'
import { useStepAndBlockSelection } from './utils/useStepAndBlockSelection'

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
  const renderCountRef = useRef(0)
  renderCountRef.current += 1
  console.log(`🔄 JourneyFlow COMPONENT RENDER #${renderCountRef.current}`, {
    timestamp: new Date().toISOString()
  })

  const router = useRouter()
  const { editorAnalytics } = useFlags()
  const theme = useTheme()
  const {
    state: { steps, activeSlide, showAnalytics, analytics },
    dispatch
  } = useEditor()
  const { journey } = useJourney()
  const [reactFlowInstance, setReactFlowInstance] =
    useState<ReactFlowInstance | null>(null)
  const connectingParams = useRef<OnConnectStartParams | null>(null)
  const edgeUpdateSuccessful = useRef<boolean | null>(null)
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [referrerNodes, setReferrerNodes] = useNodesState([])
  const [referrerEdges, setReferrerEdges] = useEdgesState([])

  // Wrap onNodesChange to log what's happening and filter out referrer node changes
  const wrappedOnNodesChange = useCallback(
    (changes: any) => {
      // Filter out changes that affect referrer nodes to prevent infinite loops
      const filteredChanges = changes.filter((change: any) => {
        const isReferrerNode = referrerNodes.some(
          (node) => node.id === change.id
        )
        if (isReferrerNode) {
          return false
        }
        return true
      })

      if (filteredChanges.length > 0) {
        onNodesChange(filteredChanges)
      }
    },
    [onNodesChange, referrerNodes]
  )

  const dragTimeStampRef = useRef(0)

  const createStepFromStep = useCreateStepFromStep()
  const createStepFromAction = useCreateStepFromAction()
  const createStepFromSocialPreview = useCreateStepFromSocialPreview()
  const updateEdge = useUpdateEdge()
  const deleteEdge = useDeleteEdge()
  const { onSelectionChange } = useDeleteOnKeyPress()
  const [stepBlockPositionUpdate] = useStepBlockPositionUpdateMutation()
  const { add } = useCommand()
  const handleStepSelection = useStepAndBlockSelection()
  const [journeyUpdate] = useJourneyUpdateMutation()

  const { data, loading } = useQuery<
    GetStepBlocksWithPosition,
    GetStepBlocksWithPositionVariables
  >(GET_STEP_BLOCKS_WITH_POSITION, {
    notifyOnNetworkStatusChange: true,
    variables: {
      journeyIds:
        router?.query.journeyId != null
          ? [router.query.journeyId.toString()]
          : undefined
    },
    skip: router?.query.journeyId == null
  })

  const blockPositionUpdate = useCallback(
    (input: Array<{ id: string; x: number; y: number }>): void => {
      // check if first element is social preview node
      const socialPreview = input[0]?.id === 'SocialPreview' ? input[0] : null
      // Filter the remaining blocks as step blocks
      const stepBlocks = socialPreview ? input.slice(1) : input

      if (socialPreview) {
        if (journey == null) return
        void journeyUpdate({
          variables: {
            id: journey.id,
            input: {
              socialNodeX: socialPreview.x,
              socialNodeY: socialPreview.y
            }
          },
          optimisticResponse: {
            journeyUpdate: {
              ...journey,
              socialNodeX: socialPreview.x,
              socialNodeY: socialPreview.y
            }
          }
        })
      }

      if (stepBlocks.length > 0) {
        void stepBlockPositionUpdate({
          variables: {
            input: stepBlocks
          },
          optimisticResponse: {
            stepBlockPositionUpdate: stepBlocks.map((step) => ({
              ...step,
              __typename: 'StepBlock'
            }))
          }
        })
      }
    },
    [stepBlockPositionUpdate, journeyUpdate, journey]
  )

  const allBlockPositionUpdate = useCallback(
    async (onload = false): Promise<void> => {
      if (steps == null || data == null) return

      if (journey?.socialNodeX == null || journey.socialNodeY == null) return
      const socialPreviewNodeInput = {
        id: 'SocialPreview',
        x: DEFAULT_SOCIAL_NODE_X,
        y: DEFAULT_SOCIAL_NODE_Y
      }
      const stepBlockInputs = Object.entries(arrangeSteps(steps)).map(
        ([id, position]) => ({
          id,
          ...position
        })
      )
      const input = [socialPreviewNodeInput, ...stepBlockInputs]

      if (onload) {
        blockPositionUpdate(input)
      } else {
        add({
          parameters: {
            execute: {
              input
            },
            undo: {
              input: [
                // social preview
                {
                  id: 'SocialPreview',
                  x: journey.socialNodeX,
                  y: journey.socialNodeY
                },
                // step blocks
                ...(
                  data.blocks as GetStepBlocksWithPosition_blocks_StepBlock[]
                ).map((step) => ({
                  id: step.id,
                  x: step.x,
                  y: step.y
                }))
              ]
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
    },
    [
      data,
      dispatch,
      steps,
      add,
      blockPositionUpdate,
      journey?.socialNodeX,
      journey?.socialNodeY
    ]
  )

  useEffect(() => {
    if (
      data?.blocks == null ||
      steps == null ||
      data.blocks.length !== steps.length
    )
      return

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

    if (!validSteps) {
      void allBlockPositionUpdate(true)
      return
    }

    let filteredSteps = steps

    if (journey?.menuStepBlock != null && journey.website !== true) {
      filteredSteps = steps.filter(
        (step) => step.id !== journey.menuStepBlock?.id
      )
    }

    const { nodes, edges } = transformSteps(
      filteredSteps ?? [],
      positions,
      journey
    )

    let filteredEdges = edges

    if (journey?.website === true) {
      filteredEdges = edges.filter(
        (e) => e.source === 'SocialPreview' || e.sourceHandle != null
      )
    }

    setEdges(filteredEdges)
    setNodes(nodes)
  }, [steps, data, theme, setEdges, setNodes, allBlockPositionUpdate, journey])

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

  const isClickOrTouch = (endDragTimeStamp: number): boolean => {
    return endDragTimeStamp - dragTimeStampRef.current < 150
  }

  const onNodeDragStop: NodeDragHandler = (event, node): void => {
    if (node.type !== 'StepBlock' && node.type !== 'SocialPreview') return

    // x and y position of node before onNodeDragStop was called
    let prevX
    let prevY

    if (node.type === 'StepBlock') {
      const step = data?.blocks.find(
        (step) => step.__typename === 'StepBlock' && step.id === node.id
      )
      if (step == null || step.__typename !== 'StepBlock') return

      prevX = step.x
      prevY = step.y

      // if click or tap, go through step selection logic
      // else go through standard positioning logic below
      if (isClickOrTouch(event.timeStamp)) {
        const target = event.target as HTMLElement
        // if the clicked/tapped element is the StepBlockNodeMenu, don't call handleStepSelection hook https://github.com/JesusFilm/core/pull/4736
        const menuButtonClicked =
          (target.parentNode as HTMLElement).id === 'StepBlockNodeMenuIcon' ||
          target.id === 'StepBlockNodeMenuIcon' ||
          target.id === 'edit-step'
        if (menuButtonClicked) return

        handleStepSelection(step.id)
        return
      }
    } else if (node.type === 'SocialPreview') {
      prevX = journey?.socialNodeX
      prevY = journey?.socialNodeY
      if (isClickOrTouch(event.timeStamp)) return
    }

    const x = Math.trunc(node.position.x)
    const y = Math.trunc(node.position.y)
    add({
      parameters: {
        execute: {
          x,
          y
        },
        undo: {
          x: prevX,
          y: prevY
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

  const onSelectionDragStop: SelectionDragHandler = (_event, nodes): void => {
    if (steps == null || data == null) return
    const stepNodes = nodes.filter((node) => node.type === 'StepBlock')

    add({
      parameters: {
        execute: {
          input: stepNodes.map((node) => ({
            id: node.id,
            x: Math.trunc(node.position.x),
            y: Math.trunc(node.position.y)
          }))
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
        blockPositionUpdate(input)
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
        // onNodesChange={onNodesChange}
        onNodesChange={wrappedOnNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onConnectEnd={onConnectEnd}
        onNodeDragStart={(event) => {
          dragTimeStampRef.current = event.timeStamp
        }}
        onConnectStart={onConnectStart}
        onNodeDragStop={onNodeDragStop}
        onSelectionDragStop={onSelectionDragStop}
        onEdgeUpdate={showAnalytics === true ? undefined : onEdgeUpdate}
        onEdgeUpdateStart={onEdgeUpdateStart}
        onEdgeUpdateEnd={onEdgeUpdateEnd}
        onSelectionChange={onSelectionChange}
        fitView
        fitViewOptions={{ nodes: [nodes[0]], minZoom: 1, maxZoom: 0.7 }}
        minZoom={0.1}
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
              {showAnalytics !== true && (
                <NewStepButton disabled={steps == null || loading} />
              )}
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
            <Controls handleReset={allBlockPositionUpdate} />
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
