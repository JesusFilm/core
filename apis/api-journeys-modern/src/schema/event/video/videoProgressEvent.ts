import { builder } from '../../builder'
import { VideoBlockSource } from '../../enums'
import { EventInterface } from '../event'

export const VideoProgressEventRef = builder.prismaObject('Event', {
  shareable: true,
  interfaces: [EventInterface],
  variant: 'VideoProgressEvent',
  isTypeOf: (obj: any) => obj.typename === 'VideoProgressEvent',
  fields: (t) => ({
    position: t.exposeFloat('position', { nullable: true }),
    source: t.expose('source', { type: VideoBlockSource, nullable: true }),
    progress: t.exposeInt('progress', { nullable: true })
  })
})
