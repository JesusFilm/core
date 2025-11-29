import { builder } from '../../builder'

export const PlausibleStatsTimeseriesFilter = builder.inputType(
  'PlausibleStatsTimeseriesFilter',
  {
    fields: (t) => ({
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
      filters: t.string({
        required: false,
        description:
          'See [filtering](https://plausible.io/docs/stats-api#filtering) section for more details.'
      }),
      interval: t.string({
        required: false,
        description:
          'Choose your reporting interval. Valid options are date (always) and month (when specified period is longer than one calendar month). Defaults to month for 6mo and 12mo, otherwise falls back to date.'
      })
    })
  }
)
