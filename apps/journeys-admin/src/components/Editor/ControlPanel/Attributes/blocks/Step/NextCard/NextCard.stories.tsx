import { Story, Meta } from '@storybook/react'
import { EditorProvider, TreeBlock } from '@core/journeys/ui'
import { MockedProvider } from '@apollo/client/testing'
import { Drawer } from '../../../../../Drawer'
import { journeysAdminConfig } from '../../../../../../../libs/storybook'
import { GetJourney_journey_blocks_StepBlock as StepBlock } from '../../../../../../../../__generated__/GetJourney'
import { NextCard } from '.'

const NextCardStory = {
  ...journeysAdminConfig,
  title: 'Journeys-Admin/Editor/ControlPanel/Attributes/Step/NextCard',
  component: NextCard
}

export const Default: Story = () => {
  const selectedBlock: TreeBlock<StepBlock> = {
    id: 'step1.id',
    __typename: 'StepBlock',
    parentBlockId: null,
    nextBlockId: null,
    parentOrder: 0,
    locked: false,
    children: []
  }
  return (
    <MockedProvider>
      <EditorProvider
        initialState={{
          selectedBlock,
          drawerChildren: <NextCard id={selectedBlock.id} />,
          drawerTitle: 'Next Card Properties',
          drawerMobileOpen: true
        }}
      >
        <Drawer />
      </EditorProvider>
    </MockedProvider>
  )
}

export default NextCardStory as Meta
