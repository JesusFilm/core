import { type Page, expect } from '@playwright/test'

import {
  type DiscoverListType,
  type DiscoverStatus,
  getBaseUrl,
  getDiscoverListUrl
} from './helpers'

const statusTabTimeout = 60000

export type DiscoverListContext = DiscoverListType | 'publisher'
export type StatusTabLabel = 'Active' | 'Archived' | 'Trash'

const statusTabToQueryParam: Record<StatusTabLabel, DiscoverStatus> = {
  Active: 'active',
  Archived: 'archived',
  Trash: 'trashed'
}

function journeyStatusTabs(page: Page) {
  return page.getByRole('tablist', { name: 'journey status tabs' })
}

function getListUrl(
  baseUrl: string,
  context: DiscoverListContext,
  status: DiscoverStatus
): string {
  const normalizedBaseUrl = baseUrl.replace(/\/$/, '')
  if (context === 'publisher') {
    return `${normalizedBaseUrl}/publisher?status=${status}`
  }
  return getDiscoverListUrl(baseUrl, context, status)
}

export async function ensureDiscoverListVisible(
  page: Page,
  context: DiscoverListContext,
  status: DiscoverStatus = 'active'
): Promise<void> {
  const activeTab = journeyStatusTabs(page).getByRole('tab', { name: 'Active' })
  if (await activeTab.isVisible().catch(() => false)) {
    return
  }

  const baseUrl = await getBaseUrl()
  await page.goto(getListUrl(baseUrl, context, status), {
    waitUntil: 'domcontentloaded'
  })

  if (context === 'publisher') {
    await expect(page.getByTestId('JourneysAdminTemplateList')).toBeVisible({
      timeout: statusTabTimeout
    })
  }

  await expect(activeTab).toBeVisible({ timeout: statusTabTimeout })
}

export async function clickDiscoverStatusTab(
  page: Page,
  tabLabel: StatusTabLabel,
  context: DiscoverListContext = 'journeys'
): Promise<void> {
  const status = statusTabToQueryParam[tabLabel]
  await ensureDiscoverListVisible(page, context, status)

  const tab = journeyStatusTabs(page).getByRole('tab', { name: tabLabel })
  await expect(tab).toBeVisible({ timeout: statusTabTimeout })
  await tab.click()
  await expect(tab).toHaveAttribute('aria-selected', 'true')
}
