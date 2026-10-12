import { ThemeMode } from '../../block/card/enums/themeMode'
import { builder } from '../../builder'
import { CampaignButtonRadius, CampaignRadius } from '../enums'

export const CampaignThemeUpdateInput = builder.inputType(
  'CampaignThemeUpdateInput',
  {
    description:
      'The Campaign Theme columns. Every field is optional: an omitted field leaves the stored value alone. The eight colour columns and the three enum columns are non-null, so null is rejected for them; a font set to null returns to the base theme default. Each change (and each Theme Preset application, which sends the mode and the eight colours together) is one Command in the editor.',
    fields: (t) => ({
      themeMode: t.field({
        type: ThemeMode,
        required: false,
        description: 'The MUI palette mode the theme is built on.'
      }),
      headerFont: t.string({
        required: false,
        description:
          'Google Fonts family from the shared curated list; null = the base theme default.'
      }),
      bodyFont: t.string({
        required: false,
        description:
          'Google Fonts family from the shared curated list; null = the base theme default.'
      }),
      labelFont: t.string({
        required: false,
        description:
          'Google Fonts family from the shared curated list; null = the base theme default.'
      }),
      primaryColor: t.string({
        required: false,
        description: 'Hex colour, stored as `#RRGGBB` uppercase.'
      }),
      accentColor: t.string({
        required: false,
        description: 'Hex colour, stored as `#RRGGBB` uppercase.'
      }),
      backgroundColor: t.string({
        required: false,
        description: 'Hex colour, stored as `#RRGGBB` uppercase.'
      }),
      surfaceColor: t.string({
        required: false,
        description: 'Hex colour, stored as `#RRGGBB` uppercase.'
      }),
      textColor: t.string({
        required: false,
        description: 'Hex colour, stored as `#RRGGBB` uppercase.'
      }),
      mutedColor: t.string({
        required: false,
        description: 'Hex colour, stored as `#RRGGBB` uppercase.'
      }),
      contrastBackgroundColor: t.string({
        required: false,
        description: 'Hex colour, stored as `#RRGGBB` uppercase.'
      }),
      contrastTextColor: t.string({
        required: false,
        description: 'Hex colour, stored as `#RRGGBB` uppercase.'
      }),
      radius: t.field({
        type: CampaignRadius,
        required: false,
        description: 'Corner radius: square, slight, rounded or veryRounded.'
      }),
      buttonRadius: t.field({
        type: CampaignButtonRadius,
        required: false,
        description: 'Button shape: rounded or pill.'
      })
    })
  }
)
