import { Meta } from '@storybook/react'

import { journeysAdminConfig } from '../../../libs/storybook'
import { TeamManageDialog } from './TeamManageDialog'

const Demo = {
  ...journeysAdminConfig,
  component: TeamManageDialog,
  title: 'Journeys-Admin/Team/TeamManageDialog'
}

export default Demo as Meta
