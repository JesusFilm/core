import { builder } from '../../builder'
import { Block } from '../block'

import {
  ButtonAlignment,
  type ButtonAlignmentType
} from './enums/buttonAlignment'
import { ButtonColor, type ButtonColorType } from './enums/buttonColor'
import { ButtonSize, type ButtonSizeType } from './enums/buttonSize'
import { ButtonVariant, type ButtonVariantType } from './enums/buttonVariant'

interface ButtonBlockSettingsType {
  alignment: ButtonAlignmentType
  color: string
}

const ButtonBlockSettingsRef = builder.objectRef<ButtonBlockSettingsType>(
  'ButtonBlockSettings'
)

export const ButtonBlockSettings = builder.objectType(ButtonBlockSettingsRef, {
  fields: (t) => ({
    alignment: t.field({
      type: ButtonAlignment,
      nullable: true,
      directives: { shareable: true },
      description: 'Alignment of the button',
      resolve: (settings: ButtonBlockSettingsType) => settings.alignment
    }),
    color: t.string({
      nullable: true,
      directives: { shareable: true },
      description: 'Color of the button',
      resolve: (settings: ButtonBlockSettingsType) => settings.color
    })
  })
})

export const ButtonBlock = builder.prismaObject('Block', {
  variant: 'ButtonBlock',
  interfaces: [Block],
  isTypeOf: (obj: any) => obj.typename === 'ButtonBlock',
  directives: { key: { fields: 'id' } },
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false, directives: { shareable: true } }),
    journeyId: t.exposeID('journeyId', {
      nullable: false,
      directives: { shareable: true }
    }),
    parentBlockId: t.exposeID('parentBlockId', {
      nullable: true,
      directives: { shareable: true }
    }),
    parentOrder: t.exposeInt('parentOrder', {
      nullable: true,
      directives: { shareable: true }
    }),
    label: t.string({
      nullable: false,
      directives: { shareable: true },
      resolve: (block) => block.label ?? ''
    }),
    variant: t.field({
      type: ButtonVariant,
      nullable: true,
      directives: { shareable: true },
      resolve: (block) => block.variant as ButtonVariantType
    }),
    color: t.field({
      type: ButtonColor,
      nullable: true,
      directives: { shareable: true },
      resolve: (block) => block.color as ButtonColorType
    }),
    size: t.field({
      type: ButtonSize,
      nullable: true,
      directives: { shareable: true },
      resolve: (block) => block.size as ButtonSizeType
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
    }),
    settings: t.field({
      type: ButtonBlockSettings,
      nullable: true,
      directives: { shareable: true },
      resolve: ({ settings }) => settings as unknown as ButtonBlockSettingsType
    })
  })
})
