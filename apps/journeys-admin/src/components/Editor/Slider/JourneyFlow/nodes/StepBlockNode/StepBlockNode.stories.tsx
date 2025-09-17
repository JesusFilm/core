import { MockedProvider } from '@apollo/client/testing'
import Box from '@mui/material/Box'
import { Meta, StoryObj } from '@storybook/react'
import { userEvent, waitFor, within } from '@storybook/test'
import { ComponentPropsWithoutRef } from 'react'
import { Background, ReactFlow } from 'reactflow'
import 'reactflow/dist/style.css'

import {
  ActiveContent,
  EditorProvider,
  EditorState
} from '@core/journeys/ui/EditorProvider'
import { simpleComponentConfig } from '@core/shared/ui/storybook'

import { StepBlockNode } from '.'

const StepBlockNodeStory: Meta<typeof StepBlockNode> = {
  ...simpleComponentConfig,
  component: StepBlockNode,
  title: 'Journeys-Admin/Editor/Slider/JourneyFlow/nodes/StepBlockNode'
}

const defaultNode = {
  id: '7562388a-5dbe-4b10-b14c-c0cad7420f63',
  type: 'StepBlock',
  data: {
    __typename: 'StepBlock',
    id: '7562388a-5dbe-4b10-b14c-c0cad7420f63',
    parentBlockId: null,
    parentOrder: 0,
    locked: false,
    nextBlockId: null,
    children: [
      {
        __typename: 'CardBlock',
        id: '91ba1eb7-89a1-44d6-b579-7a98315d92ad',
        parentBlockId: '7562388a-5dbe-4b10-b14c-c0cad7420f63',
        parentOrder: 0,
        backgroundColor: null,
        coverBlockId: 'f4b922ea-7834-419d-8d7b-79b3ab17ae9d',
        themeMode: null,
        themeName: null,
        fullscreen: false,
        backdropBlur: null,
        children: []
      }
    ],
    steps: [
      {
        __typename: 'StepBlock',
        id: '7562388a-5dbe-4b10-b14c-c0cad7420f63',
        parentBlockId: null,
        parentOrder: 0,
        locked: false,
        nextBlockId: null,
        children: [
          {
            __typename: 'CardBlock',
            id: '91ba1eb7-89a1-44d6-b579-7a98315d92ad',
            parentBlockId: '7562388a-5dbe-4b10-b14c-c0cad7420f63',
            parentOrder: 0,
            backgroundColor: null,
            coverBlockId: 'f4b922ea-7834-419d-8d7b-79b3ab17ae9d',
            themeMode: null,
            themeName: null,
            fullscreen: false,
            backdropBlur: null,
            children: [
              {
                __typename: 'TypographyBlock',
                id: '1e2b2229-81d2-4e49-aaa5-52bca5ae3d49',
                parentBlockId: '91ba1eb7-89a1-44d6-b579-7a98315d92ad',
                parentOrder: 0,
                align: null,
                color: null,
                content: 'The Journey Is On',
                variant: 'h3',
                children: [],
                settings: {
                  __typename: 'TypographyBlockSettings',
                  color: null
                }
              },
              {
                __typename: 'TypographyBlock',
                id: 'ad4205e5-cbae-4d36-8e22-b1cb6d0197da',
                parentBlockId: '91ba1eb7-89a1-44d6-b579-7a98315d92ad',
                parentOrder: 1,
                align: null,
                color: null,
                content: '"Go, and lead the people on their way..."',
                variant: 'body1',
                children: [],
                settings: {
                  __typename: 'TypographyBlockSettings',
                  color: null
                }
              },
              {
                __typename: 'TypographyBlock',
                id: 'a449d2a0-b39e-4f1b-a4f9-10eb950a47d8',
                parentBlockId: '91ba1eb7-89a1-44d6-b579-7a98315d92ad',
                parentOrder: 2,
                align: null,
                color: null,
                content: 'Deuteronomy 10:11',
                variant: 'caption',
                children: [],
                settings: {
                  __typename: 'TypographyBlockSettings',
                  color: null
                }
              },
              {
                __typename: 'ImageBlock',
                id: 'f4b922ea-7834-419d-8d7b-79b3ab17ae9d',
                parentBlockId: '91ba1eb7-89a1-44d6-b579-7a98315d92ad',
                parentOrder: null,
                src: 'https://images.unsplash.com/photo-1524414287096-c7fb74ab3ba0?w=854&q=50',
                alt: 'two hot air balloons in the sky',
                width: 854,
                height: 567,
                blurhash: 'UgFiJ[59PC=r{@E3XTxWjGngs7NeslWCskRk',
                children: []
              }
            ]
          }
        ]
      }
    ]
  },
  position: { x: -200, y: 0 }
}

const videoNode = {
  id: '8ef89591-73d4-4ccf-bdfd-cd2ad127f383',
  type: 'StepBlock',
  data: {
    __typename: 'StepBlock',
    id: '8ef89591-73d4-4ccf-bdfd-cd2ad127f383',
    parentBlockId: null,
    parentOrder: 6,
    locked: false,
    nextBlockId: null,
    children: [
      {
        __typename: 'CardBlock',
        id: '76fb25cb-0c02-4068-a015-83c81de061a2',
        parentBlockId: '8ef89591-73d4-4ccf-bdfd-cd2ad127f383',
        parentOrder: 0,
        backgroundColor: null,
        coverBlockId: null,
        themeMode: 'dark',
        themeName: 'base',
        fullscreen: false,
        backdropBlur: null,
        children: [
          {
            __typename: 'VideoBlock',
            id: 'f2c4a164-c87e-4944-91a9-b1f1df0b2cfb',
            parentBlockId: '76fb25cb-0c02-4068-a015-83c81de061a2',
            parentOrder: 0,
            muted: false,
            autoplay: true,
            startAt: 0,
            endAt: 118,
            posterBlockId: null,
            fullsize: true,
            videoId: '1_0-TrainV_1Install',
            videoVariantLanguageId: '529',
            source: 'internal',
            title: null,
            description: null,
            image: null,
            duration: 118,
            objectFit: null,
            video: {
              __typename: 'Video',
              id: '1_0-TrainV_1Install',
              title: [
                {
                  __typename: 'VideoTitle',
                  value: 'Installing the Jesus Film Media App'
                }
              ],
              image:
                'https://d1wl257kev7hsz.cloudfront.net/cinematics/lrg_cine_install.jpg',
              variant: {
                __typename: 'VideoVariant',
                id: '1_529-0-TrainV_1Install',
                hls: 'https://arc.gt/zxqrt'
              }
            },
            action: null,
            children: []
          }
        ]
      }
    ],
    steps: [
      {
        __typename: 'StepBlock',
        id: '5ffbbc7d-3177-46ac-a327-eb8a68284ddc',
        parentBlockId: null,
        parentOrder: 5,
        locked: false,
        nextBlockId: null,
        children: [
          {
            __typename: 'CardBlock',
            id: '638a6321-6e1f-44c2-9664-292d5b7a78ff',
            parentBlockId: '5ffbbc7d-3177-46ac-a327-eb8a68284ddc',
            parentOrder: 0,
            backgroundColor: null,
            coverBlockId: null,
            themeMode: 'dark',
            themeName: 'base',
            fullscreen: false,
            backdropBlur: null,
            children: []
          }
        ]
      },
      {
        __typename: 'StepBlock',
        id: '8ef89591-73d4-4ccf-bdfd-cd2ad127f383',
        parentBlockId: null,
        parentOrder: 6,
        locked: false,
        nextBlockId: null,
        children: [
          {
            __typename: 'CardBlock',
            id: '76fb25cb-0c02-4068-a015-83c81de061a2',
            parentBlockId: '8ef89591-73d4-4ccf-bdfd-cd2ad127f383',
            parentOrder: 0,
            backgroundColor: null,
            coverBlockId: null,
            themeMode: 'dark',
            themeName: 'base',
            fullscreen: false,
            backdropBlur: null,
            children: [
              {
                __typename: 'VideoBlock',
                id: 'f2c4a164-c87e-4944-91a9-b1f1df0b2cfb',
                parentBlockId: '76fb25cb-0c02-4068-a015-83c81de061a2',
                parentOrder: 0,
                muted: false,
                autoplay: true,
                startAt: 0,
                endAt: 118,
                posterBlockId: null,
                fullsize: true,
                videoId: '1_0-TrainV_1Install',
                videoVariantLanguageId: '529',
                source: 'internal',
                title: null,
                description: null,
                image: null,
                duration: 118,
                objectFit: null,
                video: {
                  __typename: 'Video',
                  id: '1_0-TrainV_1Install',
                  title: [
                    {
                      __typename: 'VideoTitle',
                      value: 'Installing the Jesus Film Media App'
                    }
                  ],
                  image:
                    'https://d1wl257kev7hsz.cloudfront.net/cinematics/lrg_cine_install.jpg',
                  variant: {
                    __typename: 'VideoVariant',
                    id: '1_529-0-TrainV_1Install',
                    hls: 'https://arc.gt/zxqrt'
                  }
                },
                action: null,
                children: []
              }
            ]
          }
        ]
      }
    ]
  },
  position: { x: -200, y: 213 }
}

const typographyNode = {
  id: '7562388a-5dbe-4b10-b14c-c0cad7420f63',
  type: 'StepBlock',
  data: {
    __typename: 'StepBlock',
    id: '7562388a-5dbe-4b10-b14c-c0cad7420f63',
    parentBlockId: null,
    parentOrder: 0,
    locked: false,
    nextBlockId: null,
    children: [
      {
        __typename: 'CardBlock',
        id: '91ba1eb7-89a1-44d6-b579-7a98315d92ad',
        parentBlockId: '7562388a-5dbe-4b10-b14c-c0cad7420f63',
        parentOrder: 0,
        backgroundColor: null,
        coverBlockId: 'f4b922ea-7834-419d-8d7b-79b3ab17ae9d',
        themeMode: null,
        themeName: null,
        fullscreen: false,
        backdropBlur: null,
        children: [
          {
            __typename: 'TypographyBlock',
            id: '1e2b2229-81d2-4e49-aaa5-52bca5ae3d49',
            parentBlockId: '91ba1eb7-89a1-44d6-b579-7a98315d92ad',
            parentOrder: 0,
            align: null,
            color: null,
            content: 'The Journey Is On',
            variant: 'h3',
            children: [],
            settings: {
              __typename: 'TypographyBlockSettings',
              color: null
            }
          },
          {
            __typename: 'TypographyBlock',
            id: 'ad4205e5-cbae-4d36-8e22-b1cb6d0197da',
            parentBlockId: '91ba1eb7-89a1-44d6-b579-7a98315d92ad',
            parentOrder: 1,
            align: null,
            color: null,
            content: '"Go, and lead the people on their way..."',
            variant: 'body1',
            children: [],
            settings: {
              __typename: 'TypographyBlockSettings',
              color: null
            }
          },
          {
            __typename: 'TypographyBlock',
            id: 'a449d2a0-b39e-4f1b-a4f9-10eb950a47d8',
            parentBlockId: '91ba1eb7-89a1-44d6-b579-7a98315d92ad',
            parentOrder: 2,
            align: null,
            color: null,
            content: 'Deuteronomy 10:11',
            variant: 'caption',
            children: [],
            settings: {
              __typename: 'TypographyBlockSettings',
              color: null
            }
          },
          {
            __typename: 'ImageBlock',
            id: 'f4b922ea-7834-419d-8d7b-79b3ab17ae9d',
            parentBlockId: '91ba1eb7-89a1-44d6-b579-7a98315d92ad',
            parentOrder: null,
            src: 'https://images.unsplash.com/photo-1524414287096-c7fb74ab3ba0?w=854&q=50',
            alt: 'two hot air balloons in the sky',
            width: 854,
            height: 567,
            blurhash: 'UgFiJ[59PC=r{@E3XTxWjGngs7NeslWCskRk',
            children: []
          }
        ]
      }
    ],
    steps: [
      {
        __typename: 'StepBlock',
        id: '7562388a-5dbe-4b10-b14c-c0cad7420f63',
        parentBlockId: null,
        parentOrder: 0,
        locked: false,
        nextBlockId: null,
        children: [
          {
            __typename: 'CardBlock',
            id: '91ba1eb7-89a1-44d6-b579-7a98315d92ad',
            parentBlockId: '7562388a-5dbe-4b10-b14c-c0cad7420f63',
            parentOrder: 0,
            backgroundColor: null,
            coverBlockId: 'f4b922ea-7834-419d-8d7b-79b3ab17ae9d',
            themeMode: null,
            themeName: null,
            fullscreen: false,
            backdropBlur: null,
            children: [
              {
                __typename: 'TypographyBlock',
                id: '1e2b2229-81d2-4e49-aaa5-52bca5ae3d49',
                parentBlockId: '91ba1eb7-89a1-44d6-b579-7a98315d92ad',
                parentOrder: 0,
                align: null,
                color: null,
                content: 'The Journey Is On',
                variant: 'h3',
                children: [],
                settings: {
                  __typename: 'TypographyBlockSettings',
                  color: null
                }
              },
              {
                __typename: 'TypographyBlock',
                id: 'ad4205e5-cbae-4d36-8e22-b1cb6d0197da',
                parentBlockId: '91ba1eb7-89a1-44d6-b579-7a98315d92ad',
                parentOrder: 1,
                align: null,
                color: null,
                content: '"Go, and lead the people on their way..."',
                variant: 'body1',
                children: [],
                settings: {
                  __typename: 'TypographyBlockSettings',
                  color: null
                }
              },
              {
                __typename: 'TypographyBlock',
                id: 'a449d2a0-b39e-4f1b-a4f9-10eb950a47d8',
                parentBlockId: '91ba1eb7-89a1-44d6-b579-7a98315d92ad',
                parentOrder: 2,
                align: null,
                color: null,
                content: 'Deuteronomy 10:11',
                variant: 'caption',
                children: [],
                settings: {
                  __typename: 'TypographyBlockSettings',
                  color: null
                }
              },
              {
                __typename: 'ImageBlock',
                id: 'f4b922ea-7834-419d-8d7b-79b3ab17ae9d',
                parentBlockId: '91ba1eb7-89a1-44d6-b579-7a98315d92ad',
                parentOrder: null,
                src: 'https://images.unsplash.com/photo-1524414287096-c7fb74ab3ba0?w=854&q=50',
                alt: 'two hot air balloons in the sky',
                width: 854,
                height: 567,
                blurhash: 'UgFiJ[59PC=r{@E3XTxWjGngs7NeslWCskRk',
                children: []
              }
            ]
          }
        ]
      }
    ]
  },
  position: { x: -200, y: 0 }
}

const textResponseNode = {
  id: 'd9d8295b-8e4d-4b63-bf0c-97661e6341d8',
  type: 'StepBlock',
  data: {
    __typename: 'StepBlock',
    id: 'd9d8295b-8e4d-4b63-bf0c-97661e6341d8',
    parentBlockId: null,
    parentOrder: 6,
    locked: false,
    nextBlockId: null,
    children: [
      {
        __typename: 'CardBlock',
        id: '8cdf466f-589c-498e-b097-2b868214f038',
        parentBlockId: 'd9d8295b-8e4d-4b63-bf0c-97661e6341d8',
        parentOrder: 0,
        backgroundColor: null,
        coverBlockId: null,
        themeMode: 'dark',
        themeName: 'base',
        fullscreen: false,
        backdropBlur: null,
        children: [
          {
            __typename: 'TextResponseBlock',
            id: 'fe591706-9c98-4baa-9a61-073b868f5b66',
            parentBlockId: '270c0860-b412-45ef-baea-917a33bea9c4',
            parentOrder: 0,
            label: 'Your answer here',
            hint: null,
            minRows: null,
            submitLabel: 'Submit',
            submitIconId: '1c2e123f-9cb0-43c2-9744-3acc48814e43',
            action: null,
            children: [
              {
                __typename: 'IconBlock',
                id: '1c2e123f-9cb0-43c2-9744-3acc48814e43',
                parentBlockId: 'fe591706-9c98-4baa-9a61-073b868f5b66',
                parentOrder: null,
                iconName: null,
                iconSize: null,
                iconColor: null,
                children: []
              }
            ]
          }
        ]
      }
    ],
    steps: [
      {
        __typename: 'StepBlock',
        id: 'd9d8295b-8e4d-4b63-bf0c-97661e6341d8',
        parentBlockId: null,
        parentOrder: 4,
        locked: false,
        nextBlockId: '5ffbbc7d-3177-46ac-a327-eb8a68284ddc',
        children: [
          {
            __typename: 'CardBlock',
            id: '270c0860-b412-45ef-baea-917a33bea9c4',
            parentBlockId: '00f4be94-80b3-4c7f-b7b6-866b6eaeee09',
            parentOrder: 0,
            backgroundColor: null,
            coverBlockId: null,
            themeMode: 'dark',
            themeName: 'base',
            fullscreen: false,
            backdropBlur: null,
            children: [
              {
                __typename: 'TextResponseBlock',
                id: 'fe591706-9c98-4baa-9a61-073b868f5b66',
                parentBlockId: '270c0860-b412-45ef-baea-917a33bea9c4',
                parentOrder: 0,
                label: 'Your answer here',
                hint: null,
                minRows: null,
                submitLabel: 'Submit',
                submitIconId: '1c2e123f-9cb0-43c2-9744-3acc48814e43',
                action: null,
                children: [
                  {
                    __typename: 'IconBlock',
                    id: '1c2e123f-9cb0-43c2-9744-3acc48814e43',
                    parentBlockId: 'fe591706-9c98-4baa-9a61-073b868f5b66',
                    parentOrder: null,
                    iconName: null,
                    iconSize: null,
                    iconColor: null,
                    children: []
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  position: { x: -200, y: 213 }
}

const buttonNode = {
  id: 'cafd979f-dc00-49d1-a17a-b1fe040dc55b',
  type: 'StepBlock',
  data: {
    __typename: 'StepBlock',
    id: 'cafd979f-dc00-49d1-a17a-b1fe040dc55b',
    parentBlockId: null,
    parentOrder: 6,
    locked: false,
    nextBlockId: null,
    children: [
      {
        __typename: 'CardBlock',
        id: '2a027e7c-0cf5-4fbf-bf12-14eff3e50771',
        parentBlockId: 'cafd979f-dc00-49d1-a17a-b1fe040dc55b',
        parentOrder: 0,
        backgroundColor: null,
        coverBlockId: null,
        themeMode: 'dark',
        themeName: 'base',
        fullscreen: false,
        backdropBlur: null,
        children: [
          {
            __typename: 'ButtonBlock',
            id: 'ea567b51-8d59-4f9d-851f-43fb79092e09',
            parentBlockId: '2a027e7c-0cf5-4fbf-bf12-14eff3e50771',
            parentOrder: 0,
            label: 'Click me',
            buttonVariant: 'contained',
            buttonColor: 'primary',
            size: 'medium',
            startIconId: 'd8b90504-3221-4002-84c9-ac2da07e4cb8',
            endIconId: 'd2732ef5-c6db-40e4-84cd-a961ed7f9fd8',
            action: null,
            children: [
              {
                __typename: 'IconBlock',
                id: 'd8b90504-3221-4002-84c9-ac2da07e4cb8',
                parentBlockId: 'ea567b51-8d59-4f9d-851f-43fb79092e09',
                parentOrder: null,
                iconName: null,
                iconSize: null,
                iconColor: null,
                children: []
              },
              {
                __typename: 'IconBlock',
                id: 'd2732ef5-c6db-40e4-84cd-a961ed7f9fd8',
                parentBlockId: 'ea567b51-8d59-4f9d-851f-43fb79092e09',
                parentOrder: null,
                iconName: null,
                iconSize: null,
                iconColor: null,
                children: []
              }
            ]
          }
        ]
      }
    ],
    steps: [
      {
        __typename: 'StepBlock',
        id: 'cafd979f-dc00-49d1-a17a-b1fe040dc55b',
        parentBlockId: null,
        parentOrder: 6,
        locked: false,
        nextBlockId: null,
        children: [
          {
            __typename: 'CardBlock',
            id: '2a027e7c-0cf5-4fbf-bf12-14eff3e50771',
            parentBlockId: 'cafd979f-dc00-49d1-a17a-b1fe040dc55b',
            parentOrder: 0,
            backgroundColor: null,
            coverBlockId: null,
            themeMode: 'dark',
            themeName: 'base',
            fullscreen: false,
            backdropBlur: null,
            children: [
              {
                __typename: 'ButtonBlock',
                id: 'ea567b51-8d59-4f9d-851f-43fb79092e09',
                parentBlockId: '2a027e7c-0cf5-4fbf-bf12-14eff3e50771',
                parentOrder: 0,
                label: 'Click me',
                buttonVariant: 'contained',
                buttonColor: 'primary',
                size: 'medium',
                startIconId: 'd8b90504-3221-4002-84c9-ac2da07e4cb8',
                endIconId: 'd2732ef5-c6db-40e4-84cd-a961ed7f9fd8',
                action: null,
                children: [
                  {
                    __typename: 'IconBlock',
                    id: 'd8b90504-3221-4002-84c9-ac2da07e4cb8',
                    parentBlockId: 'ea567b51-8d59-4f9d-851f-43fb79092e09',
                    parentOrder: null,
                    iconName: null,
                    iconSize: null,
                    iconColor: null,
                    children: []
                  },
                  {
                    __typename: 'IconBlock',
                    id: 'd2732ef5-c6db-40e4-84cd-a961ed7f9fd8',
                    parentBlockId: 'ea567b51-8d59-4f9d-851f-43fb79092e09',
                    parentOrder: null,
                    iconName: null,
                    iconSize: null,
                    iconColor: null,
                    children: []
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  position: { x: -200, y: 213 }
}

const signUpNode = {
  id: '26458e5b-4b25-45f0-8550-f82accaa027c',
  type: 'StepBlock',
  data: {
    __typename: 'StepBlock',
    id: '26458e5b-4b25-45f0-8550-f82accaa027c',
    parentBlockId: null,
    parentOrder: 1,
    locked: false,
    nextBlockId: null,
    children: [
      {
        __typename: 'CardBlock',
        id: 'd3623b54-cfd0-48a6-b632-5e07c9aa6d38',
        parentBlockId: '26458e5b-4b25-45f0-8550-f82accaa027c',
        parentOrder: 0,
        backgroundColor: null,
        coverBlockId: null,
        themeMode: 'dark',
        themeName: 'base',
        fullscreen: false,
        backdropBlur: null,
        children: [
          {
            __typename: 'SignUpBlock',
            id: 'cc858273-4a2c-415f-9390-a3394d701d42',
            parentBlockId: 'd3623b54-cfd0-48a6-b632-5e07c9aa6d38',
            parentOrder: 0,
            submitLabel: 'Submit',
            submitIconId: '9ecf034c-032f-43b0-9375-d563a6e80672',
            action: null,
            children: [
              {
                __typename: 'IconBlock',
                id: '9ecf034c-032f-43b0-9375-d563a6e80672',
                parentBlockId: 'cc858273-4a2c-415f-9390-a3394d701d42',
                parentOrder: null,
                iconName: null,
                iconSize: null,
                iconColor: null,
                children: []
              }
            ]
          }
        ]
      }
    ],
    steps: [
      {
        __typename: 'StepBlock',
        id: '26458e5b-4b25-45f0-8550-f82accaa027c',
        parentBlockId: null,
        parentOrder: 1,
        locked: false,
        nextBlockId: null,
        children: [
          {
            __typename: 'CardBlock',
            id: 'd3623b54-cfd0-48a6-b632-5e07c9aa6d38',
            parentBlockId: '26458e5b-4b25-45f0-8550-f82accaa027c',
            parentOrder: 0,
            backgroundColor: null,
            coverBlockId: null,
            themeMode: 'dark',
            themeName: 'base',
            fullscreen: false,
            backdropBlur: null,
            children: [
              {
                __typename: 'SignUpBlock',
                id: 'cc858273-4a2c-415f-9390-a3394d701d42',
                parentBlockId: 'd3623b54-cfd0-48a6-b632-5e07c9aa6d38',
                parentOrder: 0,
                submitLabel: 'Submit',
                submitIconId: '9ecf034c-032f-43b0-9375-d563a6e80672',
                action: null,
                children: [
                  {
                    __typename: 'IconBlock',
                    id: '9ecf034c-032f-43b0-9375-d563a6e80672',
                    parentBlockId: 'cc858273-4a2c-415f-9390-a3394d701d42',
                    parentOrder: null,
                    iconName: null,
                    iconSize: null,
                    iconColor: null,
                    children: []
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  position: { x: -200, y: 213 }
}

const defaultFlowProps = {
  edges: [],
  edgeTypes: {},
  onConnectStart: () => undefined,
  onConnectEnd: () => undefined,
  fitView: true,
  proOptions: { hideAttribution: true }
}

const Template: StoryObj<
  ComponentPropsWithoutRef<typeof StepBlockNode> & { initialState: EditorState }
> = {
  render: ({ initialState, ...args }) => {
    return (
      <MockedProvider>
        <EditorProvider initialState={initialState}>
          <Box sx={{ height: 400, width: 600 }}>
            <ReactFlow {...args}>
              <Background color="#aaa" gap={16} />
            </ReactFlow>
          </Box>
        </EditorProvider>
      </MockedProvider>
    )
  }
}

export const Default = {
  ...Template,
  args: {
    ...defaultFlowProps,
    nodes: [defaultNode],
    nodeTypes: {
      StepBlock: StepBlockNode
    },
    initialState: {
      steps: [...defaultNode.data.steps],
      selectedStep: defaultNode.data.steps[0],
      activeContent: ActiveContent.Canvas
    }
  }
}

export const Video = {
  ...Template,
  args: {
    ...defaultFlowProps,
    nodes: [videoNode],
    nodeTypes: {
      StepBlock: StepBlockNode
    },
    initialState: {
      steps: [...videoNode.data.steps],
      selectedStep: videoNode.data.steps[0],
      activeContent: ActiveContent.Canvas
    }
  }
}

export const TextResponse = {
  ...Template,
  args: {
    ...defaultFlowProps,
    nodes: [textResponseNode],
    nodeTypes: {
      StepBlock: StepBlockNode
    },
    initialState: {
      steps: [...textResponseNode.data.steps],
      selectedStep: textResponseNode.data.steps[0],
      activeContent: ActiveContent.Canvas
    }
  }
}

export const Button = {
  ...Template,
  args: {
    ...defaultFlowProps,
    nodes: [buttonNode],
    nodeTypes: {
      StepBlock: StepBlockNode
    },
    initialState: {
      steps: [...buttonNode.data.steps],
      selectedStep: buttonNode.data.steps[0],
      activeContent: ActiveContent.Canvas
    }
  }
}

export const Typography = {
  ...Template,
  args: {
    ...defaultFlowProps,
    nodes: [typographyNode],
    nodeTypes: {
      StepBlock: StepBlockNode
    },
    initialState: {
      steps: [...typographyNode.data.steps],
      selectedStep: typographyNode.data.steps[0],
      activeContent: ActiveContent.Canvas
    }
  }
}

export const SignUp = {
  ...Template,
  args: {
    ...defaultFlowProps,
    nodes: [signUpNode],
    nodeTypes: {
      StepBlock: StepBlockNode
    },
    initialState: {
      steps: [...signUpNode.data.steps],
      selectedStep: signUpNode.data.steps[0],
      activeContent: ActiveContent.Canvas
    }
  }
}

export const Hover = {
  ...Template,
  args: {
    ...defaultFlowProps,
    nodes: [defaultNode],
    nodeTypes: {
      StepBlock: StepBlockNode
    },
    initialState: {
      steps: [...defaultNode.data.steps],
      selectedStep: defaultNode.data.steps[0],
      activeContent: ActiveContent.Canvas
    }
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement)

    await waitFor(async () => {
      await userEvent.hover(canvas.getAllByTestId('BaseNode')[0])
    })
  }
}

export const Analytics = {
  ...Template,
  args: {
    ...defaultFlowProps,
    nodes: [defaultNode],
    nodeTypes: {
      StepBlock: StepBlockNode
    },
    initialState: {
      steps: [...defaultNode.data.steps],
      selectedStep: defaultNode.data.steps[0],
      activeContent: ActiveContent.Canvas,
      showAnalytics: true
    }
  }
}

export default StepBlockNodeStory
