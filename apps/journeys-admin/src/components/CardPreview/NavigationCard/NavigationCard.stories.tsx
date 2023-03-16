import { ActiveJourneyEditContent } from '@core/journeys/ui/EditorProvider'
import { Story, Meta } from '@storybook/react'
import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt'
import Image from 'next/image'
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
      title="Social Media"
      destination={ActiveJourneyEditContent.Canvas}
      onSelect={() => ({})}
      outlined={args.outlined ?? false}
      header={args.header ?? <ThumbUpOffAltIcon />}
      loading={args.loading ?? false}
    />
  )
}

export const Default = Template.bind({})

export const Outlined = Template.bind({})
Outlined.args = {
  outlined: true
}

export const WithImage = Template.bind({})
WithImage.args = {
  header: (
    <Image
      src="https://d1wl257kev7hsz.cloudfront.net/cinematics/2_0-FallingPlates.mobileCinematicHigh.jpg"
      alt="https://d1wl257kev7hsz.cloudfront.net/cinematics/2_0-FallingPlates.mobileCinematicHigh.jpg"
      width={72}
      height={72}
      objectFit="cover"
    />
  )
}

export const Loading = Template.bind({})
Loading.args = {
  loading: true
}
export default NavigationCardStory as Meta
