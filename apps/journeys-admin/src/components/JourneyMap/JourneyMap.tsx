import dagre from 'dagre'
import React, { useCallback } from 'react'
import ReactFlow, {
  MarkerType,
  MiniMap,
  Position,
  ReactFlowProvider,
  addEdge,
  useEdgesState,
  useNodesState,
  useOnSelectionChange,
  useReactFlow
} from 'reactflow'

import 'reactflow/dist/style.css'
import ActionNode from './ActionNode'
import CustomNode from './CustomNode'
import { OnSelectProps } from './OnSelectProps'

import { styled } from '@mui/material/styles'
import { Box } from '@mui/material'

const BoxStyled = styled(Box)`

  .react-flow .react-flow__node.selected {
    border-radius: 6px;
    box-shadow: 0px 0px 0px 6px #e4e4e4,0px 0px 0px 8px #C52D3A;
  }

  .react-flow__handle.connectionindicator{
    background: #bbb;
    width: 8px;
    height: 8px;
    opacity:0;
  }

  .react-flow__node.selected .react-flow__handle.connectionindicator.react-flow__handle-right{
    background: #fff;
    border-color: #C52D3A;
    border-width: 2px;
    width: 12px;
    height: 12px;
    opacity:1;
  }

  .react-flow__node.selected .react-flow__handle-right,
  .react-flow__node:hover .react-flow__handle-right {
    right: -15px;
  }

  .react-flow__node .react-flow__handle-right {
    right: -6px;
  }

  .react-flow__node .react-flow__handle-left {
    left: -6px;
  }

  .react-flow__node.selected .react-flow__handle-left,
  .react-flow__node:hover .react-flow__handle-left {
    left: -15px;
  }


`
// background: '#bbb', // #C52D3A
//               width: '8px',
//               height: '8px',
//               left: '-16px',
//               border:'none',



const nodeTypes = {
  custom: CustomNode,
  action: ActionNode
};

const FlowMap = ({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onSelect
}) => {
  const reactFlowInstance = useReactFlow()
  useOnSelectionChange({
    onChange: ({ nodes, edges }) => {
      console.log('changed selection', nodes, edges)
      if (nodes[0]?.id !== undefined) {
        onSelect({
          step: nodes[0]?.data?.step
        })
      }
    }
  })
  return (
    <BoxStyled width="100%" height="100%">
      <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      fitView
      // snapGrid ={[50,50]}
      // snapToGrid
      nodeTypes={nodeTypes}
      // zoomOnScroll={false}
      // onScrollCapture={false}
      attributionPosition="bottom-left"
      style={{}}
       />
      {/* <Box sx={{left:'10px', top:'30%', width: '200px', height:'150px', position:'relative'}}>
        <MiniMap nodeColor="#eee" nodeStrokeWidth={3} 
      />
      </Box> */}
    </BoxStyled>
  )
}

interface JourneyMapProps {
  width: any
  height: any
  steps: Array<TreeBlock<StepBlock>>
  selected?: TreeBlock<StepBlock>
  onSelect?: ({ step, view }: OnSelectProps) => void
  // showAddButton?: boolean
  // droppableProvided?: DroppableProvided
  // handleClick?: () => void
  // handleChange?: (selectedId: string) => void
  // isDragging?: boolean
  // isDraggable?: boolean
  // showNavigationCards?: boolean
}

export const JourneyMap = ({
  width,
  height,
  steps,
  selected,
  onSelect
}: JourneyMapProps) => {
  const dagreGraph = new dagre.graphlib.Graph()
  dagreGraph.setDefaultEdgeLabel(() => ({}))

  const nodeWidth = 130
  const nodeHeight = 60

  const getLayoutedElements = (nodes, edges, direction = 'TB') => {
    const isHorizontal = direction === 'LR'
    dagreGraph.setGraph({
      rankdir: direction,
      nodesep: 30, // vertical
      ranksep: 80, // horizontal
      // acyclicer: 'greedy',
      ranker: 'tight-tree'
    })

    nodes.forEach((node) => {
      dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight })
    })

    edges.forEach((edge) => {
      dagreGraph.setEdge(edge.source, edge.target)
    })

    dagre.layout(dagreGraph)

    nodes.forEach((node) => {
      const nodeWithPosition = dagreGraph.node(node.id)
      node.targetPosition = isHorizontal ? 'left' : 'top'
      node.sourcePosition = isHorizontal ? 'right' : 'bottom'

      // We are shifting the dagre node position (anchor=center center) to the top left
      // so it matches the React Flow node anchor point (top left).
      node.position = {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2
      }

      return node
    })

    return { nodes, edges }
  }

  const transformData = (data) => {
    const nodes = []
    const links = []
    let x = 0
    let y = 0

    const findContent = (block) => {
      let image = null
      let title = null
      const titleWeight = null
      // block.children.reverse().forEach((child) => {
      for (let i = block.children.length - 1; i >= 0; i--) {
        const child = block.children[i];
        if (child.__typename === 'ImageBlock' && child?.src) {
          image = child?.src
        }

        if (child.__typename === 'TypographyBlock' && child?.content) {
          title = child.content
        }
      } 

      return [image, title]
    }

    const findRadioQuestions = (block, stepBlockId) => {
      if (block.__typename === 'RadioQuestionBlock') {
        block.children.forEach((child) => {
          if (child.__typename === 'RadioOptionBlock') {
            y += 50
            nodes.push({
              id: child.id,
              // sourcePosition: 'right',
              // targetPosition: 'left',
              // parentNode: stepBlockId,
              type: 'action',
              selectable: false,
              // expandParent: true,
              // extent:'parent',
              data: {
                // icon: <FunctionIcon />,
                title: child.label,
                subline: 'MULTI CHOISE',
                // bgColor: step.children[0].backgroundColor
                //   ? step.children[0].backgroundColor
                //   : null,
      
                // bgImage: stepImage,
      
                // step
              },
              position: { x: 0, y: 0 }
            })

            if (child?.action?.blockId) {
            // links.push({
            //   id: child.id + '->' + child?.action?.blockId,
            //   source: child.id,
            //   type: 'smoothstep',
            //   target: child?.action?.blockId,
            //   animated: true
            // })

            links.push({
              id: child.id + '->' + child?.action?.blockId,
              source: child.id,
              target: child.action.blockId,
              // label: child?.label,
              markerEnd: {
                type: MarkerType.Arrow
              },
              style: {
                strokeWidth: 2
                // stroke: '#FF0072',
              }
              // animated: true
            })
          }

          if (child?.id) {
            links.push({
              id: stepBlockId + '->' + child.id,
              source: stepBlockId,
              target: child.id,
              // label: child?.label,
              // markerEnd: {
              //   type: MarkerType.Arrow
              // },
              style: {
                strokeWidth: 2
                // stroke: '#FF0072',
              }
              // animated: true
            })
          }

            // if (child?.action?.blockId) {
            //   links.push({
            //     id: stepBlockId + '->' + child.action.blockId,
            //     source: stepBlockId,
            //     target: child.action.blockId,
            //     label: child?.label,
            //     markerEnd: {
            //       type: MarkerType.Arrow
            //     },
            //     style: {
            //       strokeWidth: 2
            //       // stroke: '#FF0072',
            //     }
            //     // animated: true
            //   })
            // }
          }
        })
      }

      if (block.children) {
        block.children.forEach((child) =>
          findRadioQuestions(child, stepBlockId)
        )
      }
    }

    data.forEach((step, index) => {
      const yPrev = y
      let stepHeight = 20

      findRadioQuestions(step, step.id)

      stepHeight += y

      const [stepImage, stepTitle] = findContent(step?.children[0]);
      // console.log({step}, stepImage, stepTitle);
      nodes.push({
        id: step.id,
        sourcePosition: 'right',
        targetPosition: 'left',
        type: 'custom',
    
        data: {
          // icon: <FunctionIcon />,
          title: stepTitle,
          subline: 'api.ts',
          bgColor: step.children[0].backgroundColor
            ? step.children[0].backgroundColor
            : null,

          bgImage: stepImage,

          step
        },
        position: { x: 0, y: 0 },
       
      })

      x += 200

      if (!step.nextBlockId && data[index + 1]) {
        links.push({
          id: step.id + '->' + data[index + 1].id,
          source: step.id,
          target: data[index + 1].id,
          markerEnd: {
            type: MarkerType.Arrow
          },
          style: {
            strokeWidth: 2,
            strokeDasharray: 4
            // stroke: '#FF0072',
          }
          // label: 'Test',
          // animated: true
        })
      }

      if (step.nextBlockId && step.nextBlockId !== step.id) {
        links.push({
          id: step.id + '->' + step.nextBlockId,
          source: step.id,
          target: step.nextBlockId,
          markerEnd: {
            type: MarkerType.Arrow
          },
          style: {
            strokeWidth: 2,
            strokeDasharray: 4
            // stroke: '#FF0072',
          }
          // label: 'Test',
          // animated: true
        })
      }
    })

    return [nodes, links]
  }

  const [stepsNodes, stepEdges] = transformData(steps)
  // console.log({ steps })
  // console.log({ stepsNodes })

  const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
    stepsNodes,
    stepEdges,
    'LR'
  )

  // console.log({ layoutedNodes })
  // console.log({ layoutedEdges })

  const [nodes, setNodes, onNodesChange] = useNodesState(layoutedNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(layoutedEdges)

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  )

  return (
    <div style={{ width: '100%', height: '400px' }}>
      <ReactFlowProvider>
        <FlowMap
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onSelect={onSelect}
          // fitView
          attributionPosition="bottom-left"
        />
      </ReactFlowProvider>
    </div>
  )
}
