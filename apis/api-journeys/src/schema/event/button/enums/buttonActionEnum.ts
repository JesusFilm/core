import { ButtonAction } from '@core/prisma/journeys/client'

import { builder } from '../../../builder'

export const ButtonActionEnum = builder.enumType('ButtonAction', {
  values: Object.values(ButtonAction)
})
