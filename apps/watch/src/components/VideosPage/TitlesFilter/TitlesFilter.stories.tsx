import { Meta, Story } from '@storybook/react'
import { noop } from 'lodash'
import { screen, userEvent } from '@storybook/testing-library'
import { watchConfig } from '../../../libs/storybook'
import { TitlesFilter } from '.'

const TitlesFilterStory = {
  ...watchConfig,
  component: TitlesFilter,
  title: 'Watch/VideosPage/TitlesFilter'
}

const titles = [
  {
    id: '529',
    title: [{ value: 'JESUS' }],
    label: 'segment'
  },
  {
    id: '529',
    title: [{ value: 'Magdelena' }],
    label: 'segment'
  }
]

const Template: Story = () => {
  return <TitlesFilter onChange={noop} loading={false} titles={titles} />
}

export const Default = Template.bind({})
Default.play = () => {
  const button = screen.getAllByRole('button', { name: 'Open' })[0]
  userEvent.click(button)
}

export default TitlesFilterStory as Meta
