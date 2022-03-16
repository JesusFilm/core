import { Story, Meta } from '@storybook/react'
import noop from 'lodash/noop'
import { simpleComponentConfig } from '../../../../../libs/storybook'
import { DeleteDialogue } from '.'

const DeleteDialogueStory = {
  ...simpleComponentConfig,
  component: DeleteDialogue,
  title: 'Journeys-Admin/Editor/EditToolbar/DeleteBlock/DeleteDialogue'
}

export const Default: Story = () => {
  return <DeleteDialogue handleDelete={noop} open={true} handleClose={noop} />
}

export default DeleteDialogueStory as Meta
