import { builder } from '../../builder'

export const PlausibleStatsBreakdownFilter = builder.inputType(
  'PlausibleStatsBreakdownFilter',
  {
    fields: (t) => ({
      property: t.string({
        required: true,
        description:
          'Which [property](https://plausible.io/docs/stats-api#properties) to break down the stats by.'
      }),
      period: t.string({
        required: false,
        description:
          'See [time periods](https://plausible.io/docs/stats-api#time-periods).\nIf not specified, it will default to 30d.'
      }),
      date: t.string({
        required: false,
        description:
          'date in the standard ISO-8601 format (YYYY-MM-DD).\nWhen using a custom range, the date parameter expects two ISO-8601 formatted dates joined with a comma e.g `2021-01-01,2021-01-31`. Stats will be returned for the whole date range inclusive of the start and end dates.'
      }),
      limit: t.int({
        required: false,
        description:
          'Limit the number of results. Maximum value is 1000. Defaults to 100.\nIf you want to get more than 1000 results, you can make multiple requests and paginate the results by specifying the page parameter (e.g. make the same request with page=1, then page=2, etc).'
      }),
      page: t.int({
        required: false,
        description:
          'Number of the page, used to paginate results. Importantly, the page numbers start from 1 not 0.'
      }),
      filters: t.string({
        required: false,
        description:
          'See [filtering](https://plausible.io/docs/stats-api#filtering) section for more details.'
      })
    })
  }
)
