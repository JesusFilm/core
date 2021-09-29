import { MockedProvider } from '@apollo/client/testing'
import { ThemeProvider } from '@core/shared/ui'
import { Meta } from '@storybook/react'
import { ThemeMode, ThemeName } from '../../../__generated__/globalTypes'
import { ReactElement } from 'react'
import { Conductor } from '.'
import { journeysConfig } from '../../libs/storybook/decorators'

const Demo = {
  ...journeysConfig,
  component: Conductor,
  title: 'Journeys/Conductor',
  parameters: {
    layout: 'fullscreen'
  }
}

export const Default = (): ReactElement => (
  <MockedProvider>
    <Conductor
      blocks={[
        {
          id: 'step1.id',
          __typename: 'StepBlock',
          parentBlockId: null,
          locked: false,
          nextBlockId: 'step2.id',
          children: [
            {
              id: 'radioQuestion1.id',
              __typename: 'RadioQuestionBlock',
              parentBlockId: 'step1.id',
              label: 'Step 1',
              description: 'Start',
              children: [
                {
                  id: 'radioOption2.id',
                  __typename: 'RadioOptionBlock',
                  parentBlockId: 'radioQuestion1.id',
                  label: 'Step 2 (Locked)',
                  action: {
                    __typename: 'NavigateToBlockAction',
                    gtmEventName: 'gtmEventName',
                    blockId: 'step2.id'
                  },
                  children: []
                },
                {
                  id: 'radioOption3.id',
                  __typename: 'RadioOptionBlock',
                  parentBlockId: 'radioQuestion1.id',
                  label: 'Step 3 (No nextBlockId)',
                  action: {
                    __typename: 'NavigateToBlockAction',
                    gtmEventName: 'gtmEventName',
                    blockId: 'step3.id'
                  },
                  children: []
                },
                {
                  id: 'radioOption4.id',
                  __typename: 'RadioOptionBlock',
                  parentBlockId: 'radioQuestion1.id',
                  label: 'Step 4 (End)',
                  action: {
                    __typename: 'NavigateToBlockAction',
                    gtmEventName: 'gtmEventName',
                    blockId: 'step4.id'
                  },
                  children: []
                }
              ]
            }
          ]
        },
        {
          id: 'step2.id',
          __typename: 'StepBlock',
          parentBlockId: null,
          locked: true,
          nextBlockId: 'step3.id',
          children: [
            {
              id: 'radioQuestion1.id',
              __typename: 'RadioQuestionBlock',
              parentBlockId: 'step2.id',
              label: 'Step 2',
              description: 'Locked',
              children: [
                {
                  id: 'radioOption1.id',
                  __typename: 'RadioOptionBlock',
                  parentBlockId: 'radioQuestion1.id',
                  label: 'Step 1 (Start)',
                  action: {
                    __typename: 'NavigateToBlockAction',
                    gtmEventName: 'gtmEventName',
                    blockId: 'step1.id'
                  },
                  children: []
                },
                {
                  id: 'radioOption3.id',
                  __typename: 'RadioOptionBlock',
                  parentBlockId: 'radioQuestion1.id',
                  label: 'Step 3 (No nextBlockId)',
                  action: {
                    __typename: 'NavigateToBlockAction',
                    gtmEventName: 'gtmEventName',
                    blockId: 'step3.id'
                  },
                  children: []
                },
                {
                  id: 'radioOption4.id',
                  __typename: 'RadioOptionBlock',
                  parentBlockId: 'radioQuestion1.id',
                  label: 'Step 4 (End)',
                  action: {
                    __typename: 'NavigateToBlockAction',
                    gtmEventName: 'gtmEventName',
                    blockId: 'step4.id'
                  },
                  children: []
                }
              ]
            }
          ]
        },
        {
          id: 'step3.id',
          __typename: 'StepBlock',
          parentBlockId: null,
          locked: false,
          nextBlockId: null,
          children: [
            {
              id: 'radioQuestion1.id',
              __typename: 'RadioQuestionBlock',
              parentBlockId: 'step1.id',
              label: 'Step 3',
              description: 'No nextBlockId',
              children: [
                {
                  id: 'radioOption1.id',
                  __typename: 'RadioOptionBlock',
                  parentBlockId: 'radioQuestion1.id',
                  label: 'Step 1 (Start)',
                  action: {
                    __typename: 'NavigateToBlockAction',
                    gtmEventName: 'gtmEventName',
                    blockId: 'step1.id'
                  },
                  children: []
                },
                {
                  id: 'radioOption2.id',
                  __typename: 'RadioOptionBlock',
                  parentBlockId: 'radioQuestion1.id',
                  label: 'Step 2 (Locked)',
                  action: {
                    __typename: 'NavigateToBlockAction',
                    gtmEventName: 'gtmEventName',
                    blockId: 'step2.id'
                  },
                  children: []
                },
                {
                  id: 'radioOption4.id',
                  __typename: 'RadioOptionBlock',
                  parentBlockId: 'radioQuestion1.id',
                  label: 'Step 4 (End)',
                  action: {
                    __typename: 'NavigateToBlockAction',
                    gtmEventName: 'gtmEventName',
                    blockId: 'step4.id'
                  },
                  children: []
                }
              ]
            }
          ]
        },
        {
          id: 'step4.id',
          __typename: 'StepBlock',
          parentBlockId: null,
          locked: false,
          nextBlockId: null,
          children: [
            {
              id: 'radioQuestion1.id',
              __typename: 'RadioQuestionBlock',
              parentBlockId: 'step4.id',
              label: 'Step 4',
              description: 'End',
              children: [
                {
                  id: 'radioOption1.id',
                  __typename: 'RadioOptionBlock',
                  parentBlockId: 'radioQuestion1.id',
                  label: 'Step 1 (Start)',
                  action: {
                    __typename: 'NavigateToBlockAction',
                    gtmEventName: 'gtmEventName',
                    blockId: 'step1.id'
                  },
                  children: []
                },
                {
                  id: 'radioOption2.id',
                  __typename: 'RadioOptionBlock',
                  parentBlockId: 'radioQuestion1.id',
                  label: 'Step 2 (Locked)',
                  action: {
                    __typename: 'NavigateToBlockAction',
                    gtmEventName: 'gtmEventName',
                    blockId: 'step2.id'
                  },
                  children: []
                },
                {
                  id: 'radioOption3.id',
                  __typename: 'RadioOptionBlock',
                  parentBlockId: 'radioQuestion1.id',
                  label: 'Step 3 (No nextBlockId)',
                  action: {
                    __typename: 'NavigateToBlockAction',
                    gtmEventName: 'gtmEventName',
                    blockId: 'step3.id'
                  },
                  children: []
                }
              ]
            }
          ]
        }
      ]}
    />
  </MockedProvider>
)

export const Dark = (): ReactElement => (
  <ThemeProvider themeMode={ThemeMode.dark} themeName={ThemeName.base}>
    <Default />
  </ThemeProvider>
)

export default Demo as Meta
