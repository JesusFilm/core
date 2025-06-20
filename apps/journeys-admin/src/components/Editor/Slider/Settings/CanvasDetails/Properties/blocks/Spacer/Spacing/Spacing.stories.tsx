import { MockedProvider } from '@apollo/client/testing'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { Meta, StoryObj } from '@storybook/react'
import { ReactNode, useState } from 'react'

import { simpleComponentConfig } from '@core/shared/ui/storybook'

import { Spacing } from '.'

const SpacingStory: Meta<typeof Spacing> = {
  ...simpleComponentConfig,
  component: Spacing,
  title:
    'Journeys-Admin/Editor/Slider/Settings/CanvasDetails/Properties/blocks/Spacer/Spacing'
}

const SpacingComponent = (): ReactNode => {
  const [value, setValue] = useState(200)
  return (
    <Stack>
      <Spacing value={value} setValue={setValue} />
      <Typography>{`${value} pixels`}</Typography>
    </Stack>
  )
}

export const Default: StoryObj<typeof Spacing> = {
  render: () => {
    return (
      <MockedProvider>
        <SpacingComponent />
      </MockedProvider>
    )
  }
}

export default SpacingStory
