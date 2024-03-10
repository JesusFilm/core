import mailchimp from '@mailchimp/mailchimp_marketing'
import { Injectable } from '@nestjs/common'

interface UnderContactToAudienceParams {
  email: string
  firstName: string
  lastName: string
}

@Injectable()
export class MailChimpService {
  async upsertContactToAudience(
    user: UnderContactToAudienceParams
  ): Promise<void> {
    mailchimp.setConfig({
      apiKey: process.env.MAILCHIMP_MARKETING_API_KEY,
      server: process.env.MAILCHIMP_MARKETING_API_SERVER_PREFIX
    })
    if (process.env.MAILCHIMP_AUDIENCE_ID == null)
      throw new Error('Mailchimp Audience ID is undefined')
    // upsert operation
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
  }
}
