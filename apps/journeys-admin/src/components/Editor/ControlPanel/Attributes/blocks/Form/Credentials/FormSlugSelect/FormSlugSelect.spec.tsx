import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'

import { TreeBlock } from '@core/journeys/ui/block'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'

import { FormBlockUpdateCredentials_formBlockUpdate as FormBlock } from '../../../../../../../../../__generated__/FormBlockUpdateCredentials'
import { GetJourney_journey_blocks_FormBlock as JourneyFormBlock } from '../../../../../../../../../__generated__/GetJourney'
import { FORM_BLOCK_UPDATE } from '../ApiTokenTextField/ApiTokenTextField'

import { FormSlugSelect } from '.'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => true
}))

describe('FormSlugSelect', () => {
  const selectedBlock = {
    __typename: 'FormBlock',
    journeyId: 'journeyId',
    id: 'formBlock.id'
  } as unknown as TreeBlock<JourneyFormBlock>

  const formBlock: FormBlock = {
    __typename: 'FormBlock',
    id: 'formBlock.id',
    formSlug: 'formSlug',
    forms: [
      { __typename: 'FormiumForm', slug: 'formSlug', name: 'formName' },
      {
        __typename: 'FormiumForm',
        slug: 'otherFormSlug',
        name: 'otherFormName'
      }
    ],
    projectId: 'projectId',
    projects: [
      { __typename: 'FormiumProject', id: 'projectId', name: 'projectName' }
    ],
    form: null,
    apiTokenExists: null
  }

  it('render the default value', () => {
    const { getByRole } = render(
      <MockedProvider>
        <EditorProvider initialState={{ selectedBlock }}>
          <FormSlugSelect
            id={selectedBlock.id}
            currentFormSlug={formBlock.formSlug}
            forms={formBlock.forms}
            loading={false}
          />
        </EditorProvider>
      </MockedProvider>
    )

    expect(getByRole('button', { name: 'formName' })).toBeInTheDocument()
  })

  it('updates the projectId', async () => {
    const result = jest.fn(() => ({
      data: {
        formBlockUpdate: {
          ...formBlock,
          formSlug: 'otherFormSlug'
        }
      }
    }))

    const { getByRole } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: FORM_BLOCK_UPDATE,
              variables: {
                id: selectedBlock.id,
                input: {
                  formSlug: 'otherFormSlug'
                }
              }
            },
            result
          }
        ]}
      >
        <EditorProvider initialState={{ selectedBlock }}>
          <FormSlugSelect
            id={selectedBlock.id}
            currentFormSlug={formBlock.formSlug}
            forms={formBlock.forms}
            loading={false}
          />
        </EditorProvider>
      </MockedProvider>
    )

    fireEvent.mouseDown(getByRole('button', { name: 'formName' }))
    fireEvent.click(getByRole('option', { name: 'otherFormName' }))
    await waitFor(() => expect(result).toHaveBeenCalled())
  })

  it('should not update if the new value is the same as the current value', async () => {
    const result = jest.fn(() => ({
      data: {
        formBlockUpdate: {
          ...formBlock,
          projectId: 'otherFormSlug'
        }
      }
    }))

    const { getByRole } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: FORM_BLOCK_UPDATE,
              variables: {
                id: selectedBlock.id,
                input: {
                  projectId: 'otherFormSlug'
                }
              }
            },
            result
          }
        ]}
      >
        <EditorProvider initialState={{ selectedBlock }}>
          <FormSlugSelect
            id={selectedBlock.id}
            currentFormSlug={formBlock.formSlug}
            forms={formBlock.forms}
            loading={false}
          />
        </EditorProvider>
      </MockedProvider>
    )

    fireEvent.mouseDown(getByRole('button', { name: 'formName' }))
    fireEvent.click(getByRole('option', { name: 'formName' }))
    await waitFor(() => expect(result).not.toHaveBeenCalled())
  })

  it('should be disabled when loading', () => {
    const { getByRole } = render(
      <MockedProvider>
        <EditorProvider initialState={{ selectedBlock }}>
          <FormSlugSelect
            id={selectedBlock.id}
            currentFormSlug={formBlock.formSlug}
            forms={formBlock.forms}
            loading
          />
        </EditorProvider>
      </MockedProvider>
    )

    expect(getByRole('button')).toHaveAttribute('aria-disabled', 'true')
  })
})
