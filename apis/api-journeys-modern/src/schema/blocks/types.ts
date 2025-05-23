import {
  Block,
  ButtonBlock,
  CardBlock,
  GridContainerBlock,
  GridItemBlock,
  IconBlock,
  ImageBlock,
  RadioOptionBlock,
  RadioQuestionBlock,
  SpacerBlock,
  StepBlock,
  TextResponseBlock,
  TypographyBlock,
  VideoBlock
} from '../../lib/types/block'
import { builder } from '../builder'
import { VideoBlockObjectFit } from '../mediaVideo/enums/videoObjectFit'
import { VideoBlockSource } from '../mediaVideo/enums/videoSource'

import { ButtonColor, ButtonSize, ButtonVariant } from './enums/buttonEnums'
import {
  GridAlignItems,
  GridDirection,
  GridJustifyContent
} from './enums/gridEnums'
import { IconColor, IconSize } from './enums/iconEnums'
import { IconName } from './enums/iconNameEnum'
import { TextResponseType } from './enums/textResponseEnums'
import { ThemeMode, ThemeName } from './enums/themeEnums'
import {
  TypographyAlign,
  TypographyColor,
  TypographyVariant
} from './enums/typographyEnums'
import { BlockRef } from './interface'

// Define a type that includes submitEnabled for ButtonBlock
type ExtendedButtonBlock = ButtonBlock & { submitEnabled?: boolean | null }

// Define a type for VideoBlock with additional fields
type ExtendedVideoBlock = VideoBlock & {
  title?: string | null
  description?: string | null
  image?: string | null
  duration?: number | null
}

// Define refs for all block types
const TypographyBlockRef = builder.objectRef<TypographyBlock>('TypographyBlock')
const ButtonBlockRef = builder.objectRef<ExtendedButtonBlock>('ButtonBlock')
const CardBlockRef = builder.objectRef<CardBlock>('CardBlock')
const GridContainerBlockRef =
  builder.objectRef<GridContainerBlock>('GridContainerBlock')
const GridItemBlockRef = builder.objectRef<GridItemBlock>('GridItemBlock')
const IconBlockRef = builder.objectRef<IconBlock>('IconBlock')
const ImageBlockRef = builder.objectRef<ImageBlock>('ImageBlock')
const RadioOptionBlockRef =
  builder.objectRef<RadioOptionBlock>('RadioOptionBlock')
const RadioQuestionBlockRef =
  builder.objectRef<RadioQuestionBlock>('RadioQuestionBlock')
const SpacerBlockRef = builder.objectRef<SpacerBlock>('SpacerBlock')
const StepBlockRef = builder.objectRef<StepBlock>('StepBlock')
const TextResponseBlockRef =
  builder.objectRef<TextResponseBlock>('TextResponseBlock')
const VideoBlockRef = builder.objectRef<ExtendedVideoBlock>('VideoBlockContent')

// Define a SignUpBlock type since it's not in the imported types
interface SignUpBlock extends Block {
  typename: 'SignUpBlock'
  submitIconId?: string | null
  submitLabel?: string | null
}
const SignUpBlockRef = builder.objectRef<SignUpBlock>('SignUpBlock')

// Define VideoTriggerBlock type
interface VideoTriggerBlock extends Block {
  typename: 'VideoTriggerBlock'
  triggerStart?: number | null
}
const VideoTriggerBlockRef =
  builder.objectRef<VideoTriggerBlock>('VideoTriggerBlock')

// Define TextBlock (Typography block)
builder.objectType(TypographyBlockRef, {
  interfaces: [BlockRef],
  isTypeOf: (obj: any) => obj.typename === 'TypographyBlock',
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false, directives: { shareable: true } }),
    journeyId: t.exposeID('journeyId', { nullable: false, directives: { shareable: true } }),
    parentBlockId: t.exposeID('parentBlockId', {
      nullable: true,
      directives: { shareable: true }
    }),
    parentOrder: t.exposeInt('parentOrder', {
      nullable: true,
      directives: { shareable: true }
    }),
    content: t.exposeString('content', {
      nullable: true,
      directives: { shareable: true }
    }),
    variant: t.field({
      type: TypographyVariant,
      nullable: true,
      directives: { shareable: true },
      resolve: (block) => block.variant as any
    }),
    color: t.field({
      type: TypographyColor,
      nullable: true,
      directives: { shareable: true },
      resolve: (block) => block.color as any
    }),
    align: t.field({
      type: TypographyAlign,
      nullable: true,
      directives: { shareable: true },
      resolve: (block) => block.align as any
    })
  }),
  directives: { key: { fields: 'id' } }
})

// Define ButtonBlock
builder.objectType(ButtonBlockRef, {
  interfaces: [BlockRef],
  isTypeOf: (obj: any) => obj.typename === 'ButtonBlock',
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false, directives: { shareable: true } }),
    journeyId: t.exposeID('journeyId', { nullable: false, directives: { shareable: true } }),
    parentBlockId: t.exposeID('parentBlockId', {
      nullable: true,
      directives: { shareable: true }
    }),
    parentOrder: t.exposeInt('parentOrder', {
      nullable: true,
      directives: { shareable: true }
    }),
    label: t.exposeString('label', {
      nullable: true,
      directives: { shareable: true }
    }),
    variant: t.field({
      type: ButtonVariant,
      nullable: true,
      directives: { shareable: true },
      resolve: (block) => block.variant as any
    }),
    color: t.field({
      type: ButtonColor,
      nullable: true,
      directives: { shareable: true },
      resolve: (block) => block.color as any
    }),
    size: t.field({
      type: ButtonSize,
      nullable: true,
      directives: { shareable: true },
      resolve: (block) => block.size as any
    }),
    startIconId: t.exposeID('startIconId', {
      nullable: true,
      directives: { shareable: true }
    }),
    endIconId: t.exposeID('endIconId', {
      nullable: true,
      directives: { shareable: true }
    }),
    submitEnabled: t.exposeBoolean('submitEnabled', {
      nullable: true,
      directives: { shareable: true }
    })
  }),
  directives: { key: { fields: 'id' } }
})

// Define CardBlock
builder.objectType(CardBlockRef, {
  interfaces: [BlockRef],
  isTypeOf: (obj: any) => obj.typename === 'CardBlock',
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false, directives: { shareable: true } }),
    journeyId: t.exposeID('journeyId', { nullable: false, directives: { shareable: true } }),
    parentBlockId: t.exposeID('parentBlockId', {
      nullable: true,
      directives: { shareable: true }
    }),
    parentOrder: t.exposeInt('parentOrder', {
      nullable: true,
      directives: { shareable: true }
    }),
    backgroundColor: t.exposeString('backgroundColor', {
      nullable: true,
      directives: { shareable: true }
    }),
    coverBlockId: t.exposeID('coverBlockId', {
      nullable: true,
      directives: { shareable: true }
    }),
    fullscreen: t.exposeBoolean('fullscreen', {
      nullable: true,
      directives: { shareable: true }
    }),
    themeMode: t.field({
      type: ThemeMode,
      nullable: true,
      directives: { shareable: true },
      resolve: (block) => block.themeMode as any
    }),
    themeName: t.field({
      type: ThemeName,
      nullable: true,
      directives: { shareable: true },
      resolve: (block) => block.themeName as any
    })
  }),
  directives: { key: { fields: 'id' } }
})

// Define GridContainerBlock
builder.objectType(GridContainerBlockRef, {
  interfaces: [BlockRef],
  isTypeOf: (obj: any) => obj.typename === 'GridContainerBlock',
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false, directives: { shareable: true } }),
    journeyId: t.exposeID('journeyId', { nullable: false, directives: { shareable: true } }),
    parentBlockId: t.exposeID('parentBlockId', {
      nullable: true,
      directives: { shareable: true }
    }),
    parentOrder: t.exposeInt('parentOrder', {
      nullable: true,
      directives: { shareable: true }
    }),
    gap: t.exposeInt('gap', {
      nullable: true,
      directives: { shareable: true }
    }),
    direction: t.field({
      type: GridDirection,
      nullable: true,
      directives: { shareable: true },
      resolve: (block) => block.direction as any
    }),
    justifyContent: t.field({
      type: GridJustifyContent,
      nullable: true,
      directives: { shareable: true },
      resolve: (block) => block.justifyContent as any
    }),
    alignItems: t.field({
      type: GridAlignItems,
      nullable: true,
      directives: { shareable: true },
      resolve: (block) => block.alignItems as any
    })
  }),
  directives: { key: { fields: 'id' } }
})

// Define GridItemBlock
builder.objectType(GridItemBlockRef, {
  interfaces: [BlockRef],
  isTypeOf: (obj: any) => obj.typename === 'GridItemBlock',
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false, directives: { shareable: true } }),
    journeyId: t.exposeID('journeyId', { nullable: false, directives: { shareable: true } }),
    parentBlockId: t.exposeID('parentBlockId', {
      nullable: true,
      directives: { shareable: true }
    }),
    parentOrder: t.exposeInt('parentOrder', {
      nullable: true,
      directives: { shareable: true }
    }),
    xl: t.exposeInt('xl', {
      nullable: true,
      directives: { shareable: true }
    }),
    lg: t.exposeInt('lg', {
      nullable: true,
      directives: { shareable: true }
    }),
    sm: t.exposeInt('sm', {
      nullable: true,
      directives: { shareable: true }
    })
  }),
  directives: { key: { fields: 'id' } }
})

// Define IconBlock
builder.objectType(IconBlockRef, {
  interfaces: [BlockRef],
  isTypeOf: (obj: any) => obj.typename === 'IconBlock',
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false, directives: { shareable: true } }),
    journeyId: t.exposeID('journeyId', { nullable: false, directives: { shareable: true } }),
    parentBlockId: t.exposeID('parentBlockId', {
      nullable: true,
      directives: { shareable: true }
    }),
    parentOrder: t.exposeInt('parentOrder', {
      nullable: true,
      directives: { shareable: true }
    }),
    name: t.field({
      type: IconName,
      nullable: true,
      directives: { shareable: true },
      resolve: (block) => block.name as any
    }),
    color: t.field({
      type: IconColor,
      nullable: true,
      directives: { shareable: true },
      resolve: (block) => block.color as any
    }),
    size: t.field({
      type: IconSize,
      nullable: true,
      directives: { shareable: true },
      resolve: (block) => block.size as any
    })
  }),
  directives: { key: { fields: 'id' } }
})

// Define ImageBlock
builder.objectType(ImageBlockRef, {
  interfaces: [BlockRef],
  isTypeOf: (obj: any) => obj.typename === 'ImageBlock',
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false, directives: { shareable: true } }),
    journeyId: t.exposeID('journeyId', { nullable: false, directives: { shareable: true } }),
    parentBlockId: t.exposeID('parentBlockId', {
      nullable: true,
      directives: { shareable: true }
    }),
    parentOrder: t.exposeInt('parentOrder', {
      nullable: true,
      directives: { shareable: true }
    }),
    src: t.exposeString('src', {
      nullable: true,
      directives: { shareable: true }
    }),
    width: t.exposeInt('width', {
      nullable: true,
      directives: { shareable: true }
    }),
    height: t.exposeInt('height', {
      nullable: true,
      directives: { shareable: true }
    }),
    alt: t.exposeString('alt', {
      nullable: true,
      directives: { shareable: true }
    }),
    blurhash: t.exposeString('blurhash', {
      nullable: true,
      directives: { shareable: true }
    }),
    focalTop: t.exposeInt('focalTop', {
      nullable: true,
      directives: { shareable: true }
    }),
    focalLeft: t.exposeInt('focalLeft', {
      nullable: true,
      directives: { shareable: true }
    }),
    scale: t.exposeInt('scale', {
      nullable: true,
      directives: { shareable: true }
    })
  }),
  directives: { key: { fields: 'id' } }
})

// Define RadioOptionBlock
builder.objectType(RadioOptionBlockRef, {
  interfaces: [BlockRef],
  isTypeOf: (obj: any) => obj.typename === 'RadioOptionBlock',
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false, directives: { shareable: true } }),
    journeyId: t.exposeID('journeyId', { nullable: false, directives: { shareable: true } }),
    parentBlockId: t.exposeID('parentBlockId', {
      nullable: true,
      directives: { shareable: true }
    }),
    parentOrder: t.exposeInt('parentOrder', {
      nullable: true,
      directives: { shareable: true }
    }),
    label: t.exposeString('label', {
      nullable: true,
      directives: { shareable: true }
    })
  }),
  directives: { key: { fields: 'id' } }
})

// Define RadioQuestionBlock
builder.objectType(RadioQuestionBlockRef, {
  interfaces: [BlockRef],
  isTypeOf: (obj: any) => obj.typename === 'RadioQuestionBlock',
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false, directives: { shareable: true } }),
    journeyId: t.exposeID('journeyId', { nullable: false, directives: { shareable: true } }),
    parentBlockId: t.exposeID('parentBlockId', {
      nullable: true,
      directives: { shareable: true }
    }),
    parentOrder: t.exposeInt('parentOrder', {
      nullable: true,
      directives: { shareable: true }
    }),
    label: t.exposeString('label', {
      nullable: true,
      directives: { shareable: true }
    })
  }),
  directives: { key: { fields: 'id' } }
})

// Define SignUpBlock
builder.objectType(SignUpBlockRef, {
  interfaces: [BlockRef],
  isTypeOf: (obj: any) => obj.typename === 'SignUpBlock',
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false, directives: { shareable: true } }),
    journeyId: t.exposeID('journeyId', { nullable: false, directives: { shareable: true } }),
    parentBlockId: t.exposeID('parentBlockId', {
      nullable: true,
      directives: { shareable: true }
    }),
    parentOrder: t.exposeInt('parentOrder', {
      nullable: true,
      directives: { shareable: true }
    }),
    submitIconId: t.exposeID('submitIconId', {
      nullable: true,
      directives: { shareable: true }
    }),
    submitLabel: t.exposeString('submitLabel', {
      nullable: true,
      directives: { shareable: true }
    })
  }),
  directives: { key: { fields: 'id' } }
})

// Define SpacerBlock
builder.objectType(SpacerBlockRef, {
  interfaces: [BlockRef],
  isTypeOf: (obj: any) => obj.typename === 'SpacerBlock',
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false, directives: { shareable: true } }),
    journeyId: t.exposeID('journeyId', { nullable: false, directives: { shareable: true } }),
    parentBlockId: t.exposeID('parentBlockId', {
      nullable: true,
      directives: { shareable: true }
    }),
    parentOrder: t.exposeInt('parentOrder', {
      nullable: true,
      directives: { shareable: true }
    }),
    spacing: t.exposeInt('spacing', {
      nullable: true,
      directives: { shareable: true }
    })
  }),
  directives: { key: { fields: 'id' } }
})

// Define StepBlock
builder.objectType(StepBlockRef, {
  interfaces: [BlockRef],
  isTypeOf: (obj: any) => obj.typename === 'StepBlock',
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false, directives: { shareable: true } }),
    journeyId: t.exposeID('journeyId', { nullable: false, directives: { shareable: true } }),
    parentBlockId: t.exposeID('parentBlockId', {
      nullable: true,
      directives: { shareable: true }
    }),
    parentOrder: t.exposeInt('parentOrder', {
      nullable: true,
      directives: { shareable: true }
    }),
    nextBlockId: t.exposeID('nextBlockId', {
      nullable: true,
      directives: { shareable: true }
    }),
    locked: t.exposeBoolean('locked', {
      nullable: true,
      directives: { shareable: true }
    }),
    x: t.exposeInt('x', { nullable: true, directives: { shareable: true } }),
    y: t.exposeInt('y', { nullable: true, directives: { shareable: true } }),
    slug: t.exposeString('slug', {
      nullable: true,
      directives: { shareable: true }
    })
  }),
  directives: { key: { fields: 'id' } }
})

// Define TextResponseBlock
builder.objectType(TextResponseBlockRef, {
  interfaces: [BlockRef],
  isTypeOf: (obj: any) => obj.typename === 'TextResponseBlock',
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false, directives: { shareable: true } }),
    journeyId: t.exposeID('journeyId', { nullable: false, directives: { shareable: true } }),
    parentBlockId: t.exposeID('parentBlockId', {
      nullable: true,
      directives: { shareable: true }
    }),
    parentOrder: t.exposeInt('parentOrder', {
      nullable: true,
      directives: { shareable: true }
    }),
    label: t.exposeString('label', {
      nullable: true,
      directives: { shareable: true }
    }),
    placeholder: t.exposeString('placeholder', {
      nullable: true,
      directives: { shareable: true }
    }),
    required: t.exposeBoolean('required', {
      nullable: true,
      directives: { shareable: true }
    }),
    hint: t.exposeString('hint', {
      nullable: true,
      directives: { shareable: true }
    }),
    minRows: t.exposeInt('minRows', {
      nullable: true,
      directives: { shareable: true }
    }),
    routeId: t.exposeString('routeId', {
      nullable: true,
      directives: { shareable: true }
    }),
    integrationId: t.exposeString('integrationId', {
      nullable: true,
      directives: { shareable: true }
    }),
    type: t.field({
      type: TextResponseType,
      nullable: true,
      directives: { shareable: true },
      resolve: (block) => block.type as any
    })
  }),
  directives: { key: { fields: 'id' } }
})

// Define VideoBlockContent
builder.objectType(VideoBlockRef, {
  interfaces: [BlockRef],
  isTypeOf: (obj: any) => obj.typename === 'VideoBlock',
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false, directives: { shareable: true } }),
    journeyId: t.exposeID('journeyId', { nullable: false, directives: { shareable: true } }),
    parentBlockId: t.exposeID('parentBlockId', {
      nullable: true,
      directives: { shareable: true }
    }),
    parentOrder: t.exposeInt('parentOrder', {
      nullable: true,
      directives: { shareable: true }
    }),
    startAt: t.exposeInt('startAt', {
      nullable: true,
      directives: { shareable: true }
    }),
    endAt: t.exposeInt('endAt', {
      nullable: true,
      directives: { shareable: true }
    }),
    muted: t.exposeBoolean('muted', {
      nullable: true,
      directives: { shareable: true }
    }),
    autoplay: t.exposeBoolean('autoplay', {
      nullable: true,
      directives: { shareable: true }
    }),
    posterBlockId: t.exposeID('posterBlockId', {
      nullable: true,
      directives: { shareable: true }
    }),
    fullsize: t.exposeBoolean('fullsize', {
      nullable: true,
      directives: { shareable: true }
    }),
    videoId: t.exposeID('videoId', {
      nullable: true,
      directives: { shareable: true }
    }),
    videoVariantLanguageId: t.exposeID('videoVariantLanguageId', {
      nullable: true,
      directives: { shareable: true }
    }),
    source: t.field({
      type: VideoBlockSource,
      nullable: true,
      directives: { shareable: true },
      resolve: (video) => video.source ?? null
    }),
    title: t.exposeString('title', {
      nullable: true,
      directives: { shareable: true }
    }),
    description: t.exposeString('description', {
      nullable: true,
      directives: { shareable: true }
    }),
    objectFit: t.field({
      type: VideoBlockObjectFit,
      nullable: true,
      directives: { shareable: true },
      resolve: (video) => (video.objectFit as any) ?? null
    })
  }),
  directives: { key: { fields: 'id' } }
})

// Define VideoTriggerBlock
builder.objectType(VideoTriggerBlockRef, {
  interfaces: [BlockRef],
  isTypeOf: (obj: any) => obj.typename === 'VideoTriggerBlock',
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false, directives: { shareable: true } }),
    journeyId: t.exposeID('journeyId', { nullable: false, directives: { shareable: true } }),
    parentBlockId: t.exposeID('parentBlockId', {
      nullable: true,
      directives: { shareable: true }
    }),
    parentOrder: t.exposeInt('parentOrder', {
      nullable: true,
      directives: { shareable: true }
    }),
    triggerStart: t.exposeInt('triggerStart', {
      nullable: true,
      directives: { shareable: true }
    })
  }),
  directives: { key: { fields: 'id' } }
})
