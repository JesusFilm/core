import mailchimp from '@mailchimp/mailchimp_marketing'
import { Injectable } from '@nestjs/common'

import { User } from '@core/nest/common/firebaseClient'
import get from 'lodash/get'

@Injectable()
export class MailChimpService {
  async syncUser(user: User): Promise<void> {
    try {
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
    } catch (error) {
      if (
        process.env.NODE_ENV !== 'production' &&
        get(error, 'response.body.detail') ===
          `${user.email} looks fake or invalid, please enter a real email address.`
      )
        return
      throw error
    }
  }
}
