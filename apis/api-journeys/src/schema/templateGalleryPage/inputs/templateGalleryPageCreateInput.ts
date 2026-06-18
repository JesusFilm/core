import { builder } from '../../builder'

export const TemplateGalleryPageCreateInput = builder.inputType(
  'TemplateGalleryPageCreateInput',
  {
    description:
      'Input for creating a new TemplateGalleryPage in `draft` status. The slug is server-generated from `title`.',
    fields: (t) => ({
      teamId: t.id({
        required: true,
        description: 'Owning team. Caller must be a member.'
      }),
      title: t.string({
        required: true,
        description:
          'Display title. Drives slug auto-generation: lowercased + hyphenated form of the title, max 200 characters, with the reserved-word list (`admin`, `api`, `app`, `auth`, `graphql`, `health`, `journey`, `journeys`, `public`, `sign-in`, `sign-up`, `static`, `templates`, `webhook`, `webhooks`) blocked. On collision the resolver tries `<base>-2`..`<base>-50`, then falls back to a 6-character random suffix.'
      }),
      description: t.string({
        required: false,
        description:
          'Optional long-form description shown on the public page. Defaults to empty string when omitted.'
      }),
      creatorName: t.string({
        required: true,
        description: 'Display name of the page creator.'
      }),
      creatorImageSrc: t.string({
        required: false,
        description:
          'Optional https URL of the creator avatar image. Rejected if not https.'
      }),
      creatorImageAlt: t.string({
        required: false,
        description: 'Optional alt text for the creator avatar.'
      }),
      mediaUrl: t.string({
        required: false,
        description:
          'Optional https URL of a hero/cover media asset. Rejected if not https.'
      }),
      journeyIds: t.idList({
        required: false,
        description:
          'Optional initial template journeys to attach. Cross-team and non-template ids are silently filtered out.'
      })
    })
  }
)
