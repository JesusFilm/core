import { ButtonAction } from '.prisma/api-journeys-modern-client'

import { builder } from '../../../builder'

export const ButtonActionEnum = builder.enumType('ButtonAction', {
  values: Object.values(ButtonAction)
})
