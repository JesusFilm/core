import { Meta, Story } from '@storybook/react'
import Stack from '@mui/material/Stack'
import { ComponentProps } from 'react'
import Typography from '@mui/material/Typography'
// import CircularProgress from '@mui/material/CircularProgress'
import IconButton from '@mui/material/IconButton'
import { simpleComponentConfig } from '../../libs/simpleComponentConfig'
import { iconNames } from './icons'
import { CustomIcon } from '.'

const CustomIconsDemo = {
  ...simpleComponentConfig,
  component: CustomIcon,
  title: 'Shared-ui/CustomIcon',
  parameters: {
    ...simpleComponentConfig.parameters,
    chromatic: {
      ...simpleComponentConfig.parameters?.chromatic,
      viewports: [800]
    }
  }
}

const Colors = [
  'primary',
  'secondary',
  'info',
  'warning',
  'success',
  'action',
  'disabled'
] as const

type Color = (typeof Colors)[number]

const Template: Story<ComponentProps<typeof CustomIcon>> = () => {
  return (
    <>
      <Stack
        direction="row"
        gap={10}
        sx={{ pb: 2, width: '584px' }}
        justifyContent="flex-end"
      >
        <Stack direction="row" gap={4} alignItems="center">
          <Typography variant="caption">small</Typography>
          <Typography variant="caption">default</Typography>
          <Typography variant="caption" sx={{ mr: 3 }}>
            large
          </Typography>
          <Typography variant="caption">custom</Typography>
        </Stack>
        <Stack direction="row" gap={1.5} alignItems="center">
          {[
            'primary',
            'secondary',
            'info',
            'warning',
            'success',
            'action',
            'disabled'
          ].map((color) => (
            <Typography
              variant="caption"
              color={`${
                color === 'action ' || color === 'disabled'
                  ? `text.${color}`
                  : `${color}.main`
              }`}
              fontSize="8px"
            >
              {color}
            </Typography>
          ))}
        </Stack>
      </Stack>

      {[...iconNames].slice(1).map((name) => (
        <Stack direction="row" gap={10}>
          <Stack
            direction="row"
            gap={7}
            justifyContent="flex-end"
            alignItems="center"
            sx={{ pb: 2, width: '320px' }}
          >
            <Typography variant="body2">
              {<CustomIcon name={name} /> != null ? name : null}
            </Typography>
            {/* Use to test loading state locally */}
            {/* <CircularProgress size="16px" /> */}
            <CustomIcon name={name} fontSize="small" />
            <IconButton>
              <CustomIcon name={name} />
            </IconButton>
            <CustomIcon name={name} fontSize="large" />
            <CustomIcon name={name} sx={{ fontSize: '48px', ml: -1 }} />
          </Stack>
          <Stack direction="row" gap={2} alignItems="center">
            {[
              'primary',
              'secondary',
              'info',
              'warning',
              'success',
              'action',
              'disabled'
            ].map((color) => (
              <CustomIcon name={name} color={color as Color} />
            ))}
          </Stack>
        </Stack>
      ))}
    </>
  )
}

export const Default = Template.bind({})

export default CustomIconsDemo as Meta
