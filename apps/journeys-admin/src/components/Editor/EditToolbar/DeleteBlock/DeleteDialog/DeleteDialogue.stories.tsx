import { Story, Meta } from '@storybook/react'
import noop from 'lodash/noop'
import { simpleComponentConfig } from '../../../../../libs/storybook'
import { DeleteDialog } from '.'

const DeleteDialogueStory = {
  ...simpleComponentConfig,
  component: DeleteDialog,
  title: 'Journeys-Admin/Editor/EditToolbar/DeleteBlock/DeleteDialogue'
}

export const Default: Story = () => {
  return <DeleteDialog handleDelete={noop} open={true} handleClose={noop} />
}

export default DeleteDialogueStory as Meta
