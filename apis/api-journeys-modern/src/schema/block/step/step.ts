import { builder } from '../../builder'
import { Block } from '../block'

export const StepBlock = builder.prismaObject('Block', {
  interfaces: [Block],
  variant: 'StepBlock',
  isTypeOf: (obj: any) => obj.typename === 'StepBlock',
  directives: { key: { fields: 'id' } },
  shareable: true,
  fields: (t) => ({
    locked: t.boolean({
      nullable: false,
      directives: { shareable: true },
      description: `locked will be set to true if the user should not be able to manually
advance to the next step.`,
      resolve: (block) => block.locked ?? false
    }),
    nextBlockId: t.exposeID('nextBlockId', {
      nullable: true,
      directives: { shareable: true },
      description: `nextBlockId contains the preferred block to navigate to, users will have to
manually set the next block they want to card to navigate to`
    }),
    x: t.exposeInt('x', {
      nullable: true,
      directives: { shareable: true },
      description: `x is used to position the block horizontally in the journey flow diagram on
the editor.`
    }),
    y: t.exposeInt('y', {
      nullable: true,
      directives: { shareable: true },
      description: `y is used to position the block vertically in the journey flow diagram on
the editor.`
    }),
    slug: t.exposeString('slug', {
      nullable: true,
      directives: { shareable: true },
      description: `Slug should be unique amongst all blocks
(server will throw BAD_USER_INPUT error if not)
If not required will use the current block id
If the generated slug is not unique the uuid will be placed
at the end of the slug guaranteeing uniqueness`
    })
  })
})
