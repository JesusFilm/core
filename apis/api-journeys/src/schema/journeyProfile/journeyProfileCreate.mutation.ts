import mailchimp from '@mailchimp/mailchimp_marketing'

import { prisma } from '@core/prisma/journeys/client'

import { builder } from '../builder'
import { logger } from '../logger'

import { JourneyProfileRef } from './journeyProfile'

async function syncMailChimp(user: {
  email?: string | null
  firstName: string
  lastName?: string
}): Promise<void> {
  try {
    mailchimp.setConfig({
      apiKey: process.env.MAILCHIMP_MARKETING_API_KEY,
      server: process.env.MAILCHIMP_MARKETING_API_SERVER_PREFIX
    })
    if (process.env.MAILCHIMP_AUDIENCE_ID == null)
      throw new Error('Mailchimp Audience ID is undefined')
    if (user.email == null)
      throw new Error('User must have an email to receive marketing emails')

    await mailchimp.lists.setListMember(
      process.env.MAILCHIMP_AUDIENCE_ID,
      user.email,
      {
        email_address: user.email,
        status_if_new: 'subscribed',
        merge_fields: {
          FNAME: user.firstName,
          LNAME: user.lastName
        }
      }
    )
  } catch (error) {
    const detail = (error as any)?.response?.body?.detail
    if (
      process.env.GIT_BRANCH !== 'main' &&
      detail ===
        `${user.email} looks fake or invalid, please enter a real email address.`
    )
      return
    throw error
  }
}

builder.mutationField('journeyProfileCreate', (t) =>
  t
    .withAuth({ $any: { isAuthenticated: true, isAnonymous: true } })
    .prismaField({
      type: JourneyProfileRef,
      nullable: false,
      resolve: async (query, _parent, _args, context) => {
        const existing = await prisma.journeyProfile.findUnique({
          where: { userId: context.user.id }
        })

        if (existing != null) {
          return prisma.journeyProfile.findUniqueOrThrow({
            ...query,
            where: { id: existing.id }
          })
        }

        const created = await prisma.journeyProfile.create({
          ...query,
          data: {
            userId: context.user.id,
            acceptedTermsAt: new Date()
          }
        })

        void syncMailChimp(context.user).catch((err) =>
          logger.error(err, 'failed to sync user to MailChimp')
        )

        return created
      }
    })
)
