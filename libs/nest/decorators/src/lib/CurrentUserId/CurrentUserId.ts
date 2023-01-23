import { createParamDecorator } from '@nestjs/common'
import { get } from 'lodash'
import { AuthenticationError } from 'apollo-server-errors'
import { firebaseClient } from '@core/nest/common/firebaseClient'

export const CurrentUserId = createParamDecorator(async (data, context) => {
  const token = get(context.headers, 'Authorization')
  const { uid } = await firebaseClient.auth().verifyIdToken(token)
  if (uid == null) throw new AuthenticationError('Token is invalid')
  return uid
})
