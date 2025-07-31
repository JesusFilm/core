import { builder } from "../../builder";
import { VideoBlockSource } from "../../enums";
import { EventInterface } from "../event";

export const VideoCompleteEventRef = builder.prismaObject('Event', {
    interfaces: [EventInterface],
    variant: 'VideoCompleteEvent',
    isTypeOf: (obj: any) => obj.typename === 'VideoCompleteEvent',
    fields: (t) => ({
      position: t.exposeFloat('position', { nullable: true }),
      source: t.expose('source', { type: VideoBlockSource, nullable: true })
    })
  })