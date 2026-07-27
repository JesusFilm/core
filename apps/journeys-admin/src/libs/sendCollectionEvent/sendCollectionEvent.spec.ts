import { sendGTMEvent } from '@next/third-parties/google'
import { type MockedFunction } from 'vitest'

import {
  TemplateGalleryPageMediaType,
  TemplateGalleryPageStatus
} from '../../../__generated__/globalTypes'

import {
  sendCollectionCopyLinkClickEvent,
  sendCollectionCreateEvent,
  sendCollectionDescriptionUpdateEvent,
  sendCollectionEditOpenEvent,
  sendCollectionMediaUpdateEvent,
  sendCollectionMoreDetailsClickEvent,
  sendCollectionPreviewClickEvent,
  sendCollectionPublishEvent,
  sendCollectionSlugUpdateEvent,
  sendCollectionTemplateAddEvent,
  sendCollectionTemplateDragEvent
} from './sendCollectionEvent'

vi.mock('@next/third-parties/google', () => ({
  sendGTMEvent: vi.fn()
}))

const mockSendGTMEvent = sendGTMEvent as MockedFunction<typeof sendGTMEvent>

describe('sendCollectionEvent', () => {
  beforeEach(() => {
    mockSendGTMEvent.mockClear()
  })

  describe('sendCollectionCreateEvent', () => {
    it('should send team_collection_create event', () => {
      sendCollectionCreateEvent({
        teamId: 'team.id',
        collectionId: 'collection.id'
      })

      expect(mockSendGTMEvent).toHaveBeenCalledWith({
        event: 'team_collection_create',
        teamId: 'team.id',
        collectionId: 'collection.id'
      })
    })
  })

  describe('sendCollectionEditOpenEvent', () => {
    it('should send team_collection_edit_dialog_open event with collection status', () => {
      sendCollectionEditOpenEvent({
        teamId: 'team.id',
        collectionId: 'collection.id',
        collectionStatus: TemplateGalleryPageStatus.draft
      })

      expect(mockSendGTMEvent).toHaveBeenCalledWith({
        event: 'team_collection_edit_dialog_open',
        teamId: 'team.id',
        collectionId: 'collection.id',
        collectionStatus: TemplateGalleryPageStatus.draft
      })
    })
  })

  describe('sendCollectionPublishEvent', () => {
    it('should send team_collection_publish event with slug', () => {
      sendCollectionPublishEvent({
        teamId: 'team.id',
        collectionId: 'collection.id',
        collectionSlug: 'my-collection'
      })

      expect(mockSendGTMEvent).toHaveBeenCalledWith({
        event: 'team_collection_publish',
        teamId: 'team.id',
        collectionId: 'collection.id',
        collectionSlug: 'my-collection'
      })
    })
  })

  describe('sendCollectionTemplateDragEvent', () => {
    it('should send team_collection_template_added_via_drag event', () => {
      sendCollectionTemplateDragEvent({
        collectionId: 'collection.id',
        templateId: 'template.id'
      })

      expect(mockSendGTMEvent).toHaveBeenCalledWith({
        event: 'team_collection_template_added_via_drag',
        collectionId: 'collection.id',
        templateId: 'template.id'
      })
    })
  })

  describe('sendCollectionTemplateAddEvent', () => {
    it('should send team_collection_template_added_in_dialog event', () => {
      sendCollectionTemplateAddEvent({
        collectionId: 'collection.id',
        templateId: 'template.id'
      })

      expect(mockSendGTMEvent).toHaveBeenCalledWith({
        event: 'team_collection_template_added_in_dialog',
        collectionId: 'collection.id',
        templateId: 'template.id'
      })
    })
  })

  describe('sendCollectionMoreDetailsClickEvent', () => {
    it('should send team_collection_more_details_click event', () => {
      sendCollectionMoreDetailsClickEvent({ collectionId: 'collection.id' })

      expect(mockSendGTMEvent).toHaveBeenCalledWith({
        event: 'team_collection_more_details_click',
        collectionId: 'collection.id'
      })
    })
  })

  describe('sendCollectionPreviewClickEvent', () => {
    it('should send team_collection_menu_preview_click from the card menu', () => {
      sendCollectionPreviewClickEvent({
        location: 'card_menu',
        collectionSlug: 'my-collection',
        collectionId: 'collection.id'
      })

      expect(mockSendGTMEvent).toHaveBeenCalledWith({
        event: 'team_collection_menu_preview_click',
        collectionSlug: 'my-collection',
        collectionId: 'collection.id'
      })
    })

    it('should send team_collection_dialog_preview_click from the edit dialog', () => {
      sendCollectionPreviewClickEvent({
        location: 'edit_dialog',
        collectionSlug: 'my-collection'
      })

      expect(mockSendGTMEvent).toHaveBeenCalledWith({
        event: 'team_collection_dialog_preview_click',
        collectionSlug: 'my-collection',
        collectionId: undefined
      })
    })

    it('should send team_collection_publish_preview_click from the publish success dialog', () => {
      sendCollectionPreviewClickEvent({
        location: 'publish_success_dialog',
        collectionSlug: 'my-collection'
      })

      expect(mockSendGTMEvent).toHaveBeenCalledWith({
        event: 'team_collection_publish_preview_click',
        collectionSlug: 'my-collection',
        collectionId: undefined
      })
    })
  })

  describe('sendCollectionCopyLinkClickEvent', () => {
    it('should send team_collection_copy_link_click event with location', () => {
      sendCollectionCopyLinkClickEvent({
        location: 'publish_success_dialog',
        collectionSlug: 'my-collection'
      })

      expect(mockSendGTMEvent).toHaveBeenCalledWith({
        event: 'team_collection_copy_link_click',
        location: 'publish_success_dialog',
        collectionSlug: 'my-collection'
      })
    })
  })

  describe('sendCollectionDescriptionUpdateEvent', () => {
    it('should send team_collection_description_update event', () => {
      sendCollectionDescriptionUpdateEvent({
        teamId: 'team.id',
        collectionId: 'collection.id'
      })

      expect(mockSendGTMEvent).toHaveBeenCalledWith({
        event: 'team_collection_description_update',
        teamId: 'team.id',
        collectionId: 'collection.id'
      })
    })
  })

  describe('sendCollectionSlugUpdateEvent', () => {
    it('should send team_collection_slug_update event with new slug', () => {
      sendCollectionSlugUpdateEvent({
        teamId: 'team.id',
        collectionId: 'collection.id',
        collectionSlug: 'renamed-collection'
      })

      expect(mockSendGTMEvent).toHaveBeenCalledWith({
        event: 'team_collection_slug_update',
        teamId: 'team.id',
        collectionId: 'collection.id',
        collectionSlug: 'renamed-collection'
      })
    })
  })

  describe('sendCollectionMediaUpdateEvent', () => {
    it('should report mux as the provider for mux uploads', () => {
      sendCollectionMediaUpdateEvent({
        teamId: 'team.id',
        collectionId: 'collection.id',
        mediaType: TemplateGalleryPageMediaType.mux
      })

      expect(mockSendGTMEvent).toHaveBeenCalledWith({
        event: 'team_collection_media_update',
        teamId: 'team.id',
        collectionId: 'collection.id',
        mediaType: TemplateGalleryPageMediaType.mux,
        mediaProvider: 'mux'
      })
    })

    it('should report the embed hostname as the provider for links', () => {
      sendCollectionMediaUpdateEvent({
        teamId: 'team.id',
        collectionId: 'collection.id',
        mediaType: TemplateGalleryPageMediaType.link,
        mediaUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
      })

      expect(mockSendGTMEvent).toHaveBeenCalledWith({
        event: 'team_collection_media_update',
        teamId: 'team.id',
        collectionId: 'collection.id',
        mediaType: TemplateGalleryPageMediaType.link,
        mediaProvider: 'www.youtube.com'
      })
    })

    it('should omit the provider for an unparseable link', () => {
      sendCollectionMediaUpdateEvent({
        teamId: 'team.id',
        collectionId: 'collection.id',
        mediaType: TemplateGalleryPageMediaType.link,
        mediaUrl: 'not a url'
      })

      expect(mockSendGTMEvent).toHaveBeenCalledWith({
        event: 'team_collection_media_update',
        teamId: 'team.id',
        collectionId: 'collection.id',
        mediaType: TemplateGalleryPageMediaType.link,
        mediaProvider: undefined
      })
    })

    it('should omit the provider when media is removed', () => {
      sendCollectionMediaUpdateEvent({
        teamId: 'team.id',
        collectionId: 'collection.id',
        mediaType: TemplateGalleryPageMediaType.none
      })

      expect(mockSendGTMEvent).toHaveBeenCalledWith({
        event: 'team_collection_media_update',
        teamId: 'team.id',
        collectionId: 'collection.id',
        mediaType: TemplateGalleryPageMediaType.none,
        mediaProvider: undefined
      })
    })
  })
})
