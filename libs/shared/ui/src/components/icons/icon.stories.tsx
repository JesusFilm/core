import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { Meta, StoryObj } from '@storybook/react'

// import CircularProgress from '@mui/material/CircularProgress'
import { simpleComponentConfig } from '../../libs/simpleComponentConfig'

// import { CenterCheck } from './CenterCheck'
import { Icon, IconName } from './Icon'

const iconNames: IconName[] = [
  'AddSquare2',
  'AddSquare4',
  'AlertCircle',
  'AlertTriangle',
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
  'Attachment1',
  'Bag5',
  'BarChartSquare3',
  'BarGroup3',
  'Bell2',
  'Bible',
  'Blur',
  'Book',
  'Box',
  'Bulb',
  'Calendar1',
  'Calendar2',
  'Calendar4',
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
  'Clock1',
  'Code1',
  'ColorPicker',
  'Colors1',
  'Colors2',
  'Computer',
  'CopyLeft',
  'CopyRight',
  'CopyTo',
  'Crop1',
  'Crop169',
  'Cursor4',
  'Cursor6',
  'CursorPointer',
  'Dash',
  'Diamond',
  'DotVertical',
  'DownArrowSm',
  'DownArrow',
  'Download2',
  'Drag',
  'DuplicateCard',
  'Edit2',
  'Ellipsis',
  'Email',
  'Embed',
  'Equals',
  'Expand2',
  'Expand',
  'EyeClosed',
  'EyeOpen',
  'Facebook',
  'FacebookLogo',
  'Favourite',
  'File5',
  'FilePlus1',
  'FileShred',
  'Filter',
  'Flame',
  'FlexAlignBottom1',
  'FlipLeft',
  'FlipRight',
  'FolderDown1',
  'FolderUp1',
  'Globe',
  'Globe1',
  'Globe2',
  'Globe3',
  'Grid1',
  'GridEmpty',
  'Hash1',
  'Hash2',
  'Header1',
  'HelpCircleContained',
  'HelpSquareContained',
  'Home3',
  'Home4',
  'Image3',
  'ImageX',
  'Inbox2',
  'InformationCircleContained',
  'InformationSquareContained',
  'Instagram',
  'Iphone1',
  'Journey',
  'Journeys',
  'KakaoTalk',
  'Key1',
  'Key2',
  'Laptop1',
  'Layers4',
  'Layout2',
  'LayoutScale',
  'Lightning2',
  'LightningCircleContained',
  'Line',
  'LinkAngled',
  'LinkBroken',
  'LinkExternal',
  'Link',
  'Lock1',
  'LockOpen1',
  'Logout2',
  'Mail1',
  'Mail2',
  'Marker1',
  'Marker2',
  'Maximise1',
  'Maximise2',
  'MediaStrip1',
  'Menu1',
  'MessageChat1',
  'MessageChat2',
  'MessageCircle',
  'MessageNotifyCircle',
  'MessageNotifySquare',
  'MessageSquare',
  'MessageText1',
  'MessageText2',
  'MessageTyping',
  'Minimise1',
  'Minimise2',
  'MinusCircleContained',
  'More',
  'PackagePlus',
  'Palette',
  'Passport',
  'Pause1',
  'Pause2',
  'Pause3',
  'Play1',
  'Play2',
  'Play3',
  'Plus1',
  'Plus2',
  'Plus3',
  'Presentation1',
  'Search1',
  'Search2',
  'Send1',
  'Send2',
  'Settings',
  'Share',
  'ShieldCheck',
  'Skype',
  'SmileyNeutral',
  'Snapchat',
  'SpaceHeight',
  'SpaceHorizontal',
  'SpaceVertical',
  'Square',
  'Star2',
  'Stars',
  'StopCircleContained',
  'Sun2',
  'Tag',
  'Target',
  'Target2',
  'Telegram',
  'Terminal',
  'TextInput1',
  'Trash2',
  'ThumbsDown',
  'ThumbsUp',
  'Tiktok',
  'Transform',
  'TrendDown1',
  'TwitterLogo',
  'Type1',
  'Type2',
  'Type3',
  'Upload1',
  'Upload2',
  'UserProfile2',
  'UserProfile3',
  'UserProfileAdd',
  'UserProfileCircle',
  'UsersProfiles2',
  'UsersProfiles3',
  'Viber',
  'VideoOn',
  'Vk',
  'Web',
  'WhatsApp',
  'X1',
  'X2',
  'X3',
  'XCircleContained',
  'XSquareContained',
  'Youtube'
]

const IconDemo: Meta<typeof Icon> = {
  ...simpleComponentConfig,
  component: Icon,
  title: 'Shared-ui/Icon',
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

const Template: StoryObj<typeof Icon> = {
  render: () => {
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
                key={color}
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
          <Stack key={name} direction="row" gap={10}>
            <Stack
              direction="row"
              gap={7}
              justifyContent="flex-end"
              alignItems="center"
              sx={{ pb: 2, width: '320px' }}
            >
              <Typography variant="body2">
                {<Icon name={name} /> != null ? name : null}
              </Typography>
              {/* Use to test icon centering */}
              {/* <CenterCheck name={name} /> */}
              {/* Use to test loading state locally */}
              {/* <CircularProgress size="16px" /> */}
              <Icon name={name} fontSize="small" />
              <Icon name={name} />
              <Icon name={name} fontSize="large" />
              <Icon name={name} sx={{ fontSize: '48px', ml: -1 }} />
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
                <Icon key={name} name={name} color={color as Color} />
              ))}
            </Stack>
          </Stack>
        ))}
      </Stack>
    )
  }
}

export const Default = { ...Template }

export default IconDemo
