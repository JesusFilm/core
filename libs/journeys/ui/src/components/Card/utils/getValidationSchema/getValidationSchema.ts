import { TFunction } from 'next-i18next'
import { array, object, string } from 'yup'

import { TextResponseType } from '../../../../../__generated__/globalTypes'
import { TreeBlock } from '../../../../libs/block'
import { BlockFields_MultiselectBlock as MultiselectBlock } from '../../../../libs/block/__generated__/BlockFields'
import { TextResponseFields } from '../../../TextResponse/__generated__/TextResponseFields'
import { getMultiselectBlocks } from '../getMultiselectBlocks'
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
  // Use a broad schema record to support both string and array validations
  const validationSchema: Record<string, any> = {}
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

  // Multiselect validations: enforce min and max when provided
  const multiselectBlocks: Array<TreeBlock<MultiselectBlock>> =
    getMultiselectBlocks(children)
  multiselectBlocks.forEach((block) => {
    const min = block.min
    const max = block.max

    // Only build schema if either min or max is set
    if (typeof min === 'number' && min > 0) {
      const base = array().of(string())
      const withMin = base.min(
        min,
        t('Select at least {{count}} options.', { count: min })
      )
      validationSchema[block.id] =
        typeof max === 'number' && max > 0
          ? withMin.max(
              max,
              t('Select up to {{count}} options.', { count: max })
            )
          : withMin
      return
    }

    if (typeof max === 'number' && max > 0) {
      validationSchema[block.id] = array()
        .of(string())
        .max(max, t('Select up to {{count}} options.', { count: max }))
    }
  })

  return object().shape(validationSchema)
}
