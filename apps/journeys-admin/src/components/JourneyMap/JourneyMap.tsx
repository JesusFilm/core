import dagre from 'dagre'
import React, { useCallback } from 'react'
import ReactFlow, {
  MarkerType,
  Position,
  addEdge,
  useEdgesState,
  useNodesState
} from 'reactflow'

import 'reactflow/dist/style.css'

export const JourneyMap = ({ width, height, steps }) => {
  const dagreGraph = new dagre.graphlib.Graph()
  dagreGraph.setDefaultEdgeLabel(() => ({}))

  const nodeWidth = 172
  const nodeHeight = 36

  const getLayoutedElements = (nodes, edges, direction = 'TB') => {
    const isHorizontal = direction === 'LR'
    dagreGraph.setGraph({ 
      rankdir: direction, 
      nodesep: 100, // vertical
      ranksep: 100, // horizontal
      // acyclicer: 'greedy', 
      ranker: 'tight-tree' })

    nodes.forEach((node) => {
      dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight })
    })

    edges.forEach((edge) => {
      dagreGraph.setEdge(edge.source, edge.target)
    })

    dagre.layout(dagreGraph)

    nodes.forEach((node) => {
      console.log(node)
      const nodeWithPosition = dagreGraph.node(node.id)
      node.targetPosition = isHorizontal ? 'left' : 'top'
      node.sourcePosition = isHorizontal ? 'right' : 'bottom'

      // We are shifting the dagre node position (anchor=center center) to the top left
      // so it matches the React Flow node anchor point (top left).
      node.position = {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2
      }

      console.log(node.position)

      return node
    })

    return { nodes, edges }
  }

  const transformData = (data) => {
    const nodes = []
    const links = []
    let x = 0
    let y = 0

    const findRadioQuestions = (block, stepBlockId) => {
      if (block.__typename === 'RadioQuestionBlock') {
        block.children.forEach((child) => {
          
          if (child.__typename === 'RadioOptionBlock') {
            y += 50
            // nodes.push({
            //   id: child.id,
            //   sourcePosition: 'right',
            //   targetPosition: 'left',
            //   parentNode: stepBlockId,
            //   data: {
            //     label: child.label
            //   },
            //   position: { x: 0, y: 0 }
            // })

            // links.push({
            //   id: child.id + '->' + child.action.blockId,
            //   source: child.id,
            //   type: 'smoothstep',
            //   target: child.action.blockId,
            //   animated: true
            // })

            if( child?.action?.blockId ) {
              links.push({
                id: stepBlockId + '->' + child.action.blockId,
                source: stepBlockId,
                target: child.action.blockId,
                label: child?.label,
                markerEnd: {
                  type: MarkerType.Arrow,
                },
                style: {
                  strokeWidth: 2,
                  // stroke: '#FF0072',
                },
                // animated: true
              })
            }
          }
        })
      }

      if (block.children) {
        block.children.forEach((child) =>
          findRadioQuestions(child, stepBlockId)
        )
      }
    }

    data.forEach((block, index) => {
      const yPrev = y
      let stepHeight = 20

      findRadioQuestions(block, block.id)

      stepHeight += y

      nodes.push({
        id: block.id,
        sourcePosition: 'right',
        targetPosition: 'left',
        data: {
          label: index
        },
        position: { x: 0, y: 0 },
        // position: {
        //   x,
        //   yPrev
        // },
        style: {
          
          borderColor: block.children[0].backgroundColor ? block.children[0].backgroundColor : 'rgba(255, 0, 0, 0.2)',
          borderWidth: '3px',
          // width: 100,
          // height: stepHeight
        }
      })

      x += 200

      if (!block.nextBlockId && data[index + 1]) {
        links.push({
          id: block.id + '->' + data[index + 1].id,
          source: block.id,
          target: data[index + 1].id,
          markerEnd: {
            type: MarkerType.Arrow,
          },
          style: {
            strokeWidth: 2,
            strokeDasharray: 4,
            // stroke: '#FF0072',
          },
          // label: 'Test',
          // animated: true
        })
      }

      if (block.nextBlockId && block.nextBlockId !== block.id) {
        links.push({
          id: block.id + '->' + block.nextBlockId,
          source: block.id,
          target: block.nextBlockId,
          markerEnd: {
            type: MarkerType.Arrow,
          },
          style: {
            strokeWidth: 2,
            strokeDasharray: 4,
            // stroke: '#FF0072',
          },
          // label: 'Test',
          // animated: true
        })
      }
    })

    return [nodes, links]
  }

  
  const [stepsNodes, stepEdges] = transformData(steps)
  console.log({steps})
  console.log({stepsNodes})

  const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
    stepsNodes,
    stepEdges,
    'LR'
  )

  console.log({layoutedNodes});
  console.log({layoutedEdges})

  const [nodes, setNodes, onNodesChange] = useNodesState(layoutedNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(layoutedEdges)

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  )

  return (
    <div style={{ width: '100%', height: '400px' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        // fitView
        attributionPosition="bottom-left"
      />
    </div>
  )
}
