import {
  TRANSLATED_FIELDS,
  type TranslatedBlockField,
  type TranslatedBlockTypename,
  type TranslatedFieldName
} from '@core/journeys/ui/Campaign/libs/translatedField'

import { assertLengthOrNull } from '../validation'

/**
 * The typed body text of a section, read from its typename's field
 * declaration (`TRANSLATED_FIELDS`): each declared field the input gives is
 * trimmed and capped; empty is allowed everywhere; omitted fields are left
 * untouched. `BAD_USER_INPUT` names the field.
 */
export function validateSectionText<T extends TranslatedBlockTypename>(
  typename: T,
  input: Partial<Record<TranslatedBlockField<T>, string | null | undefined>>
): Partial<Record<TranslatedBlockField<T>, string | null>> {
  const caps: Partial<Record<TranslatedFieldName, number>> =
    TRANSLATED_FIELDS.block[typename]
  const data: Partial<Record<TranslatedBlockField<T>, string | null>> = {}
  for (const field of Object.keys(caps) as Array<TranslatedBlockField<T>>) {
    const value = input[field]
    const cap = caps[field]
    if (value === undefined || cap == null) continue
    data[field] = assertLengthOrNull(value, field, cap)
  }
  return data
}
