import { gql, useMutation } from '@apollo/client'
import Box from '@mui/material/Box'
import findIndex from 'lodash/findIndex'
import flatMapDeep from 'lodash/flatMapDeep'
import { ReactElement, useEffect, useState } from 'react'
import {
  Background,
  Controls,
  Edge,
  MarkerType,
  Node,
  OnConnect,
  Position,
  ReactFlow,
  useEdgesState,
  useNodesState
} from 'reactflow'
import { v4 as uuidv4 } from 'uuid'

import { TreeBlock } from '@core/journeys/ui/block'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'

import { BlockFields } from '../../../__generated__/BlockFields'
import {
  GetJourney_journey_blocks_ButtonBlock as ButtonBlock,
  GetJourney_journey_blocks_CardBlock as CardBlock,
  GetJourney_journey_blocks_FormBlock as FormBlock,
  GetJourney_journey_blocks_RadioOptionBlock as RadioOptionBlock,
  GetJourney_journey_blocks_SignUpBlock as SignUpBlock,
  GetJourney_journey_blocks_StepBlock as StepBlock,
  GetJourney_journey_blocks_TextResponseBlock as TextResponseBlock,
  GetJourney_journey_blocks_VideoBlock as VideoBlock
} from '../../../__generated__/GetJourney'
import { ThemeMode, ThemeName } from '../../../__generated__/globalTypes'
import {
  StepAndCardBlockCreate,
  StepAndCardBlockCreateVariables
} from '../../../__generated__/StepAndCardBlockCreate'
import { STEP_AND_CARD_BLOCK_CREATE } from '../CardPreview/CardPreview'

import ButtonEdge from './edges/ButtonEdge'
import { NODE_HEIGHT, NODE_WIDTH } from './nodes/BaseNode'
import { ButtonBlockNode, ButtonBlockNodeData } from './nodes/ButtonBlockNode'
import { FormBlockNode, FormBlockNodeData } from './nodes/FormBlockNode'
import {
  RadioOptionBlockNode,
  RadioOptionBlockNodeData
} from './nodes/RadioOptionBlockNode'
import { SignUpBlockNode, SignUpBlockNodeData } from './nodes/SignUpBlockNode'
import { StepBlockNode, StepBlockNodeData } from './nodes/StepBlockNode'
import {
  TextResponseBlockNode,
  TextResponseBlockNodeData
} from './nodes/TextResponseBlockNode'
import { VideoBlockNode, VideoBlockNodeData } from './nodes/VideoBlockNode'
import 'reactflow/dist/style.css'
import { NODE_WIDTH } from './nodes/BaseNode'

type InternalNode =
  | Node<StepBlockNodeData, 'StepBlock'>
  | Node<RadioOptionBlockNodeData, 'RadioOptionBlock'>
  | Node<ButtonBlockNodeData, 'ButtonBlock'>
  | Node<TextResponseBlockNodeData, 'TextResponseBlock'>
  | Node<SignUpBlockNodeData, 'SignUpBlock'>
  | Node<FormBlockNodeData, 'FormBlock'>
  | Node<VideoBlockNodeData, 'VideoBlock'>

const NODE_WIDTH_GAP = 30
const NODE_HEIGHT_GAP = 120

interface Connection<T = BlockFields> {
  block: TreeBlock<T>
  step: TreeBlock<StepBlock>
  steps: Array<TreeBlock<StepBlock>>
}

interface Layout<T = BlockFields> {
  block: TreeBlock<T>
  children: Layout[]
}

function transformSteps(steps: Array<TreeBlock<StepBlock>>): {
  nodes: InternalNode[]
  edges: Edge[]
} {
  const nodes: InternalNode[] = []
  const edges: Edge[] = []

  const filterBlocks = [
    'RadioOptionBlock',
    'ButtonBlock',
    'TextResponseBlock',
    'SignUpBlock',
    'FormBlock',
    'VideoBlock'
  ]

  function processLayout(steps: Array<TreeBlock<StepBlock>>): Layout[] {
    const visitedStepIds: string[] = []
    const layouts: Layout[] = []

    function isVisited(id): boolean {
      return visitedStepIds.includes(id)
    }

    function getStepFromId(id): TreeBlock<StepBlock> | undefined {
      return steps.find((step) => step.id === id)
    }

    function traverseBlock(layout: Layout): Layout {
      const { block, children } = layout
      switch (block.__typename) {
        case 'StepBlock':
          if (!isVisited(block.id)) {
            visitedStepIds.push(block.id)
            const stepChildren = block.children[0].children.filter(
              (block) => block.__typename === 'ButtonBlock'
            ) as Array<TreeBlock<ButtonBlock>>
            stepChildren.forEach((block) => {
              if (block.action != null) {
                if (block.action.__typename === 'NavigateToBlockAction') {
                  children.push(traverseBlock({ block, children: [] }))
                }
              }
            })
            if (block.nextBlockId != null && !isVisited(block.nextBlockId)) {
              const nextStep = getStepFromId(block.nextBlockId)
              if (nextStep != null)
                children.push(traverseBlock({ block: nextStep, children: [] }))
            }
          }
          break
        case 'ButtonBlock':
          if (
            block.action?.__typename === 'NavigateToBlockAction' &&
            !isVisited(block.action.blockId)
          ) {
            const nextStep = getStepFromId(block.action.blockId)
            if (nextStep != null)
              children.push(traverseBlock({ block: nextStep, children: [] }))
          }
          break
      }
      return layout
    }

    steps.forEach((step) => {
      if (!isVisited(step.id)) {
        const layout = { block: step, children: [] }
        layouts.push(layout)
        traverseBlock(layout)
      }
    })

    return layouts
  }

  function connectBlockToNextBlock({ block, step, steps }: Connection): void {
    const index = findIndex(steps, (child) => child.id === step.id)
    if (index < 0) return
    if (step.nextBlockId == null && steps[index + 1] != null) {
      edges.push({
        type: 'buttonedge',
        id: `${block.id}->${steps[index + 1].id}`,
        source: block.id,
        target: steps[index + 1].id,
        markerEnd: {
          type: MarkerType.Arrow
        },
        style: {
          strokeWidth: 2,
          strokeDasharray: 4
        }
      })
    }
    if (step.nextBlockId != null && step.nextBlockId !== step.id) {
      edges.push({
        type: 'buttonedge',
        id: `${block.id}->${step.nextBlockId}`,
        source: block.id,
        target: step.nextBlockId,
        markerEnd: {
          type: MarkerType.Arrow
        },
        style: {
          strokeWidth: 2,
          strokeDasharray: 4
        }
      })
    }
  }

  function processCard({
    block: card,
    step,
    steps
  }: Connection<CardBlock>): void {
    const blocks = flatMapDeep(card.children, (block) => {
      if (card.coverBlockId === block.id) return []
      return [block, block.children]
    }).filter((block) => filterBlocks.includes(block.__typename)) as Array<
      TreeBlock<
        | RadioOptionBlock
        | ButtonBlock
        | TextResponseBlock
        | SignUpBlock
        | FormBlock
        | VideoBlock
      >
    >
    blocks.forEach((block) => {
      const node = {
        id: block.id,
        selectable: false,
        position: { x: 0, y: 0 }
      }
      switch (block.__typename) {
        case 'RadioOptionBlock':
          nodes.push({
            ...node,
            type: block.__typename,
            data: block
          })
          break
        case 'ButtonBlock':
          nodes.push({
            ...node,
            type: block.__typename,
            data: block
          })
          break
        case 'TextResponseBlock':
          nodes.push({
            ...node,
            type: block.__typename,
            data: block
          })
          break
        case 'SignUpBlock':
          nodes.push({
            ...node,
            type: block.__typename,
            data: block
          })
          break
        case 'FormBlock':
          nodes.push({
            ...node,
            type: block.__typename,
            data: block
          })
          break
        case 'VideoBlock':
          nodes.push({
            ...node,
            type: block.__typename,
            data: block
          })
          break
      }
      if (block.action != null) {
        if (block.action.__typename === 'NavigateToBlockAction') {
          edges.push({
            type: 'bezeir',
            id: `${block.id}->${block.action.blockId}`,
            source: block.id,
            target: block.action.blockId,
            markerEnd: {
              type: MarkerType.Arrow
            },
            style: {
              strokeWidth: 2
            }
          })
        }
        if (block.action.__typename === 'NavigateAction') {
          connectBlockToNextBlock({ block, step, steps })
        }
      }
    })
  }

  steps.forEach((step) => {
    nodes.push({
      id: step.id,
      type: step.__typename,
      data: {
        ...step,
        steps
      },
      position: { x: 0, y: 0 }
    })

    const cardBlock = step?.children.find(
      (child) => child.__typename === 'CardBlock'
    ) as TreeBlock<CardBlock> | undefined
    if (cardBlock != null) processCard({ block: cardBlock, step, steps })
    connectBlockToNextBlock({ block: step, step, steps })
  })

  // TODO
  const layout = processLayout(steps)

  return { nodes, edges }
}

export function JourneyFlow(): ReactElement {
  const {
    state: { steps }
  } = useEditor()

  const [nodes, setNodes] = useNodesState<Node[]>([])
  const [edges, setEdges] = useEdgesState<Edge[]>([])
  const [previousStepId, setPreviousStepId] = useState()
  const edgeTypes = {
    buttonedge: ButtonEdge
  }

  // Manual position setting
  function setPositions(nodes: Node[]): Node[] {
    const positions = {
      x: 0,
      y: 0
    }
    const layerSizes: number[] = []
    nodes.map((node, index) => {
      if (node.type === 'StepBlock') {
        if (index !== 0) {
          layerSizes.push(positions.x)
        }
        positions.x = 0
      } else {
        positions.x = positions.x + NODE_WIDTH_GAP
      }
    })
    layerSizes.push(positions.x)
    positions.x = 0
    nodes.map((node, index) => {
      if (node.type === 'StepBlock') {
        if (index !== 0) {
          positions.x = 0
          positions.y = positions.y + NODE_HEIGHT_GAP * 2
        }
        node.position = {
          x: positions.x,
          y: positions.y
        }
        const layerSize = layerSizes.shift() ?? 0
        positions.x = 75 - (layerSize * 90) / NODE_WIDTH_GAP
        positions.y = positions.y + NODE_HEIGHT_GAP
      } else {
        positions.x = positions.x + NODE_WIDTH_GAP / 2
        node.position = {
          x: positions.x,
          y: positions.y
        }
        positions.x = positions.x + NODE_WIDTH + NODE_WIDTH_GAP / 2
      }
    })
    return nodes
  }

  useEffect(() => {
    const setLayout = async (nodes) => {
      const layoutNodes = setPositions(nodes)
      setNodes(layoutNodes)
    }

    const { nodes, edges } = transformSteps(steps ?? [])
    setEdges(edges)
    setLayout(nodes)
  }, [steps, setNodes, setEdges])

  const onConnectStart = (_, { nodeId, handleType }): void => {
    console.log('on connect start', { nodeId, handleType })
    setPreviousStepId(nodeId)
    console.log('steps is: ', steps)
  }

  const onConnectEnd = (event): void => {
    if (event.target.className === 'react-flow__pane') {
      console.log('create new node after', previousStepId)
      void createNewNodeAfter(previousStepId)
    }
  }

  const { journey } = useJourney()
  const [stepAndCardBlockCreate] = useMutation<
    StepAndCardBlockCreate,
    StepAndCardBlockCreateVariables
  >(STEP_AND_CARD_BLOCK_CREATE)

  const createNewNodeAfter = async (previousStepId): Promise<void> => {
    if (journey == null) return
    console.log('PREVstepid: ', previousStepId)
    console.log('steps: ', steps)
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
      },
      update(cache, { data }) {
        console.log('dataaaa', data)
        if (data?.stepBlockCreate != null && data?.cardBlockCreate != null) {
          cache.modify({
            id: cache.identify({ __typename: 'Journey', id: journey.id }),
            fields: {
              blocks(existingBlockRefs = [], { readField }) {
                const index = existingBlockRefs.findIndex(
                  (ref) => readField('id', ref) === previousStepId
                )
                console.log(readField('id'))

                console.log('previousStepId is: ', previousStepId)

                const newStepBlockRef = cache.writeFragment({
                  data: data.stepBlockCreate,

                  fragment: gql`
                    fragment NewBlock on Block {
                      id
                    }
                  `
                })
                const newCardBlockRef = cache.writeFragment({
                  data: data.cardBlockCreate,
                  fragment: gql`
                    fragment NewBlock on Block {
                      id
                    }
                  `
                })
                return [
                  ...existingBlockRefs.slice(0, index + 1),
                  newStepBlockRef,
                  newCardBlockRef,
                  ...existingBlockRefs.slice(index + 1)
                ]
              }
            }
          })
        }
      }
    })
  }

  return (
    <Box sx={{ width: '100%', height: '100%' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        edgeTypes={edgeTypes}
        onConnectEnd={onConnectEnd}
        onConnectStart={onConnectStart}
        fitView
        nodeTypes={{
          RadioOptionBlock: RadioOptionBlockNode,
          StepBlock: StepBlockNode,
          ButtonBlock: ButtonBlockNode,
          TextResponseBlock: TextResponseBlockNode,
          SignUpBlock: SignUpBlockNode,
          FormBlock: FormBlockNode,
          VideoBlock: VideoBlockNode
        }}
        proOptions={{ hideAttribution: true }}
      >
        <Controls showInteractive={false} />
        <Background color="#aaa" gap={16} />
      </ReactFlow>
    </Box>
  )
}
