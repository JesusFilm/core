import { prisma } from '../../../lib/prisma'
import { ActionInterface } from '../../action/action'
import { builder } from '../../builder'
import { Block } from '../block'

export const VideoTriggerBlock = builder.prismaObject('Block', {
  interfaces: [Block],
  variant: 'VideoTriggerBlock',
  isTypeOf: (obj: any) => obj.typename === 'VideoTriggerBlock',
  shareable: true,
  fields: (t) => ({
    triggerStart: t.int({
      nullable: false,
      directives: { shareable: true },
      description: `triggerStart sets the time as to when a video navigates to the next block,
this is the number of seconds since the start of the video`,
      resolve: (block) => block.triggerStart ?? 0
    }),
    action: t.field({
      type: ActionInterface,
      nullable: true,
      directives: { shareable: true },
      resolve: async (block) => {
        const action = await prisma.action.findUnique({
          where: { parentBlockId: block.id }
        })
        return action
      }
    })
  })
})
