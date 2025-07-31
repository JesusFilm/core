import { builder } from '../../builder'
import { EventInterface } from '../event'

// SignUpSubmissionEvent type
export const SignUpSubmissionEventRef = builder.prismaObject('Event', {
  interfaces: [EventInterface],
  variant: 'SignUpSubmissionEvent',
  isTypeOf: (obj: any) => obj.typename === 'SignUpSubmissionEvent',
  fields: (t) => ({
    email: t.exposeString('email', { nullable: true })
  })
})
