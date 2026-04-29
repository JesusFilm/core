import { builder } from '../builder'

import type { CustomDomainCheckResult } from './service'

interface VerificationShape {
  type: string
  domain: string
  value: string
  reason: string
}

interface VerificationResponseShape {
  code: string
  message: string
}

const CustomDomainVerification =
  builder.objectRef<VerificationShape>('CustomDomainVerification')

builder.objectType(CustomDomainVerification, {
  shareable: true,
  fields: (t) => ({
    type: t.exposeString('type', { nullable: false }),
    domain: t.exposeString('domain', { nullable: false }),
    value: t.exposeString('value', { nullable: false }),
    reason: t.exposeString('reason', { nullable: false })
  })
})

const CustomDomainVerificationResponse =
  builder.objectRef<VerificationResponseShape>(
    'CustomDomainVerificationResponse'
  )

builder.objectType(CustomDomainVerificationResponse, {
  shareable: true,
  fields: (t) => ({
    code: t.exposeString('code', { nullable: false }),
    message: t.exposeString('message', { nullable: false })
  })
})

export const CustomDomainCheck =
  builder.objectRef<CustomDomainCheckResult>('CustomDomainCheck')

builder.objectType(CustomDomainCheck, {
  shareable: true,
  fields: (t) => ({
    configured: t.exposeBoolean('configured', { nullable: false }),
    verified: t.exposeBoolean('verified', { nullable: false }),
    verification: t.field({
      type: [CustomDomainVerification],
      nullable: true,
      resolve: (parent) => parent.verification ?? null
    }),
    verificationResponse: t.field({
      type: CustomDomainVerificationResponse,
      nullable: true,
      resolve: (parent) => parent.verificationResponse ?? null
    })
  })
})
