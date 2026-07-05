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
    it('should send collection_create event', () => {
      sendCollectionCreateEvent({
        teamId: 'team.id',
        collectionId: 'collection.id'
      })

      expect(mockSendGTMEvent).toHaveBeenCalledWith({
        event: 'collection_create',
        teamId: 'team.id',
        collectionId: 'collection.id'
      })
    })
  })

  describe('sendCollectionEditOpenEvent', () => {
    it('should send collection_edit_open event with collection status', () => {
      sendCollectionEditOpenEvent({
        teamId: 'team.id',
        collectionId: 'collection.id',
        collectionStatus: TemplateGalleryPageStatus.draft
      })

      expect(mockSendGTMEvent).toHaveBeenCalledWith({
        event: 'collection_edit_open',
        teamId: 'team.id',
        collectionId: 'collection.id',
        collectionStatus: TemplateGalleryPageStatus.draft
      })
    })
  })

  describe('sendCollectionPublishEvent', () => {
    it('should send collection_publish event with slug', () => {
      sendCollectionPublishEvent({
        teamId: 'team.id',
        collectionId: 'collection.id',
        collectionSlug: 'my-collection'
      })

      expect(mockSendGTMEvent).toHaveBeenCalledWith({
        event: 'collection_publish',
        teamId: 'team.id',
        collectionId: 'collection.id',
        collectionSlug: 'my-collection'
      })
    })
  })

  describe('sendCollectionTemplateDragEvent', () => {
    it('should send collection_template_drag event', () => {
      sendCollectionTemplateDragEvent({
        collectionId: 'collection.id',
        templateId: 'template.id'
      })

      expect(mockSendGTMEvent).toHaveBeenCalledWith({
        event: 'collection_template_drag',
        collectionId: 'collection.id',
        templateId: 'template.id'
      })
    })
  })

  describe('sendCollectionTemplateAddEvent', () => {
    it('should send collection_template_add event', () => {
      sendCollectionTemplateAddEvent({
        collectionId: 'collection.id',
        templateId: 'template.id'
      })

      expect(mockSendGTMEvent).toHaveBeenCalledWith({
        event: 'collection_template_add',
        collectionId: 'collection.id',
        templateId: 'template.id'
      })
    })
  })

  describe('sendCollectionMoreDetailsClickEvent', () => {
    it('should send collection_more_details_click event', () => {
      sendCollectionMoreDetailsClickEvent({ collectionId: 'collection.id' })

      expect(mockSendGTMEvent).toHaveBeenCalledWith({
        event: 'collection_more_details_click',
        collectionId: 'collection.id'
      })
    })
  })

  describe('sendCollectionPreviewClickEvent', () => {
    it('should send collection_preview_click event with location', () => {
      sendCollectionPreviewClickEvent({
        location: 'card_menu',
        collectionSlug: 'my-collection',
        collectionId: 'collection.id'
      })

      expect(mockSendGTMEvent).toHaveBeenCalledWith({
        event: 'collection_preview_click',
        location: 'card_menu',
        collectionSlug: 'my-collection',
        collectionId: 'collection.id'
      })
    })

    it('should send collection_preview_click event without collectionId when omitted', () => {
      sendCollectionPreviewClickEvent({
        location: 'edit_dialog',
        collectionSlug: 'my-collection'
      })

      expect(mockSendGTMEvent).toHaveBeenCalledWith({
        event: 'collection_preview_click',
        location: 'edit_dialog',
        collectionSlug: 'my-collection',
        collectionId: undefined
      })
    })
  })

  describe('sendCollectionCopyLinkClickEvent', () => {
    it('should send collection_copy_link_click event with location', () => {
      sendCollectionCopyLinkClickEvent({
        location: 'publish_success_dialog',
        collectionSlug: 'my-collection'
      })

      expect(mockSendGTMEvent).toHaveBeenCalledWith({
        event: 'collection_copy_link_click',
        location: 'publish_success_dialog',
        collectionSlug: 'my-collection'
      })
    })
  })

  describe('sendCollectionDescriptionUpdateEvent', () => {
    it('should send collection_description_update event', () => {
      sendCollectionDescriptionUpdateEvent({
        teamId: 'team.id',
        collectionId: 'collection.id'
      })

      expect(mockSendGTMEvent).toHaveBeenCalledWith({
        event: 'collection_description_update',
        teamId: 'team.id',
        collectionId: 'collection.id'
      })
    })
  })

  describe('sendCollectionSlugUpdateEvent', () => {
    it('should send collection_slug_update event with new slug', () => {
      sendCollectionSlugUpdateEvent({
        teamId: 'team.id',
        collectionId: 'collection.id',
        collectionSlug: 'renamed-collection'
      })

      expect(mockSendGTMEvent).toHaveBeenCalledWith({
        event: 'collection_slug_update',
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
        event: 'collection_media_update',
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
        event: 'collection_media_update',
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
        event: 'collection_media_update',
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
        event: 'collection_media_update',
        teamId: 'team.id',
        collectionId: 'collection.id',
        mediaType: TemplateGalleryPageMediaType.none,
        mediaProvider: undefined
      })
    })
  })
})
