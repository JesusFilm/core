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
import { NODE_HEIGHT, NODE_WIDTH } from './nodes/BaseNode'
import 'reactflow/dist/style.css'

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

type ActionBlock =
  | TreeBlock<RadioOptionBlock>
  | TreeBlock<ButtonBlock>
  | TreeBlock<TextResponseBlock>
  | TreeBlock<SignUpBlock>
  | TreeBlock<FormBlock>
  | TreeBlock<VideoBlock>

const isActionBlock = (block): block is ActionBlock => 'action' in block

function transformSteps(steps: Array<TreeBlock<StepBlock>>): {
  nodes: InternalNode[]
  edges: Edge[]
} {
  const nodes: InternalNode[] = []
  const edges: Edge[] = []

  const blocks: TreeBlock<StepBlock>[][] = []
  const visitedStepIds: string[] = []

  function getStepFromId(id): TreeBlock<StepBlock> | undefined {
    if (visitedStepIds.includes(id)) return
    visitedStepIds.push(id)
    return steps.find((step) => step.id === id)
  }

  function getNextStep(
    step: TreeBlock<StepBlock>
  ): TreeBlock<StepBlock> | undefined {
    const index = findIndex(steps, (child) => child.id === step.id)
    if (index < 0) return
    if (step.nextBlockId == null && steps[index + 1] != null) {
      return getStepFromId(steps[index + 1].id)
    }
    if (step.nextBlockId != null && step.nextBlockId !== step.id) {
      return getStepFromId(step.nextBlockId)
    }
  }

  function getDecendantStepsOfStep(
    step: TreeBlock<StepBlock>
  ): TreeBlock<StepBlock>[] {
    const descendants: TreeBlock<StepBlock>[] = []
    const nextStep = getNextStep(step)
    if (nextStep != null) descendants.push(nextStep)
    const children = step.children[0].children.filter(isActionBlock)
    children.forEach((child) => {
      if (child.action?.__typename === 'NavigateToBlockAction') {
        const nextStep = getStepFromId(child.action?.blockId)
        if (nextStep != null) descendants.push(nextStep)
      }
    })
    return descendants
  }

  function processSteps(steps: TreeBlock<StepBlock>[]): void {
    blocks.push(steps)
    const descendants = steps.flatMap((step) => {
      return getDecendantStepsOfStep(step)
    })
    if (descendants.length > 0) processSteps(descendants)
  }

  const step = getStepFromId(steps[0].id)
  if (step != null) processSteps([step])

  console.log(blocks)
  blocks.forEach((steps, index) => {
    const stepY = index * (NODE_HEIGHT + NODE_HEIGHT_GAP)
    steps.forEach((step, index) => {
      const stepX = index * (NODE_WIDTH + NODE_WIDTH_GAP)
      nodes.push({
        id: step.id,
        type: 'StepBlock',
        data: { ...step, steps },
        position: { x: stepX, y: stepY }
      })
      const blockY = stepY + NODE_HEIGHT + 20
      step.children[0].children
        .filter(isActionBlock)
        .forEach((block, index) => {
          const blockX = index * (NODE_WIDTH + NODE_WIDTH_GAP)
          // nodes.push({
          //   id: block.id,
          //   type: block.__typename,
          //   data: block,
          //   position: { x: blockX, y: blockY }
          // })
        })
    })
  })
  // function transformStepsToLayouts(
  //   steps: Array<TreeBlock<StepBlock>>
  // ): Layout[] {
  //   const visitedStepIds: string[] = []
  //   const layouts: Layout[] = []

  //   function isVisited(id): boolean {
  //     return visitedStepIds.includes(id)
  //   }

  //   function getStepFromId(id): TreeBlock<StepBlock> | undefined {
  //     return steps.find((step) => step.id === id)
  //   }

  //   function traverseBlock(layout: Layout): Layout {
  //     const { block, children } = layout
  //     switch (block.__typename) {
  //       case 'StepBlock':
  //         if (!isVisited(block.id)) {
  //           visitedStepIds.push(block.id)
  //           const actionBlocks = block.children[0].children.filter((block) =>
  //             filterBlocks.includes(block.__typename)
  //           ) as ActionBlock[]
  //           actionBlocks.forEach((block) => {
  //             children.push(traverseBlock({ block, children: [] }))
  //           })
  //           if (block.nextBlockId != null && !isVisited(block.nextBlockId)) {
  //             const nextStep = getStepFromId(block.nextBlockId)
  //             if (nextStep != null)
  //               children.push(traverseBlock({ block: nextStep, children: [] }))
  //           }
  //         }
  //         break
  //       case 'RadioOptionBlock':
  //       case 'ButtonBlock':
  //       case 'TextResponseBlock':
  //       case 'SignUpBlock':
  //       case 'FormBlock':
  //       case 'VideoBlock':
  //         if (
  //           block.action?.__typename === 'NavigateToBlockAction' &&
  //           !isVisited(block.action.blockId)
  //         ) {
  //           const nextStep = getStepFromId(block.action.blockId)
  //           if (nextStep != null)
  //             children.push(traverseBlock({ block: nextStep, children: [] }))
  //         }
  //         break
  //     }
  //     return layout
  //   }

  //   steps.forEach((step) => {
  //     if (!isVisited(step.id)) {
  //       const layout = { block: step, children: [] }
  //       layouts.push(layout)
  //       traverseBlock(layout)
  //     }
  //   })

  //   return layouts
  // }

  // function connectBlockToNextBlock({ block, step, steps }: Connection): void {
  //   const index = findIndex(steps, (child) => child.id === step.id)
  //   if (index < 0) return
  //   if (step.nextBlockId == null && steps[index + 1] != null) {
  //     edges.push({
  //       id: `${block.id}->${steps[index + 1].id}`,
  //       source: block.id,
  //       target: steps[index + 1].id,
  //       markerEnd: {
  //         type: MarkerType.Arrow
  //       },
  //       style: {
  //         strokeWidth: 2,
  //         strokeDasharray: 4
  //       }
  //     })
  //   }
  //   if (step.nextBlockId != null && step.nextBlockId !== step.id) {
  //     edges.push({
  //       id: `${block.id}->${step.nextBlockId}`,
  //       source: block.id,
  //       target: step.nextBlockId,
  //       markerEnd: {
  //         type: MarkerType.Arrow
  //       },
  //       style: {
  //         strokeWidth: 2,
  //         strokeDasharray: 4
  //       }
  //     })
  //   }
  // }

  // function processCard({
  //   block: card,
  //   step,
  //   steps
  // }: Connection<CardBlock>): void {
  //   const blocks = flatMapDeep(card.children, (block) => {
  //     if (card.coverBlockId === block.id) return []
  //     return [block, block.children]
  //   }).filter((block) =>
  //     filterBlocks.includes(block.__typename)
  //   ) as ActionBlock[]
  //   blocks.forEach((block) => {
  //     const node = {
  //       id: block.id,
  //       selectable: false,
  //       position: { x: 0, y: 0 }
  //     }
  //     switch (block.__typename) {
  //       case 'RadioOptionBlock':
  //         nodes.push({
  //           ...node,
  //           type: block.__typename,
  //           data: block
  //         })
  //         break
  //       case 'ButtonBlock':
  //         nodes.push({
  //           ...node,
  //           type: block.__typename,
  //           data: block
  //         })
  //         break
  //       case 'TextResponseBlock':
  //         nodes.push({
  //           ...node,
  //           type: block.__typename,
  //           data: block
  //         })
  //         break
  //       case 'SignUpBlock':
  //         nodes.push({
  //           ...node,
  //           type: block.__typename,
  //           data: block
  //         })
  //         break
  //       case 'FormBlock':
  //         nodes.push({
  //           ...node,
  //           type: block.__typename,
  //           data: block
  //         })
  //         break
  //       case 'VideoBlock':
  //         nodes.push({
  //           ...node,
  //           type: block.__typename,
  //           data: block
  //         })
  //         break
  //     }
  //     if (block.action != null) {
  //       if (block.action.__typename === 'NavigateToBlockAction') {
  //         edges.push({
  //           id: `${block.id}->${block.action.blockId}`,
  //           source: block.id,
  //           target: block.action.blockId,
  //           markerEnd: {
  //             type: MarkerType.Arrow
  //           },
  //           style: {
  //             strokeWidth: 2
  //           }
  //         })
  //       }
  //       if (block.action.__typename === 'NavigateAction') {
  //         connectBlockToNextBlock({ block, step, steps })
  //       }
  //     }
  //   })
  // }

  // steps.forEach((step) => {
  //   nodes.push({
  //     id: step.id,
  //     type: step.__typename,
  //     data: {
  //       ...step,
  //       steps
  //     },
  //     position: { x: 0, y: 0 }
  //   })

  //   const cardBlock = step?.children.find(
  //     (child) => child.__typename === 'CardBlock'
  //   ) as TreeBlock<CardBlock> | undefined
  //   if (cardBlock != null) processCard({ block: cardBlock, step, steps })
  //   connectBlockToNextBlock({ block: step, step, steps })
  // })

  // TODO
  // const layouts = transformStepsToLayouts(steps)

  // function processLayout({ block, children }: Layout, x = 0, y = 0): void {
  //   const node = {
  //     id: block.id,
  //     type: block.__typename,
  //     selectable: false,
  //     position: {
  //       x: x * 200,
  //       y: y * 400 + 100 * (block.__typename === 'StepBlock' ? 0 : 1)
  //     },
  //     data: block
  //   }
  //   nodes.push(node)
  //   children.forEach((child, index) => {
  //     processLayout(
  //       child,
  //       index + x,
  //       child.block.__typename === 'StepBlock' ? y + 1 : y
  //     )
  //   })
  // }

  // layouts.forEach((layout) => processLayout(layout))

  return { nodes, edges }
}

export function JourneyFlow(): ReactElement {
  const {
    state: { steps }
  } = useEditor()

  const [nodes, setNodes] = useNodesState([])
  const [edges, setEdges] = useEdgesState([])
  const [previousStepId, setPreviousStepId] = useState()
  const edgeTypes = {
    buttonedge: ButtonEdge
  }

  useEffect(() => {
    const { nodes, edges } = transformSteps(steps ?? [])
    setEdges(edges)
    setNodes(nodes)
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
