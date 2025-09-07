import { builder } from '../../../builder'

interface ShortLinkDomainVerificationType {
  type: string
  domain: string
  value: string
  reason: string
}

export interface ShortLinkDomainCheckType {
  configured: boolean
  verified: boolean
  verification: ShortLinkDomainVerificationType[]
}

const ShortLinkDomainVerificationRef = builder
  .objectRef<ShortLinkDomainVerificationType>('ShortLinkDomainVerification')
  .implement({
    fields: (t) => ({
      type: t.exposeString('type', {
        nullable: false,
        description: 'Type of verification'
      }),
      domain: t.exposeString('domain', {
        nullable: false,
        description: 'Domain name'
      }),
      value: t.exposeString('value', {
        nullable: false,
        description: 'Value of the verification'
      }),
      reason: t.exposeString('reason', {
        nullable: false,
        description: 'Reason for the verification'
      })
    })
  })

export const ShortLinkDomainCheckRef = builder
  .objectRef<ShortLinkDomainCheckType>('ShortLinkDomainCheck')
  .implement({
    fields: (t) => ({
      configured: t.exposeBoolean('configured', {
        nullable: false,
        description:
          'Is the domain correctly configured in the DNS? If false, A Record and CNAME Record should be added by the user.'
      }),
      verified: t.exposeBoolean('verified', {
        nullable: false,
        description:
          'Does the domain belong to the short link application? If false, verification will be populated.'
      }),
      verification: t.expose('verification', {
        type: [ShortLinkDomainVerificationRef],
        nullable: false,
        description:
          'Verification records to be added to the DNS to confirm ownership.'
      })
    })
  })
