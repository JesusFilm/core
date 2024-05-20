import { Meta, StoryObj } from '@storybook/react'
import { ReactNode, useState } from 'react'

import { nexusAdminConfig } from '../../libs/storybook'

import { CreateChannelModal } from '.'

const CreateChannelModalDemo: Meta<typeof CreateChannelModal> = {
  ...nexusAdminConfig,
  component: CreateChannelModal,
  title: 'Nexus-Admin/CreateChannelModal'
}

const DefaultCreateChannelModal = (): ReactNode => {
  const [open, setOpen] = useState(true)

  return (
    <CreateChannelModal
      open={open}
      onClose={() => setOpen(false)}
      onCreate={(data) => console.log(data)}
    />
  )
}

export const Default: StoryObj<typeof CreateChannelModal> = {
  render: () => <DefaultCreateChannelModal />
}

export default CreateChannelModalDemo
