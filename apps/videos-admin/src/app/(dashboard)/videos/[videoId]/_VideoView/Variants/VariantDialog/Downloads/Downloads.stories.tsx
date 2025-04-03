import type { Meta, StoryObj } from '@storybook/react'
import type { ComponentProps } from 'react'

import { videosAdminConfig } from '../../../../../../../../libs/storybookConfig'
import { GetAdminVideoVariant_Downloads as VariantDownloads } from '../../../../../../../../libs/useAdminVideo/useAdminVideo'
import { useAdminVideoMock } from '../../../../../../../../libs/useAdminVideo/useAdminVideo.mock'

import { Downloads } from './Downloads'

const meta: Meta<typeof Downloads> = {
  ...videosAdminConfig,
  component: Downloads,
  title: 'Videos-Admin/Variants/VariantCard/VariantDialog/Downloads',
  parameters: {
    tags: ['!autodocs']
  }
}

const mockVariantDownloads: VariantDownloads =
  useAdminVideoMock['result']?.['data']?.['adminVideo']?.['variants']?.[0]?.[
    'downloads'
  ]

type Story = StoryObj<ComponentProps<typeof Downloads>>

const Template: Story = {
  render: ({ downloads }) => (
    
      <Downloads
        downloads={downloads}
        videoVariantId="variant-id"
        languageId="529"
      />
    
  )
}

export const Default: Story = {
  ...Template,
  args: {
    downloads: mockVariantDownloads
  }
}

export const NoDownloads: Story = {
  ...Template,
  args: {
    downloads: []
  }
}

export default meta
