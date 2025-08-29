import { builder } from '../../builder'

export const JourneysQueryOptions = builder.inputType('JourneysQueryOptions', {
  fields: (t) => ({
    hostname: t.string({
      required: false,
      description:
        'hostname filters journeys to those that belong to a team with a custom domain matching the hostname.'
    }),
    embedded: t.boolean({
      required: false,
      description: 'is this being requested from an embed url'
    }),
    journeyCollection: t.boolean({
      required: false,
      description:
        'limit results to journeys in a journey collection (currently only available when using hostname option)'
    })
  })
})
