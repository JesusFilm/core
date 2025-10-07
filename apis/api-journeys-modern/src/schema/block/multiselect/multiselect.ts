import { builder } from '../../builder'
import { Block } from '../block'

export const MultiselectBlock = builder.prismaObject('Block', {
  interfaces: [Block],
  variant: 'MultiselectBlock',
  isTypeOf: (obj: any) => obj.typename === 'MultiselectBlock',
  shareable: true,
  fields: (t) => ({
    min: t.exposeInt('min', { nullable: true }),
    max: t.exposeInt('max', { nullable: true }),
    displayResults: t.boolean({
      nullable: true,
      description: 'Whether to display aggregated results after submission',
      // select ensures Prisma fetches the JSON column
      select: { settings: true },
      resolve: ({ settings }) => {
        const s = (settings as unknown as Record<string, unknown>) ?? {}
        const value = s.displayResults
        if (typeof value === 'boolean') return value
        return false
      }
    })
  })
})
