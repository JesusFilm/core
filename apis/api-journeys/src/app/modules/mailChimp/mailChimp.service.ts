import mailchimp from '@mailchimp/mailchimp_marketing'
import { Injectable } from '@nestjs/common'
import get from 'lodash/get'

import { User } from '@core/nest/common/firebaseClient'

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
      if (user.email == null)
        throw new Error('User must have an email to receive marketing emails')
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
        process.env.GIT_BRANCH !== 'main' &&
        get(error, 'response.body.detail') ===
          `${user.email} looks fake or invalid, please enter a real email address.`
      )
        return
      throw error
    }
  }
}
