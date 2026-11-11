import { builder } from '../../builder'

export const ShortLinkDestinationHistory = builder.prismaObject(
  'ShortLinkDestinationHistory',
  {
    description:
      'A change to a short link destination — the accountability record for links embedded in published assets',
    fields: (t) => ({
      id: t.exposeID('id', { nullable: false }),
      shortLinkId: t.exposeString('shortLinkId', { nullable: false }),
      from: t.exposeString('from', { nullable: false }),
      to: t.exposeString('to', { nullable: false }),
      changedBy: t.exposeString('changedBy', {
        nullable: true,
        description: 'user id (or calling service name) that made the change'
      }),
      changedAt: t.expose('changedAt', { type: 'DateTime', nullable: false }),
      note: t.exposeString('note', { nullable: true })
    })
  }
)
