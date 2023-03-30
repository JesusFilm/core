import { ActiveJourneyEditContent } from '@core/journeys/ui/EditorProvider'
import { Story, Meta } from '@storybook/react'
import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt'
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
      outlined={args.outlined ?? false}
      header={args.header ?? <ThumbUpOffAltIcon />}
      loading={args.loading ?? false}
    />
  )
}

export const Default = Template.bind({})
Default.args = {
  id: 'goals',
  title: 'goals'
}

export const Outlined = Template.bind({})
Outlined.args = {
  outlined: true
}

export const Loading = Template.bind({})
Loading.args = {
  loading: true
}

export default NavigationCardStory as Meta
