import { builder } from '../../../builder'

export const ContactActionType = builder.enumType('ContactActionType', {
  values: {
    call: {
      value: 'call'
    },
    text: {
      value: 'text'
    }
  }
})
