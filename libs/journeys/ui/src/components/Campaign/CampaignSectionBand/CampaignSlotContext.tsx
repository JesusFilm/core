import { createContext, useContext } from 'react'

/**
 * True below a Column Slot. A slot is not a container: the section it holds
 * drops the page container and its large vertical rhythm, and a section with
 * a background of its own is padded and rounded instead.
 */
export const CampaignSlotContext = createContext(false)

export function useCampaignSlot(): boolean {
  return useContext(CampaignSlotContext)
}
