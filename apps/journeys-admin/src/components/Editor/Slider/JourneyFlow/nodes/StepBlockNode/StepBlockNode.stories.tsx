import Box from '@mui/material/Box'
import { Meta, StoryObj } from '@storybook/react'
import { ReactElement } from 'react'
import { ReactFlowProvider } from 'reactflow'

import { journeysAdminConfig } from '../../../../../../libs/storybook'

import {
  STEP_NODE_HEIGHT,
  STEP_NODE_WIDTH,
  StepBlockNode,
  StepBlockNodeData
} from '.'

const StepBlockNodeStory: Meta<typeof StepBlockNode> = {
  ...journeysAdminConfig,
  component: StepBlockNode,
  title: 'Journeys-Admin/JourneyFlow/StepBlockNode'
}

const stepBlockNodeData: StepBlockNodeData = {
  steps: [],
  locked: false,
  nextBlockId: null,
  __typename: 'StepBlock',
  id: 'StepBlockId',
  parentBlockId: null,
  parentOrder: null,
  children: [
    {
      backgroundColor: null,
      children: [
        {
          alt: 'onboarding card 1 cover',
          blurhash: 'UbLX6?~p9FtRkX.8ogD%IUj@M{adxaM_ofkW',
          children: [],
          height: 768,
          id: 'c1819b66-ecce-4448-aad5-1b0076e27a52',
          parentBlockId: 'f812a82e-50ad-464a-9d26-af07127ce742',
          parentOrder: 0,
          src: 'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/ae95a856-1401-41e1-6f3e-7b4e6f707f00/public',
          width: 1152,
          __typename: 'ImageBlock'
        },
        {
          align: null,
          children: [],
          color: null,
          content:
            'This title is really long so that the line wrap can be tested and shown',
          id: '2b59b819-667c-49c4-b2fe-ed1a1f355993',
          parentBlockId: 'f812a82e-50ad-464a-9d26-af07127ce742',
          parentOrder: 0,
          variant: null,
          __typename: 'TypographyBlock'
        },
        {
          align: null,
          children: [],
          color: null,
          content:
            'This title is really long so that the line wrap can be tested and shown',
          id: '2b59b819-667c-49c4-b2fe-ed1a1f355993',
          parentBlockId: 'f812a82e-50ad-464a-9d26-af07127ce742',
          parentOrder: 0,
          variant: null,
          __typename: 'TypographyBlock'
        }
      ],
      coverBlockId: 'c1819b66-ecce-4448-aad5-1b0076e27a52',
      fullscreen: false,
      id: 'f812a82e-50ad-464a-9d26-af07127ce742',
      parentBlockId: '94302faa-73b9-4023-b639-8b6e1ad5e391',
      parentOrder: 0,
      themeMode: null,
      themeName: null,
      __typename: 'CardBlock'
    }
  ]
}

const emptyStepBlockNodeData: StepBlockNodeData = {
  steps: [],
  locked: false,
  nextBlockId: null,
  __typename: 'StepBlock',
  id: 'StepBlockId',
  parentBlockId: null,
  parentOrder: null,
  children: []
}

const StepBlockNodeComponent = (): ReactElement => {
  return (
    <ReactFlowProvider>
      <Box
        sx={{
          width: STEP_NODE_WIDTH,
          height: STEP_NODE_HEIGHT,
          position: 'relative'
        }}
      >
        <StepBlockNode
          data={stepBlockNodeData}
          id=""
          selected={false}
          type=""
          zIndex={0}
          isConnectable={false}
          xPos={0}
          yPos={0}
          dragging={false}
        />
      </Box>
    </ReactFlowProvider>
  )
}

const Template: StoryObj<typeof StepBlockNode> = {
  render: () => <StepBlockNodeComponent />
}

export const Default = { ...Template }

export const Empty: StoryObj<typeof StepBlockNode> = {
  render: () => {
    return (
      <ReactFlowProvider>
        <Box
          sx={{
            width: STEP_NODE_WIDTH,
            height: STEP_NODE_HEIGHT,
            position: 'relative'
          }}
        >
          <StepBlockNode
            data={emptyStepBlockNodeData}
            id=""
            selected={false}
            type=""
            zIndex={0}
            isConnectable={false}
            xPos={0}
            yPos={0}
            dragging={false}
          />
        </Box>
      </ReactFlowProvider>
    )
  }
}

export const Selected: StoryObj<typeof StepBlockNode> = {
  render: () => {
    return (
      <ReactFlowProvider>
        <Box
          sx={{
            width: STEP_NODE_WIDTH,
            height: STEP_NODE_HEIGHT,
            position: 'relative',
            borderRadius: 2,
            outline: (theme) => `2px solid ${theme.palette.primary.main}`,
            outlineOffset: '5px'
          }}
        >
          <StepBlockNode
            data={stepBlockNodeData}
            id="selectedId"
            selected
            type=""
            zIndex={0}
            isConnectable
            xPos={0}
            yPos={0}
            dragging={false}
          />
        </Box>
      </ReactFlowProvider>
    )
  }
}

export default StepBlockNodeStory
