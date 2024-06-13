import { jest } from '@storybook/jest'
import { Meta, StoryObj } from '@storybook/react'
import { ComponentProps } from 'react'

import { TreeBlock } from '@core/journeys/ui/block'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { journeysAdminConfig } from '@core/shared/ui/storybook'

import { BlockFields_TypographyBlock as TypographyBlock } from '../../../../../../../../../__generated__/BlockFields'
import {
  TypographyAlign,
  TypographyColor,
  TypographyVariant
} from '../../../../../../../../../__generated__/globalTypes'
import { Drawer } from '../../../../Drawer'

import { Typography } from './Typography'

const Demo: Meta<typeof Typography> = {
  ...journeysAdminConfig,
  component: Typography,
  title:
    'Journeys-Admin/Editor/Slider/Settings/CanvasDetails/Properties/blocks/Typography',
  // do not remove these parameters for this story, see: https://github.com/storybookjs/storybook/issues/17025
  parameters: {
    docs: {
      source: { type: 'code' }
    }
  }
}

const onClose = jest.fn()

const block: TreeBlock<TypographyBlock> = {
  __typename: 'TypographyBlock',
  id: 'typographyBlock.id',
  parentBlockId: null,
  parentOrder: null,
  align: null,
  color: null,
  content: '',
  variant: null,
  children: []
}

const Template: StoryObj<ComponentProps<typeof Typography>> = {
  render: ({ ...args }) => {
    return (
      <EditorProvider initialState={{ selectedBlock: { ...args } }}>
        <Drawer title="Feedback Properties" onClose={onClose}>
          <Typography {...args} />
        </Drawer>
      </EditorProvider>
    )
  }
}

export const Default = {
  ...Template,
  args: {
    ...block
  }
}

export const Filled = {
  ...Template,
  args: {
    ...block,
    __typename: 'TypographyBlock',
    id: 'typographyBlock.id',
    parentBlockId: null,
    parentOrder: null,
    align: TypographyAlign.right,
    color: TypographyColor.error,
    content: 'Text goes here',
    variant: TypographyVariant.overline,
    children: []
  }
}

export default Demo
