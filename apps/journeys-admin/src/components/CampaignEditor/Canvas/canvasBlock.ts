import type { CampaignTreeBlock } from '@core/journeys/ui/Campaign'

import { GetCampaign_campaign_blocks as CampaignBlock } from '../../../../__generated__/GetCampaign'

/** A campaign block as the canvas renders it: with its children as a tree. */
export type CanvasBlock = CampaignTreeBlock<CampaignBlock>
