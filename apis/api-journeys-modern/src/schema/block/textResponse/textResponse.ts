import { builder } from '../../builder'
import { Block } from '../block'

import { TextResponseType } from './enums/textResponseType'

export const TextResponseBlock = builder.prismaObject('Block', {
  interfaces: [Block],
  variant: 'TextResponseBlock',
  isTypeOf: (obj: any) => obj.typename === 'TextResponseBlock',
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
