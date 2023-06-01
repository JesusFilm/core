import { Meta, Story } from '@storybook/react'
import Stack from '@mui/material/Stack'
import { ComponentProps } from 'react'
import Typography from '@mui/material/Typography'
// import CircularProgress from '@mui/material/CircularProgress'
import { simpleComponentConfig } from '../../libs/simpleComponentConfig'
import { Icons } from './Icons'

const iconNames = [
  'AddSquare2',
  'AddSquare4',
  'AlertCircle',
  'AlignCenter',
  'AlignJustify',
  'AlignLeft',
  'AlignRight',
  'ArrowDownContained1',
  'ArrowExpand1',
  'ArrowExpand2',
  'ArrowLeftContained1',
  'ArrowLeftSm',
  'ArrowLeft',
  'ArrowRefresh6',
  'ArrowRightContained1',
  'ArrowRightSm',
  'ArrowRight',
  'ArrowRotateLeft1',
  'ArrowRotateRight2',
  'ArrowUpContained1',
  'ArrowUpSm',
  'ArrowUp',
  'Attatchment1',
  'Bag5',
  'BarGroup3',
  'Bell2',
  'Book',
  'Calendar1',
  'CheckBroken',
  'CheckContained',
  'CheckSquareBroken',
  'CheckSquareContained',
  'Check',
  'ChevronDown',
  'ChevronLeft',
  'ChevronRight',
  'ChevronUp',
  'Circle',
  'ColorPicker',
  'Colors1',
  'Colors2',
  'Computer',
  'CopyLeft',
  'CopyRight',
  'Crop1',
  'DownArrowSm',
  'DownArrow',
  'Download2',
  'DuplicateCard',
  'Edit2',
  'Email',
  'Embed',
  'Expand2',
  'Expand',
  'EyeClosed',
  'EyeOpen',
  'Favourite',
  'Flame',
  'Globe1',
  'Globe2',
  'Globe3',
  'Globe',
  'Hash1',
  'Hash2',
  'HelpCircleContained',
  'HelpSquareContained',
  'Home4',
  'Image3',
  'InformationCircleContained',
  'InformationSquareContained',
  'Journey',
  'Key1',
  'Key2',
  'Laptop1',
  'Layers4',
  'LayoutScale',
  'Lightning2',
  'LightningCircleContained',
  'LinkAngled',
  'LinkBroken',
  'LinkExternal',
  'Link',
  'Lock1',
  'LockOpen1',
  'Mail1',
  'Mail2',
  'Marker1',
  'Marker2',
  'Maximise1',
  'Maximise2',
  'Menu1',
  'MessageChat1',
  'MessageText1',
  'Minimise1',
  'Minimise2',
  'MinusCircleContained',
  'More',
  'Palette',
  'Passport',
  'Pause1',
  'Pause2',
  'Pause3',
  'Play2',
  'Play3',
  'Plus1',
  'Plus2',
  'Plus3',
  'Search1',
  'Search2',
  'Send1',
  'Share',
  'SpaceHeight',
  'SpaceHorizontal',
  'SpaceVertical',
  'Square',
  'Star2',
  'Target',
  'Target2',
  'Trash2',
  'ThumbsUp',
  'UserProfile2',
  'UsersProfiles2',
  'Web',
  'X1',
  'X2',
  'X3',
  'XCircleContained',
  'XSquareContained'
] as const

const IconsDemo = {
  ...simpleComponentConfig,
  component: Icons,
  title: 'Shared-ui/Icons',
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

const Template: Story<ComponentProps<typeof Icons>> = () => {
  return (
    <Stack sx={{ ml: 30 }}>
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
              {<Icons name={name} /> != null ? name : null}
            </Typography>
            {/* Use to test loading state locally */}
            {/* <CircularProgress size="16px" /> */}
            <Icons name={name} fontSize="small" />
            <Icons name={name} />
            <Icons name={name} fontSize="large" />
            <Icons name={name} sx={{ fontSize: '48px', ml: -1 }} />
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
              <Icons name={name} color={color as Color} />
            ))}
          </Stack>
        </Stack>
      ))}
    </Stack>
  )
}

export const Default = Template.bind({})

export default IconsDemo as Meta
