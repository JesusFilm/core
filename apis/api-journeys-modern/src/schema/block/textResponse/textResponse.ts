import { builder } from '../../builder'
import { Block } from '../block'

import { TextResponseType } from './enums/textResponseType'

export const TextResponseBlock = builder.prismaObject('Block', {
  interfaces: [Block],
  variant: 'TextResponseBlock',
  isTypeOf: (obj: any) => obj.typename === 'TextResponseBlock',
  directives: { key: { fields: 'id' } },
  shareable: true,
  fields: (t) => ({
    label: t.string({
      nullable: false,
      directives: { shareable: true },
      resolve: (block) => block.label ?? ''
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
    type: t.field({
      type: TextResponseType,
      nullable: true,
      directives: { shareable: true },
      resolve: (block) => block.type
    }),
    routeId: t.exposeString('routeId', {
      nullable: true,
      directives: { shareable: true }
    }),
    integrationId: t.exposeString('integrationId', {
      nullable: true,
      directives: { shareable: true }
    })
  })
})
