import { Meta, StoryObj } from '@storybook/react'
import { ComponentPropsWithoutRef } from 'react'

import { videosAdminConfig } from '../../../../../../../../libs/storybookConfig'
import { useAdminVideoMock } from '../../../../../../../../libs/useAdminVideo/useAdminVideo.mock'

import { EditionCard } from './EditionCard'

const noop = () => undefined

const mockEdition =
  useAdminVideoMock['result']?.['data']?.['adminVideo'].videoEditions[0]

type StoryArgs = ComponentPropsWithoutRef<typeof EditionCard>

const meta = {
  ...videosAdminConfig,
  title: 'Videos-Admin/VideoView/Editions/EditionCard',
  component: EditionCard,
  parameters: {
    tags: ['!autodocs']
  }
} satisfies Meta<StoryArgs>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    edition: mockEdition,
    onClick: noop,
    actions: {
      view: noop,
      edit: noop,
      delete: noop
    }
  }
}
