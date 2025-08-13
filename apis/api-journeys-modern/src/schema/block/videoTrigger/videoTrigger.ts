import { builder } from '../../builder'
import { Block } from '../block'

builder.prismaObject('Block', {
  interfaces: [Block],
  variant: 'VideoTriggerBlock',
  isTypeOf: (obj: any) => obj.typename === 'VideoTriggerBlock',
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
    triggerStart: t.int({
      nullable: false,
      directives: { shareable: true },
      description: `triggerStart sets the time as to when a video navigates to the next block,
this is the number of seconds since the start of the video`,
      resolve: (block) => block.triggerStart ?? 0
    })
  })
})
