import { sendGTMEvent } from '@next/third-parties/google'

import {
  TemplateGalleryPageMediaType,
  TemplateGalleryPageStatus
} from '../../../__generated__/globalTypes'

/**
 * GTM events for the Local Template Library collection workflow (NES-1698).
 * Every event carries the `team_collection_` prefix so the feature reads as
 * one group among all analytics. Event names are snake_case (max 40 chars —
 * GA4's event-name cap) and dataLayer keys are camelCase per
 * apps/docs/docs/03-basics/06-analytics.md.
 */

/** Where a preview / copy-link interaction originated. */
export type CollectionLinkEventLocation =
  | 'card_menu'
  | 'edit_dialog'
  | 'publish_success_dialog'

interface CollectionCreateEvent {
  teamId: string
  collectionId: string
}

interface CollectionEditOpenEvent {
  teamId: string
  collectionId: string
  collectionStatus: TemplateGalleryPageStatus
}

interface CollectionPublishEvent {
  teamId: string
  collectionId: string
  collectionSlug: string
}

interface CollectionTemplateEvent {
  collectionId: string
  templateId: string
}

interface CollectionMoreDetailsClickEvent {
  collectionId: string
}

interface CollectionPreviewClickEvent {
  location: CollectionLinkEventLocation
  collectionSlug: string
  collectionId?: string
}

interface CollectionCopyLinkClickEvent {
  location: Exclude<CollectionLinkEventLocation, 'card_menu'>
  collectionSlug?: string
}

interface CollectionDescriptionUpdateEvent {
  teamId: string
  collectionId: string
}

interface CollectionSlugUpdateEvent {
  teamId: string
  collectionId: string
  collectionSlug: string
}

interface CollectionMediaUpdateEvent {
  teamId: string
  collectionId: string
  mediaType: TemplateGalleryPageMediaType
  mediaUrl?: string
}

// Each preview surface reports a distinct event name (rather than one event
// with a location param) so the surfaces show up as separate rows in GA4.
const PREVIEW_CLICK_EVENT_BY_LOCATION: Record<
  CollectionLinkEventLocation,
  string
> = {
  card_menu: 'team_collection_menu_preview_click',
  edit_dialog: 'team_collection_dialog_preview_click',
  publish_success_dialog: 'team_collection_publish_preview_click'
}

// GA4 caps event parameter values at 100 characters — report the embed host
// (e.g. "www.youtube.com") rather than the full URL. Mux uploads have no URL,
// so they report as the literal provider "mux".
function mediaProvider(
  mediaType: TemplateGalleryPageMediaType,
  mediaUrl?: string
): string | undefined {
  if (mediaType === TemplateGalleryPageMediaType.mux) return 'mux'
  if (mediaType !== TemplateGalleryPageMediaType.link) return undefined
  if (mediaUrl == null || mediaUrl.trim() === '') return undefined
  try {
    return new URL(mediaUrl.trim()).hostname
  } catch {
    return undefined
  }
}

export function sendCollectionCreateEvent({
  teamId,
  collectionId
}: CollectionCreateEvent): void {
  sendGTMEvent({
    event: 'team_collection_create',
    teamId,
    collectionId
  })
}

export function sendCollectionEditOpenEvent({
  teamId,
  collectionId,
  collectionStatus
}: CollectionEditOpenEvent): void {
  sendGTMEvent({
    event: 'team_collection_edit_dialog_open',
    teamId,
    collectionId,
    collectionStatus
  })
}

export function sendCollectionPublishEvent({
  teamId,
  collectionId,
  collectionSlug
}: CollectionPublishEvent): void {
  sendGTMEvent({
    event: 'team_collection_publish',
    teamId,
    collectionId,
    collectionSlug
  })
}

export function sendCollectionTemplateDragEvent({
  collectionId,
  templateId
}: CollectionTemplateEvent): void {
  sendGTMEvent({
    event: 'team_collection_template_added_via_drag',
    collectionId,
    templateId
  })
}

export function sendCollectionTemplateAddEvent({
  collectionId,
  templateId
}: CollectionTemplateEvent): void {
  sendGTMEvent({
    event: 'team_collection_template_added_in_dialog',
    collectionId,
    templateId
  })
}

export function sendCollectionMoreDetailsClickEvent({
  collectionId
}: CollectionMoreDetailsClickEvent): void {
  sendGTMEvent({
    event: 'team_collection_more_details_click',
    collectionId
  })
}

export function sendCollectionPreviewClickEvent({
  location,
  collectionSlug,
  collectionId
}: CollectionPreviewClickEvent): void {
  sendGTMEvent({
    event: PREVIEW_CLICK_EVENT_BY_LOCATION[location],
    collectionSlug,
    collectionId
  })
}

export function sendCollectionCopyLinkClickEvent({
  location,
  collectionSlug
}: CollectionCopyLinkClickEvent): void {
  sendGTMEvent({
    event: 'team_collection_copy_link_click',
    location,
    collectionSlug
  })
}

export function sendCollectionDescriptionUpdateEvent({
  teamId,
  collectionId
}: CollectionDescriptionUpdateEvent): void {
  sendGTMEvent({
    event: 'team_collection_description_update',
    teamId,
    collectionId
  })
}

export function sendCollectionSlugUpdateEvent({
  teamId,
  collectionId,
  collectionSlug
}: CollectionSlugUpdateEvent): void {
  sendGTMEvent({
    event: 'team_collection_slug_update',
    teamId,
    collectionId,
    collectionSlug
  })
}

export function sendCollectionMediaUpdateEvent({
  teamId,
  collectionId,
  mediaType,
  mediaUrl
}: CollectionMediaUpdateEvent): void {
  sendGTMEvent({
    event: 'team_collection_media_update',
    teamId,
    collectionId,
    mediaType,
    mediaProvider: mediaProvider(mediaType, mediaUrl)
  })
}
