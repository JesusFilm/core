import { PowerBiEmbed } from '../../lib/powerBi/getPowerBiEmbed'
import { builder } from '../builder'

export const PowerBiEmbedRef = builder
  .objectRef<PowerBiEmbed>('PowerBiEmbed')
  .implement({
    shareable: true,
    fields: (t) => ({
      reportId: t.exposeString('reportId', { nullable: false }),
      reportName: t.exposeString('reportName', { nullable: false }),
      embedUrl: t.exposeString('embedUrl', { nullable: false }),
      accessToken: t.exposeString('accessToken', { nullable: false }),
      expiration: t.exposeString('expiration', { nullable: false })
    })
  })
