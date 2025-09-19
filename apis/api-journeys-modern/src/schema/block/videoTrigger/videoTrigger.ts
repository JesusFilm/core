import { GraphQLError } from 'graphql'

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
      description: `triggerStart sets the time as to when a video navigates to the next block,
this is the number of seconds since the start of the video`,
      resolve: (block) => block.triggerStart ?? 0
    }),
    action: t.relation('action', {
      nullable: false,
      onNull: () => new GraphQLError('Action not found')
    })
  })
})
