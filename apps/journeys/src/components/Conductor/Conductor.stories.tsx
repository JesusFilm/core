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
                  autoplay: true,
                  muted: true,
                  videoContent: {
                    __typename: 'VideoArclight',
                    src: 'https://manifest.prod.boltdns.net/manifest/v1/hls/v4/clear/1226740748001/23f84185-80ff-49bd-8dbb-75c53022daef/10s/master.m3u8?fastly_token=NjE4MGJkMzlfMDQ1OGE5MTNjNzAxODg4NGRiZjFlZGEyOTQwMzkxYjk0NjM4NDIzMjIxNDc0M2I5OGNjNzBlYWY3MzM2OTBlNw%3D%3D'
                  },
                  endAt: null,
                  startAt: null,
                  children: [
                    {
                      id: 'trigger.id',
                      __typename: 'VideoTriggerBlock',
                      parentBlockId: 'video1.id',
                      triggerStart: 20,
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
                  autoplay: true,
                  muted: false,
                  videoContent: {
                    __typename: 'VideoArclight',
                    src: 'https://manifest.prod.boltdns.net/manifest/v1/hls/v4/clear/1226740748001/23f84185-80ff-49bd-8dbb-75c53022daef/10s/master.m3u8?fastly_token=NjE4MGJkMzlfMDQ1OGE5MTNjNzAxODg4NGRiZjFlZGEyOTQwMzkxYjk0NjM4NDIzMjIxNDc0M2I5OGNjNzBlYWY3MzM2OTBlNw%3D%3D'
                  },
                  endAt: null,
                  startAt: 21,
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
