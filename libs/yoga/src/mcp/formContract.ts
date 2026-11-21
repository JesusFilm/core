import { z } from 'zod'

import { responseFields } from './formContent'
import { iconValue, plainText } from './presentationContract'
import {
  actionValue,
  blockReference,
  localKey,
  placement
} from './structureContract'

const changed = (value: Record<string, unknown>) =>
  Object.keys(value).some((key) => !['type', 'block', 'locale'].includes(key))
const bounds = {
  min: z.number().int().min(0).max(2147483647).nullable().optional(),
  max: z.number().int().min(0).max(2147483647).nullable().optional()
}
const optionAdd = {
  key: localKey,
  question: blockReference,
  label: plainText,
  placement
}
export const formCommand = z.discriminatedUnion('type', [
  z
    .object({
      type: z.literal('poll_set'),
      block: blockReference,
      gridView: z.boolean()
    })
    .strict(),
  z
    .object({
      type: z.literal('multiselect_set'),
      block: blockReference,
      ...bounds
    })
    .strict()
    .refine(changed),
  z
    .object({
      type: z.literal('response_set'),
      block: blockReference,
      ...responseFields
    })
    .strict()
    .refine(changed),
  z
    .object({
      type: z.literal('signup_set'),
      block: blockReference,
      submitLabel: plainText
    })
    .strict(),
  z
    .object({
      type: z.literal('signup_icon_set'),
      block: blockReference,
      ...iconValue.shape,
      name: iconValue.shape.name.optional()
    })
    .strict()
    .refine(changed),
  z
    .object({
      type: z.literal('poll_option_add'),
      ...optionAdd,
      action: actionValue.optional()
    })
    .strict(),
  z
    .object({ type: z.literal('multiselect_option_add'), ...optionAdd })
    .strict(),
  z
    .object({
      type: z.literal('poll_option_set'),
      block: blockReference,
      label: plainText
    })
    .strict(),
  z
    .object({
      type: z.literal('multiselect_option_set'),
      block: blockReference,
      label: plainText
    })
    .strict(),
  z
    .object({ type: z.literal('poll_option_remove'), block: blockReference })
    .strict(),
  z
    .object({
      type: z.literal('multiselect_option_remove'),
      block: blockReference
    })
    .strict(),
  z
    .object({
      type: z.literal('options_reorder'),
      question: blockReference,
      options: z.array(blockReference).max(200)
    })
    .strict(),
  z
    .object({
      type: z.literal('form_destination_set'),
      block: blockReference,
      integrationId: z.string().min(1).max(200).nullable(),
      routeId: z.string().min(1).max(200).nullable().optional()
    })
    .strict()
    .refine((value) => value.integrationId !== null || value.routeId == null)
])
export type FormCommand = z.infer<typeof formCommand>
export const formCommandNames = formCommand.options.map(
  (schema) => schema.shape.type.value
)
export function isFormCommand(command: {
  type: string
}): command is FormCommand {
  return formCommandNames.some((name) => name === command.type)
}
export const formCommandRegistry = Object.fromEntries(
  formCommandNames.map((type) => [
    type,
    {
      schema: formCommand.options.find(
        (schema) => schema.shape.type.value === type
      ),
      handler: 'forms',
      requiredRole: 'journey:update',
      requiredGrant: 'journeys:edit',
      sourceChecks: [
        'ordinary-draft',
        'actual-parent-chain',
        'current-team-integration-route'
      ],
      inverseType: 'structure_restore',
      dependencies: [
        'journey-revision',
        'actual-parent-chain',
        'affected-state',
        'current-integration-route'
      ],
      writeSet: formWriteSets(type),
      preserved: [
        'Host',
        'unrequested-routes',
        'unrelated-fields',
        'visitor-responses',
        'credentials'
      ],
      effects: ['journey_content_changed']
    }
  ])
)

function formWriteSets(type: FormCommand['type']): readonly string[] {
  if (type === 'poll_set') return ['gridView']
  if (type === 'multiselect_set') return ['min', 'max']
  if (type === 'response_set')
    return [
      'label',
      'placeholder',
      'hint',
      'required',
      'hideLabel',
      'minRows',
      'type',
      'integrationId',
      'routeId'
    ]
  if (type === 'form_destination_set') return ['integrationId', 'routeId']
  if (type === 'signup_set') return ['submitLabel']
  if (type === 'signup_icon_set')
    return ['submitIconId', 'name', 'color', 'owned-icons']
  if (type.endsWith('_add')) return ['created', 'parentOrder', 'action']
  if (type.endsWith('_remove'))
    return ['deletedAt', 'parentOrder', 'min', 'max']
  if (type === 'options_reorder') return ['parentOrder']
  return ['label']
}
export const formChangedFields = [
  'gridView',
  'label',
  'placeholder',
  'hint',
  'required',
  'hideLabel',
  'minRows',
  'type',
  'integrationId',
  'routeId',
  'submitLabel',
  'name',
  'color'
] as const
