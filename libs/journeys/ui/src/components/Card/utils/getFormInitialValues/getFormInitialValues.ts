import { FormikValues } from 'formik'

import { TreeBlock } from '../../../../libs/block'
import { getTextResponseBlocks } from '../getTextResponseBlocks'
/**
 * Calculates initial form values for all TextResponse blocks in a card
 * @param children - Card children blocks
 * @returns Object with TextResponse block ids as keys and empty string values
 */
export function getFormInitialValues(children: TreeBlock[]): FormikValues {
  const initialValues: FormikValues = {}

  const textResponseBlocks = getTextResponseBlocks(children)

  textResponseBlocks.forEach((block) => {
    initialValues[block.id] = ''
  })

  return initialValues
}
