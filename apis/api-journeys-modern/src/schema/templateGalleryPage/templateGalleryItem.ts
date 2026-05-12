import { ImageBlock } from '../block/image/image'
import { builder } from '../builder'
import { Language } from '../language'

// Narrow public DTO for the templates assigned to a TemplateGalleryPage.
// Intentionally NOT the full Journey type: `templateGalleryPageBySlug` is
// the first PublicContext-serving resolver in api-journeys-modern, and
// returning `JourneyRef` here would expose Journey's full federated surface
// — including transitively-reachable fields like `userJourneys` and
// `team.userTeams` that the modern subgraph's Pothos `t.relation`
// auto-resolvers serve without auth scopes.
//
// This DTO exposes only the eight scalars plus `language` and
// `primaryImageBlock` that the public gallery renderer actually queries
// (apps/journeys/src/libs/getTemplateGalleryPage/getTemplateGalleryPage.ts
// on PR #9144). Adding a field here requires re-checking the public-
// context exposure rationale.
//
// Implementation note: this is a prismaObject backed by the Journey model
// (Pothos resolves the relations through Prisma's `select`/`include`), but
// the GraphQL type is a separate object — `TemplateGalleryItem` — so the
// federation surface for the public path is narrow.
export const TemplateGalleryItemRef = builder.prismaObject('Journey', {
  variant: 'TemplateGalleryItem',
  description:
    'A template journey assigned to a TemplateGalleryPage, narrowed to the fields the public renderer consumes. Backed by the underlying Journey row but exposed as a separate type so the public anonymous query surface cannot traverse to Journey-wide relations (userJourneys, team, blocks, etc.).',
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false }),
    title: t.exposeString('title', { nullable: false }),
    description: t.exposeString('description', { nullable: true }),
    slug: t.exposeString('slug', { nullable: false }),
    createdAt: t.expose('createdAt', { type: 'DateTime', nullable: false }),
    template: t.exposeBoolean('template', { nullable: true }),
    customizable: t.exposeBoolean('customizable', { nullable: true }),
    website: t.exposeBoolean('website', { nullable: true }),
    language: t.field({
      type: Language,
      nullable: false,
      resolve: (journey) => ({ id: journey.languageId ?? '529' })
    }),
    primaryImageBlock: t.relation('primaryImageBlock', {
      nullable: true,
      type: ImageBlock
    })
  })
})
