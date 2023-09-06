import Box from '@mui/material/Box'
import { Meta, Story } from '@storybook/react'

import { ActiveJourneyEditContent } from '@core/journeys/ui/EditorProvider'
import Target from '@core/shared/ui/icons/Target'
import ThumbsUp from '@core/shared/ui/icons/ThumbsUp'

import { simpleComponentConfig } from '../../../libs/storybook'

import { NavigationCard } from '.'

const NavigationCardStory = {
  ...simpleComponentConfig,
  component: NavigationCard,
  title: 'Journeys-Admin/CardPreview/NavigationCard'
}

const Template: Story = ({ ...args }) => {
  return (
    <NavigationCard
      id={args.id}
      title={args.title}
      destination={ActiveJourneyEditContent.Canvas}
      header={args.header ?? <ThumbsUp />}
      loading={args.loading ?? false}
    />
  )
}

export const Default = Template.bind({})
Default.args = {
  id: 'goals',
  title: 'goals'
}

export const Loading = Template.bind({})
Loading.args = {
  loading: true
}

export const Goals = Template.bind({})
Goals.args = {
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
      <Target color="error" />
    </Box>
  )
}

export default NavigationCardStory as Meta
