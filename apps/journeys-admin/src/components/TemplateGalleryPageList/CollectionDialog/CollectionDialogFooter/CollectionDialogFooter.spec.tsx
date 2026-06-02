import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import '../../../../../test/i18n'

import {
  CollectionDialogFooter,
  CollectionDialogFooterProps
} from './CollectionDialogFooter'

function makeProps(
  overrides: Partial<CollectionDialogFooterProps> = {}
): CollectionDialogFooterProps {
  return {
    mode: 'edit',
    isPublished: false,
    canPublish: true,
    publishBlockedReason: null,
    journeyCount: 1,
    isSubmitting: false,
    isUnpublishing: false,
    onCancel: vi.fn(),
    onCreate: vi.fn(),
    onSave: vi.fn(),
    onSaveDraft: vi.fn(),
    onPublish: vi.fn(),
    onUnpublish: vi.fn(),
    ...overrides
  }
}

describe('CollectionDialogFooter', () => {
  describe('create mode', () => {
    it('renders Cancel + Create and wires the callbacks', async () => {
      const onCancel = vi.fn()
      const onCreate = vi.fn()
      render(
        <CollectionDialogFooter
          {...makeProps({ mode: 'create', onCancel, onCreate })}
        />
      )
      const cancel = screen.getByRole('button', { name: 'Cancel' })
      const create = screen.getByRole('button', { name: 'Create' })
      expect(cancel).toBeInTheDocument()
      expect(create).toBeInTheDocument()
      expect(
        screen.queryByRole('button', { name: 'Save' })
      ).not.toBeInTheDocument()

      await userEvent.click(cancel)
      expect(onCancel).toHaveBeenCalledTimes(1)
      await userEvent.click(create)
      expect(onCreate).toHaveBeenCalledTimes(1)
    })
  })

  describe('edit mode (draft)', () => {
    it('renders Cancel + Save only', async () => {
      const onCancel = vi.fn()
      const onSave = vi.fn()
      render(
        <CollectionDialogFooter
          {...makeProps({
            mode: 'edit',
            isPublished: false,
            onCancel,
            onSave
          })}
        />
      )
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument()
      expect(
        screen.queryByRole('button', { name: 'Unpublish' })
      ).not.toBeInTheDocument()
      expect(
        screen.queryByRole('button', { name: 'Save Draft' })
      ).not.toBeInTheDocument()

      await userEvent.click(screen.getByRole('button', { name: 'Save' }))
      expect(onSave).toHaveBeenCalledTimes(1)
    })
  })

  describe('edit mode (published)', () => {
    it('renders Cancel + Unpublish + Save and wires the callbacks', async () => {
      const onCancel = vi.fn()
      const onSave = vi.fn()
      const onUnpublish = vi.fn()
      render(
        <CollectionDialogFooter
          {...makeProps({
            mode: 'edit',
            isPublished: true,
            onCancel,
            onSave,
            onUnpublish
          })}
        />
      )
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: 'Unpublish' })
      ).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument()
      expect(
        screen.queryByRole('button', { name: 'Save Draft' })
      ).not.toBeInTheDocument()

      await userEvent.click(screen.getByRole('button', { name: 'Unpublish' }))
      expect(onUnpublish).toHaveBeenCalledTimes(1)
      await userEvent.click(screen.getByRole('button', { name: 'Save' }))
      expect(onSave).toHaveBeenCalledTimes(1)
    })

    it('disables every button while unpublishing is in flight', () => {
      render(
        <CollectionDialogFooter
          {...makeProps({
            mode: 'edit',
            isPublished: true,
            isUnpublishing: true
          })}
        />
      )
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled()
      expect(screen.getByRole('button', { name: 'Unpublish' })).toBeDisabled()
      expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()
    })
  })

  describe('publish mode', () => {
    it('renders Cancel + Save Draft + Publish and wires the callbacks', async () => {
      const onCancel = vi.fn()
      const onSaveDraft = vi.fn()
      const onPublish = vi.fn()
      render(
        <CollectionDialogFooter
          {...makeProps({
            mode: 'publish',
            onCancel,
            onSaveDraft,
            onPublish
          })}
        />
      )
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: 'Save Draft' })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: 'Publish' })
      ).toBeInTheDocument()
      expect(
        screen.queryByRole('button', { name: 'Unpublish' })
      ).not.toBeInTheDocument()

      await userEvent.click(screen.getByRole('button', { name: 'Save Draft' }))
      expect(onSaveDraft).toHaveBeenCalledTimes(1)
      await userEvent.click(screen.getByRole('button', { name: 'Publish' }))
      expect(onPublish).toHaveBeenCalledTimes(1)
    })

    it('disables Publish when journeyCount is 0 with the empty-collection tooltip', async () => {
      render(
        <CollectionDialogFooter
          {...makeProps({ mode: 'publish', journeyCount: 0 })}
        />
      )
      const publish = screen.getByRole('button', { name: 'Publish' })
      expect(publish).toBeDisabled()
      // Save Draft must stay enabled so the user can edit metadata
      // before adding templates.
      expect(screen.getByRole('button', { name: 'Save Draft' })).toBeEnabled()

      await userEvent.hover(publish.parentElement as HTMLElement)
      expect(await screen.findByRole('tooltip')).toHaveTextContent(
        'Add at least one template before publishing'
      )
    })

    it('disables Publish when canPublish is false and shows the custom-domain reason', async () => {
      const reason = 'gate copy'
      render(
        <CollectionDialogFooter
          {...makeProps({
            mode: 'publish',
            canPublish: false,
            publishBlockedReason: reason,
            journeyCount: 3
          })}
        />
      )
      const publish = screen.getByRole('button', { name: 'Publish' })
      expect(publish).toBeDisabled()

      await userEvent.hover(publish.parentElement as HTMLElement)
      expect(await screen.findByRole('tooltip')).toHaveTextContent(reason)
    })

    it('disables every button while Formik submit is in flight', () => {
      render(
        <CollectionDialogFooter
          {...makeProps({ mode: 'publish', isSubmitting: true })}
        />
      )
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled()
      expect(screen.getByRole('button', { name: 'Save Draft' })).toBeDisabled()
      expect(screen.getByRole('button', { name: 'Publish' })).toBeDisabled()
    })
  })

  describe('submitBlocked (in-flight media upload gate)', () => {
    it('disables Create but not Cancel in create mode', () => {
      render(
        <CollectionDialogFooter
          {...makeProps({ mode: 'create', submitBlocked: true })}
        />
      )
      expect(screen.getByRole('button', { name: 'Create' })).toBeDisabled()
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeEnabled()
    })

    it('disables Save but not Cancel in edit (draft) mode', () => {
      render(
        <CollectionDialogFooter
          {...makeProps({ mode: 'edit', submitBlocked: true })}
        />
      )
      expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeEnabled()
    })

    it('disables Save but leaves Unpublish enabled in edit (published) mode', () => {
      render(
        <CollectionDialogFooter
          {...makeProps({
            mode: 'edit',
            isPublished: true,
            submitBlocked: true
          })}
        />
      )
      expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()
      // Unpublish is a deliberate status change, not a save path — it must
      // stay usable even with an unfinished media upload.
      expect(screen.getByRole('button', { name: 'Unpublish' })).toBeEnabled()
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeEnabled()
    })

    it('disables Save Draft and Publish but not Cancel in publish mode', () => {
      render(
        <CollectionDialogFooter
          {...makeProps({ mode: 'publish', submitBlocked: true })}
        />
      )
      expect(screen.getByRole('button', { name: 'Save Draft' })).toBeDisabled()
      expect(screen.getByRole('button', { name: 'Publish' })).toBeDisabled()
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeEnabled()
    })
  })
})
