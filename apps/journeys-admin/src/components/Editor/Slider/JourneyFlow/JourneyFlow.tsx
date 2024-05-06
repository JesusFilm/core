import { gql, useQuery } from '@apollo/client'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
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
  ReactFlow,
  ReactFlowInstance,
  useEdgesState,
  useNodesState
} from 'reactflow'
import { __await } from 'tslib'
import { v4 as uuidv4 } from 'uuid'

import { TreeBlock } from '@core/journeys/ui/block'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { searchBlocks } from '@core/journeys/ui/searchBlocks'
import ArrowRefresh6Icon from '@core/shared/ui/icons/ArrowRefresh6'
import Plus3Icon from '@core/shared/ui/icons/Plus3'

import {
  GetStepBlocksWithPosition,
  GetStepBlocksWithPositionVariables
} from '../../../../../__generated__/GetStepBlocksWithPosition'
import { ThemeMode, ThemeName } from '../../../../../__generated__/globalTypes'
import { useNavigateToBlockActionUpdateMutation } from '../../../../libs/useNavigateToBlockActionUpdateMutation'
import { useStepAndCardBlockCreateMutation } from '../../../../libs/useStepAndCardBlockCreateMutation'
import { useStepBlockNextBlockUpdateMutation } from '../../../../libs/useStepBlockNextBlockUpdateMutation'
import { useStepBlockPositionUpdateMutation } from '../../../../libs/useStepBlockPositionUpdateMutation'

import { CustomEdge } from './edges/CustomEdge'
import { StartEdge } from './edges/StartEdge'
import { PositionMap, arrangeSteps } from './libs/arrangeSteps'
import { transformSteps } from './libs/transformSteps'
import { SocialPreviewNode } from './nodes/SocialPreviewNode'
import { StepBlockNode } from './nodes/StepBlockNode'
import {
  STEP_NODE_HEIGHT,
  STEP_NODE_WIDTH
} from './nodes/StepBlockNode/libs/sizes'

import 'reactflow/dist/style.css'
import { Item } from '../../Toolbar/Items/Item'

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
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const theme = useTheme()

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
  }, [steps, data, setEdges, setNodes, refetch])

  const createStepAndCardBlock = useCallback(
    async function createStepAndCardBlock(
      x: number,
      y: number,
      step?: TreeBlock,
      block?: TreeBlock
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
      if (step?.id === block?.id) {
        // step
        if (step == null) return
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
      } else {
        // action
        if (block == null) return
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
  async function handleAddStepAndCardBlock(event): Promise<void> {
    if (reactFlowInstance == null) return
    const { x, y } = reactFlowInstance.screenToFlowPosition({
      x: (event as unknown as MouseEvent).clientX,
      y: (event as unknown as MouseEvent).clientY
    })

    await createStepAndCardBlock(
      parseInt(x.toString()) - STEP_NODE_WIDTH,
      parseInt(y.toString()) + STEP_NODE_HEIGHT / 2
    )

    // dispatch
  }
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

      // let clientX = 0
      // let clientY = 0
      // if (event.type === 'touchend') {
      //   const touchEvent = event as unknown as TouchEvent
      //   touchEvent.preventDefault()
      //   clientX = touchEvent.changedTouches[0].clientX
      //   clientY = touchEvent.changedTouches[0].clientY
      // } else if (event.type === 'mouseup') {
      //   const mouseEvent = event as unknown as MouseEvent
      //   clientX = mouseEvent.clientX
      //   clientY = mouseEvent.clientY
      // }

      const targetIsPane = (event.target as Element)?.classList.contains(
        'react-flow__pane'
      )
      if (targetIsPane) {
        const { x, y } = reactFlowInstance.screenToFlowPosition({
          x: (event as unknown as MouseEvent).clientX,
          y: (event as unknown as MouseEvent).clientY
        })

        void createStepAndCardBlock(
          parseInt(x.toString()),
          parseInt(y.toString()) - STEP_NODE_HEIGHT / 2,
          step,
          block
        )
      }
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

  const edgeTypes = {
    Custom: CustomEdge,
    Start: StartEdge
  }

  return (
    <Box sx={{ width: '100%', height: '100%' }} data-testid="JourneyFlow">
      <Box
        sx={{
          position: 'absolute',
          right: 30,
          top: 30,
          zIndex: 3
        }}
      >
        <Item
          variant="button"
          label="Add Step"
          icon={<Plus3Icon />}
          onClick={handleAddStepAndCardBlock}
        />
      </Box>
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
