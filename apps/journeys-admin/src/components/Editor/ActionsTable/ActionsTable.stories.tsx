import { Meta, Story } from '@storybook/react'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import {
  ButtonColor,
  ButtonSize,
  ButtonVariant
} from '../../../../__generated__/globalTypes'
import { journeysAdminConfig } from '../../../libs/storybook'
import { journey } from '../ActionDetails/data'

import { ActionsTable } from '.'

const ActionsTableStory = {
  ...journeysAdminConfig,
  component: ActionsTable,
  title: 'Journeys-Admin/Editor/ActionsTable'
}

const Template: Story = (args) => (
  <JourneyProvider value={{ journey: args.journey, variant: 'admin' }}>
    <ActionsTable />
  </JourneyProvider>
)

export const Default = Template.bind({})
Default.args = {
  journey: {
    ...journey,
    blocks: [
      // step 1
      {
        __typename: 'ImageBlock',
        id: 'image1.id',
        parentBlockId: 'card1.id',
        parentOrder: null,
        src: 'https://images.unsplash.com/photo-1558704164-ab7a0016c1f3?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
        alt: 'photo-1522911715181-6ce196f07c76',
        width: 2766,
        height: 3457,
        blurhash: 'LXJGyfWCEgs:~VWVofoet,jZ$%oe'
      },
      {
        __typename: 'CardBlock',
        id: 'card1.id',
        parentBlockId: 'step1.id',
        parentOrder: 0,
        backgroundColor: null,
        coverBlockId: 'image1.id',
        themeMode: null,
        themeName: null,
        fullscreen: false
      },
      {
        __typename: 'ButtonBlock',
        id: 'button1.id',
        parentBlockId: 'card1.id',
        parentOrder: 0,
        label: 'Google link',
        buttonVariant: ButtonVariant.contained,
        buttonColor: ButtonColor.primary,
        size: ButtonSize.medium,
        startIconId: null,
        endIconId: null,
        action: {
          __typename: 'LinkAction',
          parentBlockId: 'button1.id',
          gtmEventName: null,
          url: 'https://www.google.com/'
        }
      },
      {
        __typename: 'StepBlock',
        id: 'step1.id',
        parentBlockId: null,
        parentOrder: 0,
        locked: false,
        nextBlockId: null
      },
      // step 2
      {
        __typename: 'ImageBlock',
        id: 'image2.id',
        parentBlockId: 'card2.id',
        parentOrder: null,
        src: 'https://images.unsplash.com/photo-1522911715181-6ce196f07c76?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=Mnw0MDYwNDN8MHwxfGNvbGxlY3Rpb258MTF8NUVnMmxYTFdfYTR8fHx8fDJ8fDE2NzgzMzIzMDg&ixlib=rb-4.0.3&q=80&w=1080',
        alt: 'photo-1522911715181-6ce196f07c76',
        width: 2766,
        height: 3457,
        blurhash: 'LXJGyfWCEgs:~VWVofoet,jZ$%oe'
      },
      {
        __typename: 'CardBlock',
        id: 'card2.id',
        parentBlockId: 'step2.id',
        parentOrder: 0,
        backgroundColor: null,
        coverBlockId: 'image2.id',
        themeMode: null,
        themeName: null,
        fullscreen: false
      },
      {
        __typename: 'ButtonBlock',
        id: 'button2.id',
        parentBlockId: 'card2.id',
        parentOrder: 0,
        label: 'Google link',
        buttonVariant: ButtonVariant.contained,
        buttonColor: ButtonColor.primary,
        size: ButtonSize.medium,
        startIconId: 'null',
        endIconId: 'null',
        action: {
          __typename: 'LinkAction',
          parentBlockId: 'button2.id',
          gtmEventName: null,
          url: 'https://www.messenger.com/t/100001241852817/'
        }
      },
      // step3
      {
        __typename: 'StepBlock',
        id: 'step3.id',
        parentBlockId: null,
        parentOrder: 0,
        locked: false,
        nextBlockId: null
      },
      {
        __typename: 'ImageBlock',
        id: 'image3.id',
        parentBlockId: 'card3.id',
        parentOrder: null,
        src: 'https://images.unsplash.com/photo-1522911715181-6ce196f07c76?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=Mnw0MDYwNDN8MHwxfGNvbGxlY3Rpb258MTF8NUVnMmxYTFdfYTR8fHx8fDJ8fDE2NzgzMzIzMDg&ixlib=rb-4.0.3&q=80&w=1080',
        alt: 'photo-1522911715181-6ce196f07c76',
        width: 2766,
        height: 3457,
        blurhash: 'LXJGyfWCEgs:~VWVofoet,jZ$%oe'
      },
      {
        __typename: 'CardBlock',
        id: 'card3.id',
        parentBlockId: 'step3.id',
        parentOrder: 0,
        backgroundColor: null,
        coverBlockId: 'image3.id',
        themeMode: null,
        themeName: null,
        fullscreen: false
      },
      {
        __typename: 'ButtonBlock',
        id: 'button3.id',
        parentBlockId: 'card3.id',
        parentOrder: 0,
        label: 'Google link',
        buttonVariant: ButtonVariant.contained,
        buttonColor: ButtonColor.primary,
        size: ButtonSize.medium,
        startIconId: 'null',
        endIconId: 'null',
        action: {
          __typename: 'LinkAction',
          parentBlockId: 'button3.id',
          gtmEventName: null,
          url: 'https://www.biblegateway.com/versions/Arabic-Bible-Easy-to-Read-Version-ERV-AR/'
        }
      },
      {
        __typename: 'StepBlock',
        id: 'step3.id',
        parentBlockId: null,
        parentOrder: 0,
        locked: false,
        nextBlockId: null
      }
    ]
  }
}

export const Placeholder = Template.bind({})
Placeholder.args = {
  journey: {
    ...journey,
    blocks: []
  }
}

export default ActionsTableStory as Meta
