import { BLOCK_CAP_ERROR, CLIENT_ID_ERROR } from '../../validation'

import { InputFieldBuilder } from './sectionStyleInput'

export const SECTION_PARENT_BLOCK_ID_DESCRIPTION =
  'A Column Slot to create the section in, instead of at the page’s top level; `parentOrder` is then ignored. The slot must be empty on the same page.'

/**
 * The five placement fields every section create input opens with (`id`,
 * `campaignId`, `pageId`, `parentBlockId`, `parentOrder`), so the section
 * create contract is declared once. A type that narrows the page or the slot
 * passes its own description. The Image section's two-role input declares
 * its own.
 */
export function sectionCreateInputFields(
  t: InputFieldBuilder,
  descriptions: { pageId?: string; parentBlockId?: string } = {}
) {
  return {
    id: t.id({ required: false }),
    campaignId: t.id({ required: true }),
    pageId: t.id({
      required: true,
      description: descriptions.pageId ?? 'A page of the campaign.'
    }),
    parentBlockId: t.id({
      required: false,
      description:
        descriptions.parentBlockId ?? SECTION_PARENT_BLOCK_ID_DESCRIPTION
    }),
    parentOrder: t.int({
      required: false,
      description:
        'Position among the page’s sections; appended when omitted or past the end.'
    })
  }
}

/** The `pageId` description of a section the landing page refuses. */
export const REGION_PAGE_ID_DESCRIPTION =
  'The Region Page; refused on the landing page.'

/**
 * A section create's `Errors:` description, with `parentBlockIdError` as its
 * one `parentBlockId` line: a column slot for a section, an owner for the
 * image create's owned role.
 */
export function sectionCreateErrors(parentBlockIdError: string): string {
  return (
    'Auth: campaign Update — any member or manager of the campaign’s team.\n\nErrors:\n- NOT_FOUND: campaignId does not resolve.\n- FORBIDDEN: caller is not in the team.\n- BAD_USER_INPUT (field: `pageId`): not a page of this campaign.\n- BAD_USER_INPUT (field: `parentOrder`): negative.\n' +
    `- BAD_USER_INPUT (field: \`parentBlockId\`): ${parentBlockIdError}\n` +
    `${CLIENT_ID_ERROR}\n${BLOCK_CAP_ERROR}`
  )
}

export const SECTION_CREATE_ERRORS = sectionCreateErrors(
  'not a live column slot on the page, already holding a section, or the section is a Columns or Region Share section.'
)
