import { builder } from '../../builder'

import { TemplateGalleryPageMediaInput } from './templateGalleryPageMediaInput'

// Deliberately omits status, publishedAt, id, teamId, createdAt, updatedAt — those are
// either immutable or transitioned via dedicated mutations (templateGalleryPagePublish).
export const TemplateGalleryPageUpdateInput = builder.inputType(
  'TemplateGalleryPageUpdateInput',
  {
    description:
      'Input for editing a TemplateGalleryPage. Field omitted = leave the existing value alone. Field set to `null` = clear (only meaningful for nullable fields).',
    fields: (t) => ({
      title: t.string({
        required: false,
        description:
          'Updated display title. Does NOT regenerate the slug — use `slug` to change the slug.'
      }),
      description: t.string({
        required: false,
        description: 'Updated long-form description.'
      }),
      slug: t.string({
        required: false,
        description:
          'Updated public slug. Must match `^[a-z0-9]+(-[a-z0-9]+)*$`, max 200 characters, not be in the reserved list, and not be in use by another page. Changing the slug breaks any external links to the old URL.'
      }),
      creatorName: t.string({
        required: false,
        description: 'Updated creator display name.'
      }),
      creatorImageSrc: t.string({
        required: false,
        description:
          'Optional https creator avatar URL. Pass `null` to clear. Rejected if not https.'
      }),
      creatorImageAlt: t.string({
        required: false,
        description: 'Optional creator avatar alt text. Pass `null` to clear.'
      }),
      // Not @deprecated: the legacy apollo CLI used by 5 frontend codegen
      // targets predates @deprecated on INPUT_FIELD_DEFINITION and fails to
      // load any schema containing it, so the deprecation lives in the
      // description instead. Remove this field together with the @deprecated
      // TemplateGalleryPage.mediaUrl output field.
      mediaUrl: t.string({
        required: false,
        description:
          'Deprecated: superseded by the `media` input (NES-1704); will be removed together with the deprecated `TemplateGalleryPage.mediaUrl` field. Optional https hero media URL. Pass `null` to clear. Rejected if not https.'
      }),
      journeyIds: t.idList({
        required: false,
        description:
          "When provided, replaces the page's template list with these journeys in this exact order (existing assignments are deleted then recreated). Cross-team and non-template ids are silently filtered out. Omit to leave the template list unchanged."
      }),
      media: t.field({
        type: TemplateGalleryPageMediaInput,
        required: false,
        description:
          'Embedded media. Omit to leave the existing media unchanged; pass `null` to clear it (deletes the media row); pass an object to replace it (validated and normalized per `type`).'
      })
    })
  }
)
