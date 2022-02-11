import { Story, Meta } from '@storybook/react'
import { useTheme } from '@mui/material/styles'
import Box from '@mui/material/Box'
import { journeyUiConfig, TreeBlock } from '@core/journeys/ui'
import {
  TypographyColor,
  TypographyVariant
} from '../../../../../__generated__/globalTypes'
import { CardFields } from '../../../../../__generated__/CardFields'
import { CardWrapper } from '.'

const Demo: Meta = {
  ...journeyUiConfig,
  component: CardWrapper,
  title: 'Journeys-Admin/Editor/Canvas/CardWrapper'
}

const Template: Story<TreeBlock<CardFields>> = ({ ...props }) => {
  const theme = useTheme()
  return (
    <Box
      sx={{
        height: 'calc(100vh - 80px)',
        maxHeight: 'calc(100vh - 80px)',
        [theme.breakpoints.up('sm')]: {
          maxHeight: '460px'
        },
        [theme.breakpoints.up('lg')]: {
          maxWidth: '854px',
          maxHeight: '480px'
        }
      }}
    >
      <CardWrapper block={props} />
    </Box>
  )
}

export const VideoCover: Story<TreeBlock<CardFields>> = Template.bind({})
VideoCover.args = {
  coverBlockId: 'videoBlockId1',
  children: [
    {
      id: 'typographyBlockId1',
      __typename: 'TypographyBlock',
      parentBlockId: null,
      parentOrder: 0,
      align: null,
      color: TypographyColor.secondary,
      content: 'It s Ok To Get Angry',
      variant: TypographyVariant.overline,
      children: []
    },
    {
      id: 'typographyBlockId2',
      __typename: 'TypographyBlock',
      parentBlockId: null,
      parentOrder: 1,
      align: null,
      color: null,
      content:
        'Christianity isn’t about looking nice and religious; it’s diving into the deep end, a life fully immersed in following after Jesus.',
      variant: TypographyVariant.subtitle1,
      children: []
    },
    {
      id: 'typographyBlockId3',
      __typename: 'TypographyBlock',
      parentBlockId: null,
      parentOrder: 2,
      align: null,
      color: null,
      content: 'Bible, 1 Corinthians 15:3-4',
      variant: TypographyVariant.body2,
      children: []
    },
    {
      __typename: 'VideoBlock',
      id: 'videoBlockId1',
      parentBlockId: null,
      parentOrder: 3,
      muted: true,
      autoplay: true,
      title: 'video',
      startAt: null,
      endAt: null,
      posterBlockId: 'posterBlockId',
      videoContent: {
        __typename: 'VideoArclight',
        src: 'https://arc.gt/hls/2_0-FallingPlates/529'
      },
      fullsize: null,
      children: [
        {
          id: 'posterBlockId',
          __typename: 'ImageBlock',
          src: 'https://images.unsplash.com/photo-1508363778367-af363f107cbb?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&dl=chester-wade-hLP7lVm4KUE-unsplash.jpg&w=1920',
          alt: 'random image from unsplash',
          width: 1600,
          height: 1067,
          blurhash: 'L9AS}j^-0dVC4Tq[=~PATeXSV?aL',
          parentBlockId: 'videoBlockId',
          parentOrder: 0,
          children: []
        }
      ]
    }
  ]
}
VideoCover.parameters = {
  chromatic: { delay: 400, diffThreshold: 0.85 }
}

export default Demo
