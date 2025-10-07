import { prisma } from '@core/prisma/journeys/client'

import { builder } from '../../builder'

builder.queryField('multiselectResults', (t) =>
  t.field({
    description:
      'Returns an object keyed by option block id with rounded percentage values (public, no auth).',
    type: 'Json',
    nullable: false,
    args: {
      blockId: t.arg.id({ required: true })
    },
    resolve: async (_parent, { blockId }) => {
      const [events, options, total] = await Promise.all([
        prisma.event.findMany({
          where: {
            typename: 'MultiselectSubmissionEvent',
            blockId
          },
          select: { value: true }
        }),
        prisma.block.findMany({
          where: {
            parentBlockId: blockId,
            typename: 'MultiselectOptionBlock',
            deletedAt: null
          },
          select: { id: true, label: true }
        }),
        prisma.event.count({
          where: {
            typename: 'MultiselectSubmissionEvent',
            blockId
          }
        })
      ])

      const totalEvents = total
      const labelToId = new Map<string, string>()
      for (const opt of options) {
        if (opt.label) labelToId.set(opt.label, opt.id)
      }

      const counts = new Map<string, number>()
      for (const opt of options) counts.set(opt.id, 0)

      for (const ev of events) {
        const raw = ev.value ?? ''
        if (raw === '') continue
        const selected = raw
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
        for (const sel of selected) {
          const optId = labelToId.get(sel)
          if (!optId) continue
          counts.set(optId, (counts.get(optId) ?? 0) + 1)
        }
      }

      const result: Record<string, number> = {}
      for (const opt of options) {
        const count = counts.get(opt.id) ?? 0
        const pct =
          totalEvents > 0 ? Math.round((count / totalEvents) * 100) : 0
        result[opt.id] = pct
      }

      return result
    }
  })
)
