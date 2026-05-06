import Box from '@mui/material/Box'
import { Meta, StoryObj } from '@storybook/nextjs'
import { ReactElement, useState } from 'react'

import { journeysAdminConfig } from '@core/shared/ui/storybook'

import { HorizontalSelect } from '.'

const HorizontalSelectStory: Meta<typeof HorizontalSelect> = {
  ...journeysAdminConfig,
  component: HorizontalSelect,
  title: 'Journeys-Admin/HorizontalSelect',
  parameters: {
    ...journeysAdminConfig.parameters,
    layout: 'fullscreen'
  }
}

const HorizontalSelectComponent = (): ReactElement => {
  const [id, setId] = useState<string>('1')
  return (
    <HorizontalSelect onChange={setId} id={id}>
      <Box
        id="0"
        sx={{
          backgroundColor: '#FFF',
          m: 0.5,
          width: 60,
          height: 60,
          borderRadius: 1,
          outline: '1px solid rgba(0, 0, 0, 0.2)',
          outlineOffset: '-1px'
        }}
      />
      <Box
        id="1"
        sx={{
          backgroundColor: '#DCDDE5',
          m: 0.5,
          width: 60,
          height: 60,
          borderRadius: 1,
          outline: '1px solid rgba(0, 0, 0, 0.2)',
          outlineOffset: '-1px'
        }}
      />
      <Box
        id="2"
        sx={{
          backgroundColor: '#50BE50',
          m: 0.5,
          width: 60,
          height: 60,
          borderRadius: 1,
          outline: '1px solid rgba(0, 0, 0, 0.2)',
          outlineOffset: '-1px'
        }}
      />
      <Box
        id="3"
        sx={{
          backgroundColor: '#30313C',
          m: 0.5,
          width: 60,
          height: 60,
          borderRadius: 1,
          outline: '1px solid rgba(0, 0, 0, 0.2)',
          outlineOffset: '-1px'
        }}
      />
      <Box
        id="4"
        sx={{
          backgroundColor: '#26262D',
          m: 0.5,
          width: 60,
          height: 60,
          borderRadius: 1,
          outline: '1px solid rgba(0, 0, 0, 0.2)',
          outlineOffset: '-1px'
        }}
      />
    </HorizontalSelect>
  )
}

const Template: StoryObj<typeof HorizontalSelect> = {
  render: () => <HorizontalSelectComponent />
}

export const Default = { ...Template }

export default HorizontalSelectStory
