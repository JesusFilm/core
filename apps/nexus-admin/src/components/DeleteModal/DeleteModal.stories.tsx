import { Meta, StoryObj } from '@storybook/react'
import { ReactNode, useState } from 'react'

import { nexusAdminConfig } from '../../libs/storybook'

import { DeleteModal } from '.'

const DeleteModalDemo: Meta<typeof DeleteModal> = {
  ...nexusAdminConfig,
  component: DeleteModal,
  title: 'Nexus-Admin/DeleteModal'
}

const DefaultDeleteModal = (): ReactNode => {
  const [open, setOpen] = useState(true)

  return (
    <DeleteModal
      open={open}
      content="Are you sure you want to delete this?"
      onClose={() => setOpen(false)}
      onDelete={() => setOpen(false)}
    />
  )
}

export const Default: StoryObj<typeof DeleteModal> = {
  render: () => <DefaultDeleteModal />
}

export default DeleteModalDemo
