import { Story, Meta } from '@storybook/react'
import { EditorProvider, simpleComponentConfig } from '@core/journeys/ui'

import { MoveBlockButtons } from '.'

const AttributeStory = {
  ...simpleComponentConfig,
  component: MoveBlockButtons,
  title: 'Journeys-Admin/Editor/ControlPanel/Attributes/Attribute'
}

export const Default: Story = () => {
  return (
    <EditorProvider>
      <MoveBlockButtons
        selectedBlock={{
          id: 'typographyBlockId1',
          __typename: 'TypographyBlock',
          parentBlockId: 'card0.id',
          parentOrder: 0,
          align: null,
          color: null,
          content: 'Text1',
          variant: null,
          children: []
        }}
        selectedStep={{
          __typename: 'StepBlock',
          id: 'step3.id',
          parentBlockId: null,
          parentOrder: 2,
          locked: true,
          nextBlockId: null,
          children: [
            {
              id: 'cardId',
              __typename: 'CardBlock',
              parentBlockId: 'stepId',
              parentOrder: 0,
              coverBlockId: null,
              backgroundColor: null,
              themeMode: null,
              themeName: null,
              fullscreen: false,
              children: [
                {
                  id: 'typographyBlockId1',
                  __typename: 'TypographyBlock',
                  parentBlockId: 'card0.id',
                  parentOrder: 0,
                  align: null,
                  color: null,
                  content: 'Text1',
                  variant: null,
                  children: []
                },
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
        }}
      />
    </EditorProvider>
  )
}

export default AttributeStory as Meta
