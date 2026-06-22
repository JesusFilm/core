import { builder } from '../builder'

export const JourneyCustomizationFieldRef = builder.prismaObject(
  'JourneyCustomizationField',
  {
    shareable: true,
    fields: (t) => ({
      id: t.exposeID('id', { nullable: false }),
      journeyId: t.exposeID('journeyId', { nullable: false }),
      key: t.exposeString('key', { nullable: false }),
      value: t.exposeString('value', { nullable: true }),
      defaultValue: t.exposeString('defaultValue', { nullable: true })
    })
  }
)
