import Box from '@mui/material/Box'
import { Meta, StoryObj } from '@storybook/react'

import { ActiveJourneyEditContent } from '@core/journeys/ui/EditorProvider'
import TargetIcon from '@core/shared/ui/icons/Target'
import ThumbsUpIcon from '@core/shared/ui/icons/ThumbsUp'

import { simpleComponentConfig } from '../../../libs/storybook'

import { NavigationCard } from '.'

const NavigationCardStory: Meta<typeof NavigationCard> = {
  ...simpleComponentConfig,
  component: NavigationCard,
  title: 'Journeys-Admin/CardPreview/NavigationCard'
}

const Template: StoryObj<typeof NavigationCard> = {
  render: ({ ...args }) => {
    return (
      <NavigationCard
        id={args.id}
        title={args.title}
        destination={ActiveJourneyEditContent.Canvas}
        header={args.header ?? <ThumbsUpIcon />}
        loading={args.loading ?? false}
      />
    )
  }
}

export const Default = {
  ...Template,
  args: {
    id: 'goals',
    title: 'goals'
  }
}

export const Loading = {
  ...Template,
  args: {
    loading: true
  }
}

export const Goals = {
  ...Template,
  args: {
    id: 'goals',
    title: 'Goals',
    header: (
      <Box
        bgcolor={(theme) => theme.palette.background.paper}
        borderRadius={1}
        width={72}
        height={72}
        display="flex"
        justifyContent="center"
        alignItems="center"
      >
        <TargetIcon color="error" />
      </Box>
    )
  }
}

export default NavigationCardStory
