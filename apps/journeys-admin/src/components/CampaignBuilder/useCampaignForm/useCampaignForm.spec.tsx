import { MockedProvider } from '@apollo/client/testing/react'
import { act, renderHook, waitFor } from '@testing-library/react'
import { FormikHelpers } from 'formik'
import { SnackbarProvider } from 'notistack'
import { ReactElement, ReactNode } from 'react'

import { CampaignStatus } from '../../../../__generated__/globalTypes'
import { makeCampaign } from '../../../libs/campaignFields/campaignFixture'
import { CAMPAIGN_PUBLISH } from '../../../libs/useCampaignPublishMutation'
import { CAMPAIGN_UNPUBLISH } from '../../../libs/useCampaignUnpublishMutation'
import { CAMPAIGN_UPDATE } from '../../../libs/useCampaignUpdateMutation'

import { CampaignFormValues, useCampaignForm } from './useCampaignForm'

function helpers(): FormikHelpers<CampaignFormValues> {
  return {
    setFieldError: vi.fn(),
    setFieldTouched: vi.fn().mockResolvedValue(undefined)
  } as unknown as FormikHelpers<CampaignFormValues>
}

function wrapperWith(mocks: Parameters<typeof MockedProvider>[0]['mocks']) {
  return function Wrapper({ children }: { children: ReactNode }): ReactElement {
    return (
      <MockedProvider mocks={mocks}>
        <SnackbarProvider>{children}</SnackbarProvider>
      </MockedProvider>
    )
  }
}

describe('useCampaignForm', () => {
  it('seeds initial values from the campaign and reports a clean form as not dirty', () => {
    const campaign = makeCampaign()
    const { result } = renderHook(() => useCampaignForm({ campaign }), {
      wrapper: wrapperWith([])
    })
    expect(result.current.initialValues).toMatchObject({
      title: 'World Cup 2026',
      eyebrow: 'World Cup 2026 · Outreach',
      tagline: '',
      slug: 'world-cup-2026',
      shareJourneyIds: ['journey-1'],
      templateJourneyIds: []
    })
    expect(result.current.isDirty(result.current.initialValues)).toBe(false)
    expect(
      result.current.isDirty({ ...result.current.initialValues, tagline: 'x' })
    ).toBe(true)
  })

  it('sends only the changed fields, clearing emptied nullable ones', async () => {
    const campaign = makeCampaign()
    const update = vi.fn(() => ({
      data: {
        campaignUpdate: makeCampaign({
          title: 'Renamed',
          eyebrow: null,
          shareJourneyIds: undefined
        })
      }
    }))
    const { result } = renderHook(() => useCampaignForm({ campaign }), {
      wrapper: wrapperWith([
        {
          request: {
            query: CAMPAIGN_UPDATE,
            variables: {
              id: 'campaign-1',
              input: {
                title: 'Renamed',
                eyebrow: null,
                shareJourneyIds: ['journey-2', 'journey-1']
              }
            }
          },
          result: update
        }
      ])
    })

    await act(async () => {
      await result.current.handleSubmit(
        {
          ...result.current.initialValues,
          title: 'Renamed',
          eyebrow: '',
          shareJourneyIds: ['journey-2', 'journey-1']
        },
        helpers()
      )
    })

    await waitFor(() => expect(update).toHaveBeenCalled())
  })

  it('skips the update when nothing changed and publishes on publish intent', async () => {
    const campaign = makeCampaign()
    const publish = vi.fn(() => ({
      data: {
        campaignPublish: makeCampaign({ status: CampaignStatus.published })
      }
    }))
    const { result } = renderHook(() => useCampaignForm({ campaign }), {
      wrapper: wrapperWith([
        {
          request: { query: CAMPAIGN_PUBLISH, variables: { id: 'campaign-1' } },
          result: publish
        }
      ])
    })

    act(() => result.current.setSubmitIntent('publish'))
    await act(async () => {
      await result.current.handleSubmit(result.current.initialValues, helpers())
    })

    await waitFor(() => expect(publish).toHaveBeenCalled())
  })

  it('maps a field-scoped GraphQL error onto the slug field', async () => {
    const campaign = makeCampaign()
    const formikHelpers = helpers()
    const { result } = renderHook(() => useCampaignForm({ campaign }), {
      wrapper: wrapperWith([
        {
          request: {
            query: CAMPAIGN_UPDATE,
            variables: { id: 'campaign-1', input: { slug: 'taken' } }
          },
          result: {
            errors: [
              {
                message: 'slug already in use',
                extensions: { code: 'BAD_USER_INPUT', field: 'slug' }
              }
            ]
          }
        }
      ])
    })

    await act(async () => {
      await result.current.handleSubmit(
        { ...result.current.initialValues, slug: 'taken' },
        formikHelpers
      )
    })

    await waitFor(() =>
      expect(formikHelpers.setFieldError).toHaveBeenCalledWith(
        'slug',
        'slug already in use'
      )
    )
  })

  it('unpublishes a live campaign', async () => {
    const campaign = makeCampaign({ status: CampaignStatus.published })
    const unpublish = vi.fn(() => ({
      data: {
        campaignUnpublish: makeCampaign({ status: CampaignStatus.draft })
      }
    }))
    const { result } = renderHook(() => useCampaignForm({ campaign }), {
      wrapper: wrapperWith([
        {
          request: {
            query: CAMPAIGN_UNPUBLISH,
            variables: { id: 'campaign-1' }
          },
          result: unpublish
        }
      ])
    })
    expect(result.current.isPublished).toBe(true)

    await act(async () => {
      await result.current.handleUnpublish()
    })

    await waitFor(() => expect(unpublish).toHaveBeenCalled())
  })
})
