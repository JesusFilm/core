import { Event } from '@core/prisma/journeys/client'

import { builder } from '../../builder'
import { BlockEventLabel } from '../../enums'
import { EventInterface } from '../event'

import { createCaptureEvent } from './captureService'
import {
  CAPTURE_EVENTS,
  CAPTURE_EVENT_TRIGGERS,
  CaptureEventTypename
} from './captureTypes'

/** Fail GraphQL resolution when a required capture snapshot field is missing. */
function requiredSnapshot<T>(value: T | null): T {
  if (value == null) throw new Error('Capture snapshot is missing')
  return value
}

const CaptureEventTrigger = builder.enumType('CaptureEventTrigger', {
  values: CAPTURE_EVENT_TRIGGERS
})

for (const typename of Object.keys(CAPTURE_EVENTS) as CaptureEventTypename[]) {
  const eventRef = builder.prismaObject('Event', {
    variant: typename,
    shareable: true,
    interfaces: [EventInterface],
    isTypeOf: (event: unknown) => (event as Event).typename === typename,
    fields: (t) => ({
      blockId: t.field({
        type: 'ID',
        nullable: false,
        select: { blockId: true },
        resolve: (event) => requiredSnapshot(event.blockId)
      }),
      stepId: t.field({
        type: 'ID',
        nullable: false,
        select: { stepId: true },
        resolve: (event) => requiredSnapshot(event.stepId)
      }),
      captureIdentity: t.string({
        nullable: false,
        select: { captureIdentity: true },
        resolve: (event) => requiredSnapshot(event.captureIdentity)
      }),
      captureTag: t.field({
        type: BlockEventLabel,
        nullable: false,
        select: { captureTag: true },
        resolve: (event) => requiredSnapshot(event.captureTag)
      }),
      trigger: t.field({
        type: CaptureEventTrigger,
        nullable: false,
        select: { captureTrigger: true },
        resolve: (event) =>
          requiredSnapshot(
            CAPTURE_EVENT_TRIGGERS.find(
              (trigger) => trigger === event.captureTrigger
            ) ?? null
          )
      }),
      templateFamilyId: t.exposeID('templateFamilyId', { nullable: true })
    })
  })
  const inputRef = builder.inputType(`${typename}CreateInput`, {
    fields: (t) => ({
      id: t.id({
        required: true,
        description:
          'Unique occurrence UUID. Reuse only when retrying this capture.'
      }),
      blockId: t.id({
        required: true,
        description:
          'Actual tagged Card, Button, selected RadioOption or Video ID in the played journey.'
      }),
      stepId: t.id({
        required: true,
        description: 'Containing Step ID in the played journey.'
      }),
      trigger: t.field({ type: CaptureEventTrigger, required: true })
    })
  })
  const mutationName = `${typename[0].toLowerCase()}${typename.slice(1)}Create`
  builder.mutationField(mutationName, (t) =>
    t.withAuth({ $any: { isAuthenticated: true, isAnonymous: true } }).field({
      type: eventRef,
      nullable: false,
      args: { input: t.arg({ type: inputRef, required: true }) },
      resolve: (_parent, { input }, context) =>
        createCaptureEvent(context.user.id, typename, input)
    })
  )
}
