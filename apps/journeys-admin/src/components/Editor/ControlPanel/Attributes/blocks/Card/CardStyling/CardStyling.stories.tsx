import { Story, Meta } from '@storybook/react'
import { TreeBlock } from '@core/journeys/ui'
import Stack from '@mui/material/Stack'
import { GetJourneyForEdit_journey_blocks_CardBlock as CardBlock } from '../../../../../../../../__generated__/GetJourneyForEdit'
import { journeysAdminConfig } from '../../../../../../../libs/storybook'
import { ThemeMode } from '../../../../../../../../__generated__/globalTypes'
import { CardStyling } from '.'

const CardStylingStory = {
  ...journeysAdminConfig,
  component: CardStyling,
  title: 'Journeys-Admin/Editor/ControlPanel/Attributes/Card/CardStyling'
}

export const Default: Story = () => {
  const block: TreeBlock<CardBlock> = {
    id: 'card1.id',
    __typename: 'CardBlock',
    journeyId: 'journey1.id',
    parentBlockId: 'step1.id',
    coverBlockId: null,
    backgroundColor: null,
    themeMode: null,
    themeName: null,
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
      <CardStyling {...block} />
    </Stack>
  )
}

export const Light: Story = () => {
  const block: TreeBlock<CardBlock> = {
    id: 'card1.id',
    __typename: 'CardBlock',
    journeyId: 'journey1.id',
    parentBlockId: 'step1.id',
    coverBlockId: null,
    backgroundColor: null,
    themeMode: ThemeMode.light,
    themeName: null,
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
      <CardStyling {...block} />
    </Stack>
  )
}

export const Dark: Story = () => {
  const block: TreeBlock<CardBlock> = {
    id: 'card1.id',
    __typename: 'CardBlock',
    journeyId: 'journey1.id',
    parentBlockId: 'step1.id',
    coverBlockId: null,
    backgroundColor: null,
    themeMode: ThemeMode.dark,
    themeName: null,
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
      <CardStyling {...block} />
    </Stack>
  )
}

export default CardStylingStory as Meta
