// import { gql, useQuery } from '@apollo/client'
import Box from '@mui/material/Box'
import { SmartBezierEdge } from '@tisoap/react-flow-smart-edge'
import { ReactElement, useEffect, useState } from 'react'
import {
  Background,
  Controls,
  OnConnectEnd,
  OnConnectStart,
  ReactFlow,
  useEdgesState,
  useNodesState
} from 'reactflow'
import { v4 as uuidv4 } from 'uuid'

import { TreeBlock } from '@core/journeys/ui/block'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'

// import {
//   GetStepBlockPositions,
//   GetStepBlockPositionsVariables
// } from '../../../../../__generated__/GetStepBlockPositions'
import { ThemeMode, ThemeName } from '../../../../../__generated__/globalTypes'
import { useNavigateToBlockActionUpdateMutation } from '../../../../libs/useNavigateToBlockActionUpdateMutation'
import { useStepAndCardBlockCreateMutation } from '../../../../libs/useStepAndCardBlockCreateMutation'
import { useStepBlockNextBlockUpdateMutation } from '../../../../libs/useStepBlockNextBlockUpdateMutation'

import { isActionBlock } from './libs/isActionBlock'
import { transformSteps } from './libs/transformSteps'
import { ButtonBlockNode } from './nodes/ButtonBlockNode'
import { FormBlockNode } from './nodes/FormBlockNode'
import { RadioOptionBlockNode } from './nodes/RadioOptionBlockNode'
import { SignUpBlockNode } from './nodes/SignUpBlockNode'
import { SocialPreviewNode } from './nodes/SocialPreviewNode'
import { StepBlockNode } from './nodes/StepBlockNode'
import { TextResponseBlockNode } from './nodes/TextResponseBlockNode'
import { VideoBlockNode } from './nodes/VideoBlockNode'

import 'reactflow/dist/style.css'

// export const GET_STEP_BLOCK_POSITIONS = gql`
//   query GetStepBlockPositions($journeyIds: [ID!]) {
//     blocks(where: { journeyIds: $journeyIds, typenames: "StepBlock" }) {
//       id
//       ... on StepBlock {
//         x
//         y
//       }
//     }
//   }
// `

export function JourneyFlow(): ReactElement {
  const { journey } = useJourney()
  const {
    state: { steps }
  } = useEditor()
  // const { data } = useQuery<
  //   GetStepBlockPositions,
  //   GetStepBlockPositionsVariables
  // >(GET_STEP_BLOCK_POSITIONS, {
  //   variables: { journeyIds: journey?.id != null ? [journey.id] : undefined }
  // })
  const [nodes, setNodes] = useNodesState([])
  const [edges, setEdges] = useEdgesState([])
  const [previousNodeId, setPreviousNodeId] = useState<string | null>(null)
  const edgeTypes = {
    smart: SmartBezierEdge
  }

  useEffect(() => {
    const { nodes, edges } = transformSteps(steps ?? [])
    setEdges(edges)
    setNodes(nodes)
  }, [steps, setNodes, setEdges])

  const onConnectStart: OnConnectStart = (_, { nodeId }) => {
    setPreviousNodeId(nodeId)
  }

  const onConnectEnd: OnConnectEnd = (event) => {
    if (
      (event.target as HTMLElement | undefined)?.className ===
        'react-flow__pane' &&
      previousNodeId != null
    ) {
      const nodeData = nodes.find((node) => node.id === previousNodeId)?.data
      void createNewStepAndConnectBlock(nodeData)
    }
  }

  const [stepAndCardBlockCreate] = useStepAndCardBlockCreateMutation()
  const [stepBlockNextBlockUpdate] = useStepBlockNextBlockUpdateMutation()
  const [navigateToBlockActionUpdate] = useNavigateToBlockActionUpdateMutation()

  async function createNewStepAndConnectBlock(
    block?: TreeBlock
  ): Promise<void> {
    if (journey == null || block == null) return
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
      }
    })
    if (block.__typename === 'StepBlock') {
      await stepBlockNextBlockUpdate({
        variables: {
          id: block.id,
          journeyId: journey.id,
          input: {
            nextBlockId: newStepId
          }
        },
        optimisticResponse: {
          stepBlockUpdate: {
            id: block.id,
            __typename: 'StepBlock',
            nextBlockId: newStepId
          }
        }
      })
    } else if (isActionBlock(block)) {
      await navigateToBlockActionUpdate(block, newStepId)
    }
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
          VideoBlock: VideoBlockNode,
          SocialPreview: SocialPreviewNode
        }}
        proOptions={{ hideAttribution: true }}
      >
        <Controls showInteractive={false} />
        <Background color="#aaa" gap={16} />
      </ReactFlow>
    </Box>
  )
}
