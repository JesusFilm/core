import { Meta, StoryObj } from '@storybook/react'
import { ReactNode, useState } from 'react'

import { nexusAdminConfig } from '../../libs/storybook'

import { ViewResourceTableModal } from '.'

const ViewResourceTableModalDemo: Meta<typeof ViewResourceTableModal> = {
  ...nexusAdminConfig,
  component: ViewResourceTableModal,
  title: 'Nexus-Admin/ViewResourceTableModal'
}

const DefaultViewResourceTableModal = (): ReactNode => {
  const [open, setOpen] = useState(true)

  const defaultColumnsVisibility = {
    status: true,
    name: true,
    title: true,
    description: true,
    keywords: true,
    action: true
  }

  const [columnsVisibility, setColumnsVisibility] = useState(
    defaultColumnsVisibility
  )

  const allColumnsVisibility = (): void =>
    setColumnsVisibility({
      status: true,
      name: true,
      title: true,
      description: true,
      keywords: true,
      action: true
    })

  const toggleColumnVisibility = (column: string, value: boolean): void => {
    setColumnsVisibility((prevState) => ({
      ...prevState,
      [column]: value
    }))
  }

  const resetColumnsVisibility = (): void => {
    setColumnsVisibility(defaultColumnsVisibility)
  }

  return (
    <ViewResourceTableModal
      open={open}
      closeModal={() => setOpen(false)}
      columnsVisibility={columnsVisibility}
      toggleColumnVisibility={toggleColumnVisibility}
      allColumnsVisibility={allColumnsVisibility}
      resetColumnsVisibility={resetColumnsVisibility}
    />
  )
}

export const Default: StoryObj<typeof ViewResourceTableModal> = {
  render: () => <DefaultViewResourceTableModal />
}

export default ViewResourceTableModalDemo
