import Stack from '@mui/material/Stack'
import { Meta, StoryObj } from '@storybook/react'

import type { TreeBlock } from '@core/journeys/ui/block'

import { GetJourney_journey_blocks_CardBlock as CardBlock } from '../../../../../../../__generated__/GetJourney'
import {
  ThemeMode,
  ThemeName
} from '../../../../../../../__generated__/globalTypes'
import { journeysAdminConfig } from '../../../../../../libs/storybook'

import { Card } from '.'

const CardStory: Meta<typeof Card> = {
  ...journeysAdminConfig,
  component: Card,
  title: 'Journeys-Admin/Editor/ControlPanel/Attributes/Card'
}

export const Default: StoryObj<typeof Card> = {
  render: () => {
    const block: TreeBlock<CardBlock> = {
      id: 'card1.id',
      __typename: 'CardBlock',
      parentBlockId: 'step1.id',
      coverBlockId: null,
      parentOrder: 0,
      backgroundColor: null,
      themeMode: ThemeMode.light,
      themeName: ThemeName.base,
      fullscreen: false,
      children: []
    }

    return (
      <Stack
        direction="row"
        spacing={4}
        sx={{
          overflowX: 'auto',
          py: 5,
          px: 6
        }}
      >
        <Card {...block} />
      </Stack>
    )
  }
}

export const Populated: StoryObj<typeof Card> = {
  render: () => {
    const block: TreeBlock<CardBlock> = {
      id: 'card1.id',
      __typename: 'CardBlock',
      parentBlockId: 'step1.id',
      coverBlockId: 'image1.id',
      parentOrder: 0,
      backgroundColor: '#00ccff',
      themeMode: ThemeMode.light,
      themeName: ThemeName.base,
      fullscreen: true,
      children: [
        {
          __typename: 'ImageBlock',
          id: 'image1.id',
          src: 'https://i.imgur.com/07iLnvN.jpg',
          alt: 'random image from unsplash',
          width: 1920,
          height: 1080,
          parentBlockId: 'card1.id',
          parentOrder: 0,
          blurhash: 'L9AS}j^-0dVC4Tq[=~PATeXSV?aL',
          children: []
        }
      ]
    }

    return (
      <Stack
        direction="row"
        spacing={4}
        sx={{
          overflowX: 'auto',
          py: 5,
          px: 6
        }}
      >
        <Card {...block} />
      </Stack>
    )
  }
}

export default CardStory
