import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import { TreeBlock } from '@core/journeys/ui/block'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'

import { FormBlockUpdateCredentials_formBlockUpdate as FormBlock } from '../../../../../../../../../__generated__/FormBlockUpdateCredentials'
import { GetJourney_journey_blocks_FormBlock as JourneyFormBlock } from '../../../../../../../../../__generated__/GetJourney'
import { FORM_BLOCK_UPDATE } from '../ApiTokenTextField/ApiTokenTextField'

import { ProjectIdSelect } from '.'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => true
}))

describe('ProjectIdSelect', () => {
  const selectedBlock = {
    __typename: 'FormBlock',
    journeyId: 'journeyId',
    id: 'formBlock.id'
  } as unknown as TreeBlock<JourneyFormBlock>

  const formBlock: FormBlock = {
    __typename: 'FormBlock',
    id: 'formBlock.id',
    projectId: 'projectId',
    projects: [
      { __typename: 'FormiumProject', id: 'projectId', name: 'projectName' },
      {
        __typename: 'FormiumProject',
        id: 'otherProjectId',
        name: 'otherProjectName'
      }
    ],
    formSlug: null,
    forms: [],
    form: null
  }

  it('render the default value', () => {
    const { getByRole } = render(
      <MockedProvider>
        <SnackbarProvider>
          <EditorProvider initialState={{ selectedBlock }}>
            <ProjectIdSelect
              id={selectedBlock.id}
              currentProjectId={formBlock.projectId}
              projects={formBlock.projects}
              loading={false}
            />
          </EditorProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    expect(getByRole('button', { name: 'projectName' })).toBeInTheDocument()
  })

  it('updates the projectId', async () => {
    const result = jest.fn(() => ({
      data: {
        formBlockUpdate: {
          ...formBlock,
          projectId: 'otherProjectId'
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
                  projectId: 'otherProjectId'
                }
              }
            },
            result
          }
        ]}
      >
        <SnackbarProvider>
          <EditorProvider initialState={{ selectedBlock }}>
            <ProjectIdSelect
              id={selectedBlock.id}
              currentProjectId={formBlock.projectId}
              projects={formBlock.projects}
              loading={false}
            />
          </EditorProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    fireEvent.mouseDown(getByRole('button', { name: 'projectName' }))
    fireEvent.click(getByRole('option', { name: 'otherProjectName' }))
    await waitFor(() => expect(result).toHaveBeenCalled())
  })

  it('should not update if the new value is the same as the current value', async () => {
    const result = jest.fn(() => ({
      data: {
        formBlockUpdate: {
          ...formBlock,
          projectId: 'otherProjectId'
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
                  projectId: 'otherProjectId'
                }
              }
            },
            result
          }
        ]}
      >
        <SnackbarProvider>
          <EditorProvider initialState={{ selectedBlock }}>
            <ProjectIdSelect
              id={selectedBlock.id}
              currentProjectId={formBlock.projectId}
              projects={formBlock.projects}
              loading={false}
            />
          </EditorProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    fireEvent.mouseDown(getByRole('button', { name: 'projectName' }))
    fireEvent.click(getByRole('option', { name: 'projectName' }))
    await waitFor(() => expect(result).not.toHaveBeenCalled())
  })

  it('should be disabled when loading', () => {
    const { getByRole } = render(
      <MockedProvider>
        <SnackbarProvider>
          <EditorProvider initialState={{ selectedBlock }}>
            <ProjectIdSelect
              id={selectedBlock.id}
              currentProjectId={formBlock.projectId}
              projects={formBlock.projects}
              loading
            />
          </EditorProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    expect(getByRole('button')).toHaveAttribute('aria-disabled', 'true')
  })
})
