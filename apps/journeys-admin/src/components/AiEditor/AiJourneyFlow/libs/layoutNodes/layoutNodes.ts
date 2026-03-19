import dagre from '@dagrejs/dagre'
import { type Edge, type Node, Position } from 'reactflow'

const RANK_DIR = 'LR'
const RANK_SEP = 120
const NODE_SEP = 40

interface LayoutNodesOptions {
  nodeWidth: number
  nodeHeight: number
}

export function layoutNodes(
  nodes: Node[],
  edges: Edge[],
  options: LayoutNodesOptions
): Node[] {
  const { nodeWidth, nodeHeight } = options
  const graph = new dagre.graphlib.Graph()

  graph.setDefaultEdgeLabel(() => ({}))
  graph.setGraph({
    rankdir: RANK_DIR,
    ranksep: RANK_SEP,
    nodesep: NODE_SEP
  })

  for (const node of nodes) {
    graph.setNode(node.id, {
      width: node.data.measuredWidth ?? nodeWidth,
      height: node.data.measuredHeight ?? nodeHeight
    })
  }

  for (const edge of edges) {
    graph.setEdge(edge.source, edge.target)
  }

  dagre.layout(graph)

  return nodes.map((node) => {
    const dagreNode = graph.node(node.id)
    if (dagreNode == null) return node

    const width = node.data.measuredWidth ?? nodeWidth
    const height = node.data.measuredHeight ?? nodeHeight

    return {
      ...node,
      position: {
        x: dagreNode.x - width / 2,
        y: dagreNode.y - height / 2
      },
      sourcePosition: Position.Right,
      targetPosition: Position.Left
    }
  })
}
