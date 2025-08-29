import { ActionInterface } from '../../action/action'
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

const ButtonBlockSettings = builder.objectType(
  builder.objectRef<ButtonBlockSettingsType>('ButtonBlockSettings'),
  {
    shareable: true,
    fields: (t) => ({
      alignment: t.field({
        type: ButtonAlignment,
        nullable: true,
        description: 'Alignment of the button',
        resolve: (settings: ButtonBlockSettingsType) => settings.alignment
      }),
      color: t.string({
        nullable: true,
        description: 'Color of the button',
        resolve: (settings: ButtonBlockSettingsType) => settings.color
      })
    })
  }
)

export const ButtonBlock = builder.prismaObject('Block', {
  variant: 'ButtonBlock',
  interfaces: [Block],
  isTypeOf: (obj: any) => obj.typename === 'ButtonBlock',
  shareable: true,
  fields: (t) => ({
    label: t.string({
      nullable: false,
      resolve: (block) => block.label ?? ''
    }),
    variant: t.field({
      type: ButtonVariant,
      nullable: true,
      resolve: (block) => block.variant as ButtonVariantType
    }),
    color: t.field({
      type: ButtonColor,
      nullable: true,
      resolve: (block) => block.color as ButtonColorType
    }),
    size: t.field({
      type: ButtonSize,
      nullable: true,
      resolve: (block) => block.size as ButtonSizeType
    }),
    startIconId: t.exposeID('startIconId', {
      nullable: true
    }),
    endIconId: t.exposeID('endIconId', {
      nullable: true
    }),
    submitEnabled: t.exposeBoolean('submitEnabled', {
      nullable: true
    }),
    settings: t.field({
      type: ButtonBlockSettings,
      nullable: true,
      select: {
        settings: true
      },
      resolve: ({ settings }) => settings as unknown as ButtonBlockSettingsType
    }),
    action: t.field({
      type: ActionInterface,
      nullable: true,
      select: {
        action: true
      },
      resolve: async (block) => block.action
    })
  })
})
