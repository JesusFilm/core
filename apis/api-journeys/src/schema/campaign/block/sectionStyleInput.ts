import { builder } from '../../builder'
import { CampaignBackgroundKind, CampaignBackgroundOverlay } from '../enums'

type InputFieldBuilder = Parameters<
  Parameters<typeof builder.inputType>[1]['fields']
>[0]

/**
 * The nine shared section fields (the Section Background and the five colour
 * overrides) as input fields, spread into every section update input and
 * both chrome update inputs so the section contract is declared once.
 */
export function sectionStyleInputFields(t: InputFieldBuilder) {
  return {
    backgroundKind: t.field({
      type: CampaignBackgroundKind,
      required: false,
      description:
        'The Section Background kind. Explicit: switching kind leaves backgroundColor and the cover in place.'
    }),
    backgroundColor: t.string({
      required: false,
      description:
        'Read when backgroundKind is `custom`. `#RGB` or `#RRGGBB`, stored as `#RRGGBB` uppercase; null clears.'
    }),
    coverBlockId: t.id({
      required: false,
      description:
        'The owned CampaignImageBlock read when backgroundKind is `image`; null clears.'
    }),
    backgroundOverlay: t.field({
      type: CampaignBackgroundOverlay,
      required: false,
      description:
        'Overlay strength over an image background; null means medium.'
    }),
    headingColor: t.string({
      required: false,
      description: '`#RRGGBB` or null to inherit.'
    }),
    textColor: t.string({
      required: false,
      description: '`#RRGGBB` or null to inherit.'
    }),
    buttonColor: t.string({
      required: false,
      description: '`#RRGGBB` or null to inherit.'
    }),
    buttonTextColor: t.string({
      required: false,
      description: '`#RRGGBB` or null to inherit.'
    }),
    accentColor: t.string({
      required: false,
      description: '`#RRGGBB` or null to inherit.'
    })
  }
}

export const SECTION_STYLE_ERRORS =
  '- BAD_USER_INPUT (field: `backgroundKind`): not none, surface, contrast, primary, custom or image.\n- BAD_USER_INPUT (field: `backgroundOverlay`): not light, medium or heavy.\n- BAD_USER_INPUT (field: `backgroundColor` / `headingColor` / `textColor` / `buttonColor` / `buttonTextColor` / `accentColor`): not a hex colour (empty is never a colour; null clears).\n- BAD_USER_INPUT (field: `coverBlockId`): not a live CampaignImageBlock owned by this section.'
