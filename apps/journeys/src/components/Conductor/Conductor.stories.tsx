import { MockedProvider } from '@apollo/client/testing'
import { Meta } from '@storybook/react'
import { ReactElement } from 'react'
import { Conductor } from '.'
import { journeysConfig } from '../../libs/storybook'

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
              id: 'card1.id',
              __typename: 'CardBlock',
              parentBlockId: 'step1.id',
              backgroundColor: null,
              coverBlockId: null,
              themeMode: null,
              themeName: null,
              children: [
                {
                  id: 'radioQuestion1.id',
                  __typename: 'RadioQuestionBlock',
                  parentBlockId: 'card1.id',
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
              id: 'card2.id',
              __typename: 'CardBlock',
              parentBlockId: 'step2.id',
              backgroundColor: null,
              coverBlockId: null,
              themeMode: null,
              themeName: null,
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
              id: 'card3.id',
              __typename: 'CardBlock',
              parentBlockId: 'step3.id',
              backgroundColor: null,
              coverBlockId: null,
              themeMode: null,
              themeName: null,
              children: [
                {
                  id: 'radioQuestion1.id',
                  __typename: 'RadioQuestionBlock',
                  parentBlockId: 'card3.id',
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
              id: 'card4.id',
              __typename: 'CardBlock',
              parentBlockId: 'step4.id',
              backgroundColor: null,
              coverBlockId: null,
              themeMode: null,
              themeName: null,
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
          ]
        }
      ]}
    />
  </MockedProvider>
)

export const VideoJourney = (): ReactElement => (
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
              id: 'card1.id',
              __typename: 'CardBlock',
              parentBlockId: 'step1.id',
              backgroundColor: null,
              coverBlockId: null,
              themeMode: null,
              themeName: null,
              children: [
                {
                  id: 'video1.id',
                  __typename: 'VideoBlock',
                  parentBlockId: 'card1.id',
                  title: '',
                  volume: 1,
                  autoplay: true,
                  mediaComponentId: '2_0-FallingPlates',
                  languageId: '529',
                  children: [
                    {
                      id: 'trigger.id',
                      __typename: 'TriggerBlock',
                      parentBlockId: 'video1.id',
                      triggerStart: 10,
                      triggerAction: {
                        __typename: 'NavigateToBlockAction',
                        gtmEventName: 'gtmEventName',
                        blockId: 'step2.id'
                      },
                      children: []
                    }
                  ]
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
              id: 'card2.id',
              __typename: 'CardBlock',
              parentBlockId: 'step2.id',
              backgroundColor: null,
              coverBlockId: null,
              themeMode: null,
              themeName: null,
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
                      label: 'NextVideo',
                      action: {
                        __typename: 'NavigateToBlockAction',
                        gtmEventName: 'gtmEventName',
                        blockId: 'step3.id'
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
                        blockId: ''
                      },
                      children: []
                    }
                  ]
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
          nextBlockId: 'step4.id',
          children: [
            {
              id: 'card3.id',
              __typename: 'CardBlock',
              parentBlockId: 'step3.id',
              backgroundColor: null,
              coverBlockId: null,
              themeMode: null,
              themeName: null,
              children: [
                {
                  id: 'video2.id',
                  __typename: 'VideoBlock',
                  parentBlockId: 'card3.id',
                  title: '',
                  volume: 1,
                  autoplay: true,
                  mediaComponentId: '1_jf-0-0',
                  languageId: '529',
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

export default Demo as Meta
