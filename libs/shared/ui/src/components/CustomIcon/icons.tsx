import { lazy } from 'react'

export const iconNames = [
  'none',
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
  'Edit',
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
  'Like',
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
  'UserProfile2',
  'UsersProfiles2',
  'Web',
  'X1',
  'X2',
  'X3',
  'XCircleContained',
  'XSquareContained'
] as const

export const iconComponents = {
  ...iconNames.reduce((acc, iconName) => {
    acc[iconName] =
      iconName === 'none'
        ? null
        : lazy(
            async () =>
              await import(
                /* webpackChunkName: 'custom-icon' */
                `./outlined/${iconName}`
              )
          )
    return acc
  }, {})
}
