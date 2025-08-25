import { builder } from '../../builder'
import { Block } from '../block'

import { TextResponseType } from './enums/textResponseType'

export const TextResponseBlock = builder.prismaObject('Block', {
  interfaces: [Block],
  variant: 'TextResponseBlock',
  isTypeOf: (obj: any) => obj.typename === 'TextResponseBlock',
  shareable: true,
  fields: (t) => ({
    label: t.string({
      nullable: false,
      resolve: (block) => block.label ?? ''
    }),
    placeholder: t.exposeString('placeholder', {
      nullable: true
    }),
    required: t.exposeBoolean('required', {
      nullable: true
    }),
    hint: t.exposeString('hint', {
      nullable: true
    }),
    minRows: t.exposeInt('minRows', {
      nullable: true
    }),
    type: t.field({
      type: TextResponseType,
      nullable: true,
      resolve: (block) => block.type
    }),
    routeId: t.exposeString('routeId', {
      nullable: true
    }),
    integrationId: t.exposeString('integrationId', {
      nullable: true
    })
  })
})
