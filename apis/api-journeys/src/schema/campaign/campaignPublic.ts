import {
  CampaignBlock as CampaignBlockRow,
  CampaignLanguage,
  CampaignRegionCountry,
  CampaignString,
  CampaignTheme,
  Prisma,
  CampaignPageKind as PrismaCampaignPageKind,
  JourneyStatus as PrismaJourneyStatus
} from '@core/prisma/journeys/client'

import { builder } from '../builder'
import { JourneyStatus } from '../journey/enums/journeyStatus'
import { Language } from '../language'

import {
  CampaignBlock,
  CampaignFooterBlock,
  CampaignHeaderBlock
} from './block'
import { CampaignLanguageRef } from './campaignLanguage'
import { CampaignRegionCountryRef } from './campaignRegionCountry'
import { CampaignStringRef } from './campaignString'
import { CampaignThemeRef } from './campaignTheme'
import { CampaignPageKind } from './enums'

/**
 * The narrowed read of a published campaign served to anonymous visitors.
 * Built by `campaignPublic` from one Prisma read: every Translated Field is
 * resolved to the requested language server-side (translation lists arrive
 * empty), blocks are partitioned into the two pages and the chrome as flat
 * lists, and nothing on it leads to the team, its members or linked-journey
 * internals. The admin `Campaign` type keeps the full shape behind Read.
 */
export type CampaignPublicBlock = Prisma.CampaignBlockGetPayload<{
  include: { action: true }
}>

export interface CampaignRegionLanguagePublicPayload {
  id: string
  languageId: string
  order: number
  journeyStatus: PrismaJourneyStatus | null
  journeyUrl: string | null
  embedUrl: string | null
}

export interface CampaignRegionPublicPayload {
  id: string
  slug: string
  name: string
  listed: boolean
  order: number
  countries: CampaignRegionCountry[]
  languages: CampaignRegionLanguagePublicPayload[]
  lines: CampaignPublicBlock[]
}

export interface CampaignPagePublicPayload {
  id: string
  kind: PrismaCampaignPageKind
  blocks: CampaignPublicBlock[]
}

export interface CampaignPublicPayload {
  id: string
  teamId: string
  slug: string
  title: string
  defaultLanguageId: string
  languageId: string
  publishedAt: Date | null
  languages: CampaignLanguage[]
  theme: CampaignTheme
  strings: CampaignString[]
  regions: CampaignRegionPublicPayload[]
  customDomainNames: string[]
  header: CampaignBlockRow
  footer: CampaignBlockRow
  chrome: CampaignPublicBlock[]
  pages: CampaignPagePublicPayload[]
}

export const CampaignRegionLanguagePublicRef =
  builder.objectRef<CampaignRegionLanguagePublicPayload>(
    'CampaignRegionLanguagePublic'
  )

builder.objectType(CampaignRegionLanguagePublicRef, {
  description:
    "A Share Language of a Campaign Region as the public page reads it: the language, whether its linked journey is live, and the journey's resolved public and embed addresses. Nothing here leads to the journey row itself.",
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false }),
    languageId: t.exposeID('languageId', {
      nullable: false,
      description: 'api-languages Language id.'
    }),
    language: t.field({
      type: Language,
      nullable: false,
      resolve: (regionLanguage) => ({ id: regionLanguage.languageId })
    }),
    order: t.exposeInt('order', { nullable: false }),
    journeyStatus: t.field({
      type: JourneyStatus,
      nullable: true,
      description:
        'The linked journey’s live status; null when no journey is linked or it was deleted. The viewer omits a language whose journey is not `published`.',
      resolve: (regionLanguage) => regionLanguage.journeyStatus
    }),
    journeyUrl: t.exposeString('journeyUrl', {
      nullable: true,
      description:
        "The linked journey's public address, decided by its own team's domains; null unless the journey is live-published."
    }),
    embedUrl: t.exposeString('embedUrl', {
      nullable: true,
      description:
        'The root-domain embed route for the linked journey; null unless the journey is live-published.'
    })
  })
})

export const CampaignRegionPublicRef =
  builder.objectRef<CampaignRegionPublicPayload>('CampaignRegionPublic')

builder.objectType(CampaignRegionPublicRef, {
  description:
    'A Campaign Region as the public page reads it: listed and orphan regions alike, name resolved to the requested language, with its countries, Share Languages and Region Lines.',
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false }),
    slug: t.exposeString('slug', { nullable: false }),
    name: t.exposeString('name', {
      nullable: false,
      description: 'Resolved to the requested language.'
    }),
    listed: t.exposeBoolean('listed', { nullable: false }),
    order: t.exposeInt('order', { nullable: false }),
    countries: t.field({
      type: [CampaignRegionCountryRef],
      nullable: false,
      resolve: (region) => region.countries
    }),
    languages: t.field({
      type: [CampaignRegionLanguagePublicRef],
      nullable: false,
      description: 'Share Languages in selector order.',
      resolve: (region) => region.languages
    }),
    lines: t.field({
      type: [CampaignBlock],
      nullable: false,
      description:
        'The Region Lines: CampaignTypographyBlock rows scoped to the region, in order, text resolved.',
      resolve: (region) => region.lines
    })
  })
})

export const CampaignPagePublicRef =
  builder.objectRef<CampaignPagePublicPayload>('CampaignPagePublic')

builder.objectType(CampaignPagePublicRef, {
  description:
    'One of the two campaign pages with its live blocks as a flat list (sections, their Extras and owned blocks) that the viewer trees by parentBlockId and parentOrder.',
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false }),
    kind: t.field({
      type: CampaignPageKind,
      nullable: false,
      resolve: (page) => page.kind
    }),
    blocks: t.field({
      type: [CampaignBlock],
      nullable: false,
      description:
        'Every live block scoped to this page, ordered by parentOrder; every text field resolved to the requested language.',
      resolve: (page) => page.blocks
    })
  })
})

export const CampaignPublicRef =
  builder.objectRef<CampaignPublicPayload>('CampaignPublic')

builder.objectType(CampaignPublicRef, {
  description:
    'The narrowed read of a published Campaign served to anonymous visitors by `campaignPublic`. Every Translated Field arrives resolved to the requested language (translation lists are empty); blocks come as flat lists per page plus the chrome. Nothing here leads to the team, its members or linked-journey internals; the admin `Campaign` type keeps the full shape behind campaign Read.',
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false }),
    teamId: t.exposeID('teamId', {
      nullable: false,
      description:
        "Owning team id, so page views reach the team's existing Plausible site. An opaque id; the team itself is not reachable from here."
    }),
    slug: t.exposeString('slug', { nullable: false }),
    title: t.exposeString('title', {
      nullable: false,
      description: 'Resolved to the requested language; the public page title.'
    }),
    defaultLanguageId: t.exposeID('defaultLanguageId', { nullable: false }),
    defaultLanguage: t.field({
      type: Language,
      nullable: false,
      resolve: (campaign) => ({ id: campaign.defaultLanguageId })
    }),
    languageId: t.exposeID('languageId', {
      nullable: false,
      description:
        'The Page Language every text field was resolved to: the requested campaign language, else the default.'
    }),
    language: t.field({
      type: Language,
      nullable: false,
      resolve: (campaign) => ({ id: campaign.languageId })
    }),
    publishedAt: t.expose('publishedAt', {
      type: 'DateTimeISO',
      nullable: true
    }),
    languages: t.field({
      type: [CampaignLanguageRef],
      nullable: false,
      description: 'Page Languages in selector order.',
      resolve: (campaign) => campaign.languages
    }),
    theme: t.field({
      type: CampaignThemeRef,
      nullable: false,
      resolve: (campaign) => campaign.theme
    }),
    strings: t.field({
      type: [CampaignStringRef],
      nullable: false,
      description: 'The seventeen Campaign Strings, values resolved.',
      resolve: (campaign) => campaign.strings
    }),
    regions: t.field({
      type: [CampaignRegionPublicRef],
      nullable: false,
      description:
        'Every Campaign Region, listed and orphan, in switcher order.',
      resolve: (campaign) => campaign.regions
    }),
    customDomainNames: t.exposeStringList('customDomainNames', {
      nullable: false,
      description:
        'Names of the Custom Domains that name this campaign as their Campaign Root, alphabetical. The first is the preferred address: the canonical link points at its domain-root form, else at the root-domain path. Empty when none is attached.'
    }),
    header: t.field({
      type: CampaignHeaderBlock,
      nullable: false,
      resolve: (campaign) => campaign.header
    }),
    footer: t.field({
      type: CampaignFooterBlock,
      nullable: false,
      resolve: (campaign) => campaign.footer
    }),
    chrome: t.field({
      type: [CampaignBlock],
      nullable: false,
      description:
        'The Campaign Chrome as a flat list: the header, the footer, their children and the header logo, ordered by parentOrder.',
      resolve: (campaign) => campaign.chrome
    }),
    pages: t.field({
      type: [CampaignPagePublicRef],
      nullable: false,
      description:
        'The landing page and the Region Page, each with its blocks.',
      resolve: (campaign) => campaign.pages
    })
  })
})
