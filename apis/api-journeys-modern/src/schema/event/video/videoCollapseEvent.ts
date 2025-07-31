import { builder } from '../../builder'
import { VideoBlockSource } from '../../enums'
import { EventInterface } from '../event'

export const VideoCollapseEventRef = builder.prismaObject('Event', {
  interfaces: [EventInterface],
  variant: 'VideoCollapseEvent',
  isTypeOf: (obj: any) => obj.typename === 'VideoCollapseEvent',
  fields: (t) => ({
    position: t.exposeFloat('position', { nullable: true }),
    source: t.expose('source', { type: VideoBlockSource, nullable: true })
  })
})
