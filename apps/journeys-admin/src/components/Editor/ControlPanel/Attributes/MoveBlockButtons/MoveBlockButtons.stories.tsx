import { Story, Meta } from '@storybook/react'
import { MockedProvider } from '@apollo/client/testing'
import Stack from '@mui/material/Stack'
import { EditorProvider, TreeBlock } from '@core/journeys/ui'
import { simpleComponentConfig } from '../../../../../libs/storybook/config'
import { MoveBlockButtons } from '.'

const AttributeStory = {
  ...simpleComponentConfig,
  component: MoveBlockButtons,
  title: 'Journeys-Admin/Editor/ControlPanel/Attributes/MoveBlockButtons'
}

const block: TreeBlock = {
  id: 'typographyBlockId1',
  __typename: 'TypographyBlock',
  parentBlockId: 'card0.id',
  parentOrder: 0,
  align: null,
  color: null,
  content: 'Text1',
  variant: null,
  children: []
}

const step: TreeBlock = {
  __typename: 'StepBlock',
  id: 'step0.id',
  parentBlockId: null,
  parentOrder: 0,
  locked: true,
  nextBlockId: null,
  children: [
    {
      id: 'card0.id',
      __typename: 'CardBlock',
      parentBlockId: 'step0.id',
      parentOrder: 0,
      coverBlockId: null,
      backgroundColor: null,
      themeMode: null,
      themeName: null,
      fullscreen: false,
      children: [
        block,
        {
          id: 'typographyBlockId2',
          __typename: 'TypographyBlock',
          parentBlockId: 'card0.id',
          parentOrder: 1,
          align: null,
          color: null,
          content: 'Text2',
          variant: null,
          children: []
        }
      ]
    }
  ]
}

export const Default: Story = () => {
  return (
    <MockedProvider>
      <EditorProvider>
        <Stack
          direction="row"
          spacing={4}
          sx={{
            overflowX: 'auto',
            py: 5,
            px: 6
          }}
        >
          <MoveBlockButtons selectedBlock={block} selectedStep={step} />
        </Stack>
      </EditorProvider>
    </MockedProvider>
  )
}

export default AttributeStory as Meta
