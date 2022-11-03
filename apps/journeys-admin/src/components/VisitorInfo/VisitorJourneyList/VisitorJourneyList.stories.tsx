import { Meta, Story } from '@storybook/react'
import { MockedProvider } from '@apollo/client/testing'
import { ComponentProps } from 'react'
import { simpleComponentConfig } from '../../../libs/storybook'
import { VisitorInfoProvider } from '../VisitorInfoProvider'
import { getVisitorEventsMock } from './VisitorJourneyListData'
import { VisitorJourneyList } from '.'

const VisitorJourneyListDemo = {
  ...simpleComponentConfig,
  component: VisitorJourneyList,
  title: 'Journeys-Admin/VisitorInfo/VisitorJourneyList'
}

const Template: Story<ComponentProps<typeof VisitorJourneyList>> = ({
  ...args
}) => (
  <MockedProvider mocks={[getVisitorEventsMock]}>
    <VisitorInfoProvider>
      <VisitorJourneyList {...args} />
    </VisitorInfoProvider>
  </MockedProvider>
)

export const Default = Template.bind({})
Default.args = {
  id: 'visitorId'
}

export default VisitorJourneyListDemo as Meta
