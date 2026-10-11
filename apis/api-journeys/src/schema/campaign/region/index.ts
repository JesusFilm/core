import './inputs'
import './campaignRegionCreate.mutation'
import './campaignRegionUpdate.mutation'
import './campaignRegionOrderUpdate.mutation'
import './campaignRegionDelete.mutation'
import './campaignRegionCountryAdd.mutation'
import './campaignRegionCountryRemove.mutation'

export {
  INCLUDE_CAMPAIGN_REGION_ACL,
  NEW_REGION_NAME,
  authorizeRegionCreate,
  authorizeRegionUpdate
} from './service'
