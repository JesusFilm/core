import { TEXT_CAPS, assertLengthOrNull } from '../validation'

export type SectionTextField =
  | 'eyebrow'
  | 'title'
  | 'lede'
  | 'intro'
  | 'content'

export const SECTION_TEXT_CAPS: Record<SectionTextField, number> = {
  eyebrow: TEXT_CAPS.eyebrow,
  title: TEXT_CAPS.title,
  lede: TEXT_CAPS.lede,
  intro: TEXT_CAPS.intro,
  content: TEXT_CAPS.richTextContent
}

/**
 * The typed body text of a section: each given field trimmed and capped
 * (eyebrow 80, title 150, lede and intro 500, rich text content 5000); empty is allowed everywhere;
 * omitted fields are left untouched. `BAD_USER_INPUT` names the field.
 */
export function validateSectionText<F extends SectionTextField>(
  input: Partial<Record<F, string | null | undefined>>,
  fields: readonly F[]
): Partial<Record<F, string | null>> {
  const data: Partial<Record<F, string | null>> = {}
  for (const field of fields) {
    const value = input[field]
    if (value === undefined) continue
    data[field] = assertLengthOrNull(value, field, SECTION_TEXT_CAPS[field])
  }
  return data
}
