import mailchimp from '@mailchimp/mailchimp_marketing'
import { Injectable } from '@nestjs/common'

import { User } from '@core/nest/common/firebaseClient'

@Injectable()
export class MailChimpService {
  async upsertContactToAudience(
    user: Pick<User, 'email' | 'firstName' | 'lastName'>
  ): Promise<void> {
    mailchimp.setConfig({
      apiKey: process.env.MAILCHIMP_MARKETING_API_KEY,
      server: process.env.MAILCHIMP_MARKETING_API_SERVER_PREFIX
    })

    try {
      // upsert operation
      await mailchimp.lists.setListMember(
        process.env.MAILCHIMP_AUDIENCE_ID as string,
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
    } catch (e) {
      console.log(e.message)
    }
  }
}
