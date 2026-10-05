import { builder } from '../../builder'
import { VideoBlockSource } from '../../enums'
import { EventInterface } from '../event'

export const VideoPlayEventRef = builder.prismaObject('Event', {
  shareable: true,
  interfaces: [EventInterface],
  variant: 'VideoPlayEvent',
  isTypeOf: (obj: any) => obj.typename === 'VideoPlayEvent',
  fields: (t) => ({
    position: t.exposeFloat('position', { nullable: true }),
    source: t.expose('source', { type: VideoBlockSource, nullable: true })
  })
})
