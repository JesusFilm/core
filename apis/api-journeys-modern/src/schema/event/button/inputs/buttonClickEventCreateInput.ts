import { builder } from '../../../builder'
import { ButtonActionEnum } from '../enums'

export const ButtonClickEventCreateInput = builder.inputType(
  'ButtonClickEventCreateInput',
  {
    fields: (t) => ({
      id: t.id({
        required: false,
        description:
          'ID should be unique Event UUID (Provided for optimistic mutation result matching)'
      }),
      blockId: t.id({ required: true }),
      stepId: t.id({
        required: false,
        description: 'id of the parent stepBlock'
      }),
      label: t.string({
        required: false,
        description: 'stepName of the parent stepBlock'
      }),
      value: t.string({ required: false, description: 'label of the button' }),
      action: t.field({
        type: ButtonActionEnum,
        required: false,
        description: 'Action type of the button when it was clicked'
      }),
      actionValue: t.string({
        required: false,
        description: `The label for each corresponding action, mapping below: 
          NavigateToBlockAction - StepName (generated in client) of the StepBlock 
          LinkAction - url of the link`
      })
    })
  }
)
