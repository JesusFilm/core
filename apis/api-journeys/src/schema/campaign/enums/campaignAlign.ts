import { CampaignAlign } from '@core/prisma/journeys/client'

/** Every `CampaignAlign` value, for `assertEnum`. The GraphQL side reuses `TypographyAlign`. */
export const CAMPAIGN_ALIGNS = Object.values(CampaignAlign)
