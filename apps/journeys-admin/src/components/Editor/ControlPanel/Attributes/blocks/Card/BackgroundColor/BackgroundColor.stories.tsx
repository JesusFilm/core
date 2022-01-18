import { Story, Meta } from '@storybook/react'
import { TreeBlock } from '@core/journeys/ui'
import Stack from '@mui/material/Stack'
import { GetJourneyForEdit_journey_blocks_CardBlock as CardBlock } from '../../../../../../../../__generated__/GetJourneyForEdit'
import { journeysAdminConfig } from '../../../../../../../libs/storybook'
import { BackgroundColor } from '.'

const BackgroundColorStory = {
  ...journeysAdminConfig,
  component: BackgroundColor,
  title: 'Journeys-Admin/Editor/ControlPanel/Attributes/Card/BackgroundColor'
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
      <BackgroundColor {...block} />
    </Stack>
  )
}

export const Colored: Story = () => {
  const block: TreeBlock<CardBlock> = {
    id: 'card1.id',
    __typename: 'CardBlock',
    journeyId: 'journey1.id',
    parentBlockId: 'step1.id',
    coverBlockId: null,
    backgroundColor: '#DCDDE5',
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
      <BackgroundColor {...block} />
    </Stack>
  )
}

export default BackgroundColorStory as Meta
