import { Meta, StoryObj } from '@storybook/react'
import { userEvent, within } from '@storybook/testing-library';
import { ComponentProps } from 'react'

import { GoalType } from '@core/journeys/ui/Button/utils/getLinkActionGoal/getLinkActionGoal'

import { journeysAdminConfig } from '../../../../../../../libs/storybook'

import { GoalsListItem } from './GoalsListItem'


const GoalsListItemStory: Meta<typeof GoalsListItem> = {
  ...journeysAdminConfig,
  component: GoalsListItem,
  title: 'Journeys-Admin/Editor/Slider/Content/Goals/GoalsList/GoalsListItem'
}

type Story = StoryObj<ComponentProps<typeof GoalsListItem> >

const Template: Story = {
  render: (args) => (
    <GoalsListItem goal={args.goal}  />
  )
}

export const Website = {
  ...Template,
  args: {
    goal : 
      {
        url: 'https://www.google.com/',
        count: 2,
        goalType: GoalType.Website
      }
    
  }
}

export const Bible = {
  ...Template,
  args: {
    goal : 
      {
        url: 'https://www.biblegateway.com/versions/',
        count: 1,
        goalType: GoalType.Bible
      }
    
  }
}

export const Chat = {
  ...Template,
  args: {
    goal : 
      {
        url: 'https://www.messenger.com/t/',
        count: 1,
        goalType: GoalType.Chat
      }
    
  }
}
 
 export const Selected = {
  ...Template,
  args: {
    
     goal: {
       url: 'https://www.ClickedSelected.com/',
       count: 1,
       goalType: GoalType.Chat,
     },
      
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByText('https://www.ClickedSelected.com/'));
 },
 };
export default GoalsListItemStory