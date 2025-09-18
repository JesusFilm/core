import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen } from '@testing-library/react'
import { FormikContextType, FormikProvider } from 'formik'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { JourneyFields as Journey } from '@core/journeys/ui/JourneyProvider/__generated__/JourneyFields'
import { defaultJourney } from '@core/journeys/ui/TemplateView/data'

import { TemplateSettingsFormValues } from '../../useTemplateSettingsForm'

import { CustomizeTemplate } from './CustomizeTemplate'

describe('CustomizeTemplate', () => {
  it('renders heading and refresh button', () => {
    const journey = defaultJourney as Journey
    render(
      <MockedProvider>
        <FormikProvider
          value={
            {
              values: {
                title: journey.title,
                description: journey.description,
                featured: Boolean(journey.featuredAt),
                strategySlug: journey.strategySlug,
                tagIds: journey.tags?.map(({ id }: { id: string }) => id) ?? [],
                creatorDescription: journey.creatorDescription,
                languageId: journey.language?.id,
                journeyCustomizationDescription:
                  journey.journeyCustomizationDescription ?? ''
              }
            } as unknown as FormikContextType<TemplateSettingsFormValues>
          }
        >
          <JourneyProvider value={{ journey, variant: 'admin' }}>
            <CustomizeTemplate />
          </JourneyProvider>
        </FormikProvider>
      </MockedProvider>
    )
    expect(screen.getByText('Text for Customization')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Refresh template variables' })
    ).toBeInTheDocument()
  })

  it('shows existing customization text from api', () => {
    const journey = {
      ...(defaultJourney as Journey),
      journeyCustomizationDescription: 'Hello {{firstName: Bob}}'
    } as Journey
    render(
      <MockedProvider>
        <FormikProvider
          value={
            {
              values: {
                title: journey.title,
                description: journey.description,
                featured: Boolean(journey.featuredAt),
                strategySlug: journey.strategySlug,
                tagIds: journey.tags?.map(({ id }: { id: string }) => id) ?? [],
                creatorDescription: journey.creatorDescription,
                languageId: journey.language?.id,
                journeyCustomizationDescription:
                  journey.journeyCustomizationDescription
              }
            } as unknown as FormikContextType<TemplateSettingsFormValues>
          }
        >
          <JourneyProvider value={{ journey, variant: 'admin' }}>
            <CustomizeTemplate />
          </JourneyProvider>
        </FormikProvider>
      </MockedProvider>
    )
    expect(screen.getByRole('textbox')).toHaveValue('Hello {{firstName: Bob}}')
  })

  it('refreshes customization text using journey blocks', () => {
    const setFieldValue = jest.fn()
    const journey = {
      ...(defaultJourney as Journey),
      blocks: [
        {
          __typename: 'TypographyBlock',
          content: 'Welcome {{firstName}}'
        } as unknown as NonNullable<Journey['blocks']>[number],
        {
          __typename: 'ButtonBlock',
          label: 'Contact {{email}}'
        } as unknown as NonNullable<Journey['blocks']>[number]
      ],
      journeyCustomizationDescription: 'Hello {{firstName: Bob}}'
    } as Journey

    render(
      <MockedProvider>
        <FormikProvider
          value={
            {
              values: {
                title: journey.title,
                description: journey.description,
                featured: Boolean(journey.featuredAt),
                strategySlug: journey.strategySlug,
                tagIds: journey.tags?.map(({ id }: { id: string }) => id) ?? [],
                creatorDescription: journey.creatorDescription,
                languageId: journey.language?.id,
                journeyCustomizationDescription:
                  journey.journeyCustomizationDescription
              },
              setFieldValue
            } as unknown as FormikContextType<TemplateSettingsFormValues>
          }
        >
          <JourneyProvider value={{ journey, variant: 'admin' }}>
            <CustomizeTemplate />
          </JourneyProvider>
        </FormikProvider>
      </MockedProvider>
    )

    fireEvent.click(
      screen.getByRole('button', { name: 'Refresh template variables' })
    )

    expect(setFieldValue).toHaveBeenCalledWith(
      'journeyCustomizationDescription',
      'Hello {{firstName: Bob}}\n{{email: }}'
    )
  })

  it('handles text change', () => {
    const setFieldValue = jest.fn()
    const journey = defaultJourney as Journey
    render(
      <MockedProvider>
        <FormikProvider
          value={
            {
              values: {
                title: journey.title,
                description: journey.description,
                featured: Boolean(journey.featuredAt),
                strategySlug: journey.strategySlug,
                tagIds: journey.tags?.map(({ id }: { id: string }) => id) ?? [],
                creatorDescription: journey.creatorDescription,
                languageId: journey.language?.id,
                journeyCustomizationDescription: ''
              },
              setFieldValue
            } as unknown as FormikContextType<TemplateSettingsFormValues>
          }
        >
          <JourneyProvider value={{ journey, variant: 'admin' }}>
            <CustomizeTemplate />
          </JourneyProvider>
        </FormikProvider>
      </MockedProvider>
    )
    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'New text' }
    })
    expect(setFieldValue).toHaveBeenCalledWith(
      'journeyCustomizationDescription',
      'New text'
    )
  })

  it('inserts em-space on Tab keydown at caret position', () => {
    const setFieldValue = jest.fn()
    const journey = {
      ...(defaultJourney as Journey),
      journeyCustomizationDescription: 'ABC'
    } as Journey
    render(
      <MockedProvider>
        <FormikProvider
          value={
            {
              values: {
                title: journey.title,
                description: journey.description,
                featured: Boolean(journey.featuredAt),
                strategySlug: journey.strategySlug,
                tagIds: journey.tags?.map(({ id }: { id: string }) => id) ?? [],
                creatorDescription: journey.creatorDescription,
                languageId: journey.language?.id,
                journeyCustomizationDescription:
                  journey.journeyCustomizationDescription
              },
              setFieldValue
            } as unknown as FormikContextType<TemplateSettingsFormValues>
          }
        >
          <JourneyProvider value={{ journey, variant: 'admin' }}>
            <CustomizeTemplate />
          </JourneyProvider>
        </FormikProvider>
      </MockedProvider>
    )

    const textbox = screen.getByRole('textbox') as HTMLTextAreaElement
    textbox.setSelectionRange(1, 1)
    fireEvent.keyDown(textbox, { key: 'Tab' })

    const emSpace = '\u2003'
    expect(setFieldValue).toHaveBeenCalledWith(
      'journeyCustomizationDescription',
      `A${emSpace}BC`
    )
  })
})
