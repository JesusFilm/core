import { builder } from '../builder'

// Define VideoBlockSource enum
builder.enumType('VideoBlockSource', {
  values: ['internal', 'youtube', 'cloudflare', 'bunny'] as const
})

// Define VideoBlockObjectFit enum
builder.enumType('VideoBlockObjectFit', {
  values: ['fill', 'fit', 'zoomed'] as const
})

// Define TextBlock (Typography block)
builder.objectType('TypographyBlock', {
  interfaces: ['Block'],
  isTypeOf: (obj) => obj.typename === 'TypographyBlock',
  fields: (t) => ({
    content: t.exposeString('content', { nullable: true }),
    variant: t.exposeString('variant', { nullable: true }),
    color: t.exposeString('color', { nullable: true }),
    align: t.exposeString('align', { nullable: true })
  })
})

// Define ButtonBlock
builder.objectType('ButtonBlock', {
  interfaces: ['Block'],
  isTypeOf: (obj) => obj.typename === 'ButtonBlock',
  fields: (t) => ({
    label: t.exposeString('label', { nullable: true }),
    variant: t.exposeString('variant', { nullable: true }),
    color: t.exposeString('color', { nullable: true }),
    size: t.exposeString('size', { nullable: true }),
    startIconId: t.exposeID('startIconId', { nullable: true }),
    endIconId: t.exposeID('endIconId', { nullable: true }),
    submitEnabled: t.exposeBoolean('submitEnabled', { nullable: true })
  })
})

// Define CardBlock
builder.objectType('CardBlock', {
  interfaces: ['Block'],
  isTypeOf: (obj) => obj.typename === 'CardBlock',
  fields: (t) => ({
    backgroundColor: t.exposeString('backgroundColor', { nullable: true }),
    coverBlockId: t.exposeID('coverBlockId', { nullable: true }),
    fullscreen: t.exposeBoolean('fullscreen', { nullable: true }),
    themeMode: t.exposeString('themeMode', { nullable: true }),
    themeName: t.exposeString('themeName', { nullable: true })
  })
})

// Define GridContainerBlock
builder.objectType('GridContainerBlock', {
  interfaces: ['Block'],
  isTypeOf: (obj) => obj.typename === 'GridContainerBlock',
  fields: (t) => ({
    gap: t.exposeInt('gap', { nullable: true }),
    direction: t.exposeString('direction', { nullable: true }),
    justifyContent: t.exposeString('justifyContent', { nullable: true }),
    alignItems: t.exposeString('alignItems', { nullable: true })
  })
})

// Define GridItemBlock
builder.objectType('GridItemBlock', {
  interfaces: ['Block'],
  isTypeOf: (obj) => obj.typename === 'GridItemBlock',
  fields: (t) => ({
    xl: t.exposeInt('xl', { nullable: true }),
    lg: t.exposeInt('lg', { nullable: true }),
    sm: t.exposeInt('sm', { nullable: true })
  })
})

// Define IconBlock
builder.objectType('IconBlock', {
  interfaces: ['Block'],
  isTypeOf: (obj) => obj.typename === 'IconBlock',
  fields: (t) => ({
    name: t.exposeString('name', { nullable: true }),
    color: t.exposeString('color', { nullable: true }),
    size: t.exposeString('size', { nullable: true })
  })
})

// Define ImageBlock
builder.objectType('ImageBlock', {
  interfaces: ['Block'],
  isTypeOf: (obj) => obj.typename === 'ImageBlock',
  fields: (t) => ({
    src: t.exposeString('src', { nullable: true }),
    width: t.exposeInt('width', { nullable: true }),
    height: t.exposeInt('height', { nullable: true }),
    alt: t.exposeString('alt', { nullable: true }),
    blurhash: t.exposeString('blurhash', { nullable: true }),
    focalTop: t.exposeInt('focalTop', { nullable: true }),
    focalLeft: t.exposeInt('focalLeft', { nullable: true }),
    scale: t.exposeInt('scale', { nullable: true })
  })
})

// Define RadioOptionBlock
builder.objectType('RadioOptionBlock', {
  interfaces: ['Block'],
  isTypeOf: (obj) => obj.typename === 'RadioOptionBlock',
  fields: (t) => ({
    label: t.exposeString('label', { nullable: true })
  })
})

// Define RadioQuestionBlock
builder.objectType('RadioQuestionBlock', {
  interfaces: ['Block'],
  isTypeOf: (obj) => obj.typename === 'RadioQuestionBlock',
  fields: (t) => ({
    label: t.exposeString('label', { nullable: true })
  })
})

// Define SignUpBlock
builder.objectType('SignUpBlock', {
  interfaces: ['Block'],
  isTypeOf: (obj) => obj.typename === 'SignUpBlock',
  fields: (t) => ({
    submitIconId: t.exposeID('submitIconId', { nullable: true }),
    submitLabel: t.exposeString('submitLabel', { nullable: true })
  })
})

// Define SpacerBlock
builder.objectType('SpacerBlock', {
  interfaces: ['Block'],
  isTypeOf: (obj) => obj.typename === 'SpacerBlock',
  fields: (t) => ({
    spacing: t.exposeInt('spacing', { nullable: true })
  })
})

// Define StepBlock
builder.objectType('StepBlock', {
  interfaces: ['Block'],
  isTypeOf: (obj) => obj.typename === 'StepBlock',
  fields: (t) => ({
    nextBlockId: t.exposeID('nextBlockId', { nullable: true }),
    locked: t.exposeBoolean('locked', { nullable: true }),
    x: t.exposeInt('x', { nullable: true }),
    y: t.exposeInt('y', { nullable: true }),
    slug: t.exposeString('slug', { nullable: true })
  })
})

// Define TextResponseBlock
builder.objectType('TextResponseBlock', {
  interfaces: ['Block'],
  isTypeOf: (obj) => obj.typename === 'TextResponseBlock',
  fields: (t) => ({
    label: t.exposeString('label', { nullable: true }),
    placeholder: t.exposeString('placeholder', { nullable: true }),
    required: t.exposeBoolean('required', { nullable: true }),
    hint: t.exposeString('hint', { nullable: true }),
    minRows: t.exposeInt('minRows', { nullable: true }),
    routeId: t.exposeString('routeId', { nullable: true }),
    integrationId: t.exposeString('integrationId', { nullable: true }),
    type: t.exposeString('type', { nullable: true })
  })
})

// Define VideoBlock
builder.objectType('VideoBlock', {
  interfaces: ['Block'],
  isTypeOf: (obj) => obj.typename === 'VideoBlock',
  fields: (t) => ({
    startAt: t.exposeInt('startAt', { nullable: true }),
    endAt: t.exposeInt('endAt', { nullable: true }),
    muted: t.exposeBoolean('muted', { nullable: true }),
    autoplay: t.exposeBoolean('autoplay', { nullable: true }),
    posterBlockId: t.exposeID('posterBlockId', { nullable: true }),
    fullsize: t.exposeBoolean('fullsize', { nullable: true }),
    videoId: t.exposeID('videoId', { nullable: true }),
    videoVariantLanguageId: t.exposeID('videoVariantLanguageId', {
      nullable: true
    }),
    source: t.field({
      type: 'VideoBlockSource',
      nullable: true,
      resolve: (block) => block.source
    }),
    title: t.exposeString('title', { nullable: true }),
    description: t.exposeString('description', { nullable: true }),
    image: t.exposeString('image', { nullable: true }),
    duration: t.exposeInt('duration', { nullable: true }),
    objectFit: t.field({
      type: 'VideoBlockObjectFit',
      nullable: true,
      resolve: (block) => block.objectFit
    })
  })
})
