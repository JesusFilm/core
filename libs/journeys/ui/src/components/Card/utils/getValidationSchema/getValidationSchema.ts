import { TFunction } from 'next-i18next'
import { object, string } from 'yup'

import { TextResponseType } from '../../../../../__generated__/globalTypes'
import { TreeBlock } from '../../../../libs/block'
import { TextResponseFields } from '../../../TextResponse/__generated__/TextResponseFields'
import { getTextResponseBlocks } from '../getTextResponseBlocks'

/**
 * Builds a Yup validation schema for TextResponse blocks in a card
 * @param children - Card children blocks
 * @param t - Translation function
 * @returns Yup validation schema object
 */
export function getValidationSchema(
  children: TreeBlock[],
  t: TFunction
): ReturnType<typeof object> {
  const validationSchema: Record<string, ReturnType<typeof string>> = {}
  const textResponseBlocks = getTextResponseBlocks(children) as Array<
    TreeBlock<TextResponseFields>
  >

  textResponseBlocks.forEach((block) => {
    let fieldSchema = string()

    if (block.required === true) {
      fieldSchema = fieldSchema.required(t('This field is required'))
    }

    if (block.type === TextResponseType.name) {
      fieldSchema = fieldSchema
        .min(2, t('Name must be 2 characters or more'))
        .max(50, t('Name must be 50 characters or less'))
    }

    if (block.type === TextResponseType.email) {
      fieldSchema = fieldSchema.email(t('Please enter a valid email address'))
    }

    validationSchema[block.id] = fieldSchema
  })

  return object().shape(validationSchema)
}
