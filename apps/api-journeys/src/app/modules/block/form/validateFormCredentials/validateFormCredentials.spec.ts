import { FormiumClient, createClient } from '@formium/client'

import { validateFormCredentials } from '.'

jest.mock('@formium/client', () => ({
  __esModule: true,
  createClient: jest.fn()
}))
const mockCreateClient = createClient as jest.MockedFunction<
  typeof createClient
>

describe('validateFormCredentials', () => {
  afterEach(() => {
    jest.resetAllMocks()
  })

  it('throws error if trying to update projectId and or formSlug with no apiToken', async () => {
    const input = { apiToken: null, projectId: 'id', formSlug: 'slug' }
    const block = { apiToken: null, projectId: null, formSlug: null }

    await expect(validateFormCredentials({ input, block })).rejects.toThrow(
      'provide apiToken first'
    )
  })

  it('throws error if trying to update formSlug with no projectId', async () => {
    const input = { apiToken: 'newApiToken', formSlug: 'slug' }
    const block = { apiToken: 'apiToken', projectId: null, formSlug: null }

    await expect(validateFormCredentials({ input, block })).rejects.toThrow(
      'provide projectId first'
    )
  })

  describe('apiToken', () => {
    it('throws error if invalid apiToken input', async () => {
      const mockFormiumClient = {
        getMyProjects: jest
          .fn()
          .mockRejectedValueOnce(new Error('Response Error (401)'))
      } as unknown as FormiumClient
      mockCreateClient.mockReturnValueOnce(mockFormiumClient)

      const input = { apiToken: 'input.apiToken' }
      const block = { apiToken: null, projectId: null, formSlug: null }

      await expect(validateFormCredentials({ input, block })).rejects.toThrow(
        'invalid api token'
      )
    })

    it('update apiToken and clears projectId and formSlug', async () => {
      const mockFormiumClient = {
        getMyProjects: jest.fn()
      } as unknown as FormiumClient
      mockCreateClient.mockReturnValueOnce(mockFormiumClient)

      const input = { apiToken: 'input.apiToken' }
      const block = {
        apiToken: 'block.apiToken',
        projectId: 'block.projectId',
        formSlug: 'block.formSlug'
      }

      await expect(validateFormCredentials({ input, block })).resolves.toEqual({
        apiToken: 'input.apiToken',
        projectId: null,
        formSlug: null
      })
    })

    it('clears apiToken if there is a input and it is null', async () => {
      const mockFormiumClient = {
        getMyProjects: jest.fn()
      } as unknown as FormiumClient
      mockCreateClient.mockReturnValueOnce(mockFormiumClient)

      const input = { apiToken: null }
      const block = {
        apiToken: 'apiToken',
        projectId: 'projectId',
        formSlug: 'formSlug'
      }

      await expect(validateFormCredentials({ input, block })).resolves.toEqual({
        apiToken: null,
        projectId: null,
        formSlug: null
      })
    })
  })

  describe('projectId', () => {
    it('throws error if invalid projectId input', async () => {
      const mockFormiumClient = {
        findForms: jest
          .fn()
          .mockRejectedValueOnce(new Error('HTTP 404 Not Found (404)'))
      } as unknown as FormiumClient
      mockCreateClient.mockReturnValueOnce(mockFormiumClient)

      const input = { projectId: 'input.projectId' }
      const block = {
        apiToken: 'block.apiToken',
        projectId: null,
        formSlug: null
      }

      await expect(validateFormCredentials({ input, block })).rejects.toThrow(
        'invalid project id'
      )
    })

    it('throws error if invalid projectId or apiToken inputs', async () => {
      const mockFormiumClient = {
        findForms: jest
          .fn()
          .mockRejectedValueOnce(new Error('HTTP 404 Not Found (404)'))
      } as unknown as FormiumClient
      mockCreateClient.mockReturnValueOnce(mockFormiumClient)

      const input = {
        apiToken: 'input.apiToken',
        projectId: 'input.projectId'
      }
      const block = { apiToken: null, projectId: null, formSlug: null }

      await expect(validateFormCredentials({ input, block })).rejects.toThrow(
        'invalid project id'
      )
    })

    it('updates projectId and clears formSlug', async () => {
      const mockFormiumClient = {
        findForms: jest.fn()
      } as unknown as FormiumClient
      mockCreateClient.mockReturnValueOnce(mockFormiumClient)

      const input = { projectId: 'input.projectId' }
      const block = {
        apiToken: 'block.apiToken',
        projectId: 'block.projectId',
        formSlug: 'block.formSlug'
      }

      await expect(validateFormCredentials({ input, block })).resolves.toEqual({
        apiToken: 'block.apiToken',
        projectId: 'input.projectId',
        formSlug: null
      })
    })

    it('updates apiToken and projectId', async () => {
      const mockFormiumClient = {
        findForms: jest.fn()
      } as unknown as FormiumClient
      mockCreateClient.mockReturnValueOnce(mockFormiumClient)

      const input = { apiToken: 'input.apiToken', projectId: 'input.projectId' }
      const block = {
        apiToken: null,
        projectId: null,
        formSlug: null
      }

      await expect(validateFormCredentials({ input, block })).resolves.toEqual({
        apiToken: 'input.apiToken',
        projectId: 'input.projectId',
        formSlug: null
      })
    })

    it('throws error if invalid apiToken when clearing the projectId and apiToken is in the input', async () => {
      const mockFormiumClient = {
        getMyProjects: jest
          .fn()
          .mockRejectedValueOnce(new Error('Response Error (401)'))
      } as unknown as FormiumClient
      mockCreateClient.mockReturnValueOnce(mockFormiumClient)

      const input = { apiToken: 'input.apiToken', projectId: null }
      const block = {
        apiToken: 'block.apiToken',
        projectId: 'block.projectId',
        formSlug: null
      }

      await expect(validateFormCredentials({ input, block })).rejects.toThrow(
        'invalid api token'
      )
    })

    it('should not validate apiToken when clearing the projectId and apiToken is in the block', async () => {
      const mockFormiumClient = {
        getMyProjects: jest
          .fn()
          .mockRejectedValueOnce(new Error('Response Error (401)'))
      } as unknown as FormiumClient
      mockCreateClient.mockReturnValueOnce(mockFormiumClient)

      const input = { projectId: null }
      const block = {
        apiToken: 'block.apiToken',
        projectId: 'block.projectId',
        formSlug: null
      }

      await validateFormCredentials({ input, block })
      expect(mockFormiumClient.getMyProjects).not.toHaveBeenCalled()
    })

    it('clears the projectId and formSlug', async () => {
      const mockFormiumClient = {
        findForms: jest.fn()
      } as unknown as FormiumClient
      mockCreateClient.mockReturnValueOnce(mockFormiumClient)

      const input = { projectId: null }
      const block = {
        apiToken: 'block.apiToken',
        projectId: 'block.projectId',
        formSlug: 'block.formSlug'
      }

      await expect(validateFormCredentials({ input, block })).resolves.toEqual({
        apiToken: 'block.apiToken',
        projectId: null,
        formSlug: null
      })
    })
  })

  describe('formSlug', () => {
    it('throws error if invalid formSlug input', async () => {
      const mockFormiumClient = {
        getFormBySlug: jest
          .fn()
          .mockRejectedValueOnce(new Error('Form not found (404)'))
      } as unknown as FormiumClient
      mockCreateClient.mockReturnValueOnce(mockFormiumClient)

      const input = { formSlug: 'input.formSlug' }
      const block = {
        apiToken: 'block.apiToken',
        projectId: 'block.projectId',
        formSlug: 'block.formSlug'
      }

      await expect(validateFormCredentials({ input, block })).rejects.toThrow(
        'invalid form slug'
      )
    })

    it('throws error if invalid projectId or formSlug inputs', async () => {
      const mockFormiumClient = {
        getFormBySlug: jest
          .fn()
          .mockRejectedValueOnce(new Error('HTTP 404 Not Found (404)'))
      } as unknown as FormiumClient
      mockCreateClient.mockReturnValueOnce(mockFormiumClient)

      const input = { projectId: 'input.projectId', formSlug: 'input.formSlug' }
      const block = {
        apiToken: 'block.apiToken',
        projectId: 'block.projectId',
        formSlug: 'block.formSlug'
      }

      await expect(validateFormCredentials({ input, block })).rejects.toThrow(
        'invalid project id'
      )
    })

    it('throws error if invalid apiToken, projectId or formSlug inputs', async () => {
      const mockFormiumClient = {
        getFormBySlug: jest.fn(() => ({ id: 'input.projectId' }))
      } as unknown as FormiumClient
      mockCreateClient.mockReturnValueOnce(mockFormiumClient)

      const input = {
        apiToken: 'input.apiToken',
        projectId: 'input.projectId',
        formSlug: 'input.formSlug'
      }
      const block = {
        apiToken: 'block.apiToken',
        projectId: 'block.projectId',
        formSlug: 'block.formSlug'
      }

      await expect(validateFormCredentials({ input, block })).rejects.toThrow(
        'invalid api token'
      )
    })

    it('updates fromSlug', async () => {
      const mockFormiumClient = {
        getFormBySlug: jest.fn(() => ({
          id: 'input.projectId',
          name: 'form name'
        }))
      } as unknown as FormiumClient
      mockCreateClient.mockReturnValueOnce(mockFormiumClient)

      const input = {
        formSlug: 'input.formSlug'
      }
      const block = {
        apiToken: 'block.apiToken',
        projectId: 'block.projectId',
        formSlug: 'block.formSlug'
      }

      await expect(validateFormCredentials({ input, block })).resolves.toEqual({
        apiToken: 'block.apiToken',
        projectId: 'block.projectId',
        formSlug: 'input.formSlug'
      })
    })

    it('updates apiToken, projectId and formSlug', async () => {
      const mockFormiumClient = {
        getFormBySlug: jest.fn(() => ({
          id: 'input.projectId',
          name: 'form name'
        }))
      } as unknown as FormiumClient
      mockCreateClient.mockReturnValueOnce(mockFormiumClient)

      const input = {
        apiToken: 'input.apiToken',
        projectId: 'input.projectId',
        formSlug: 'input.formSlug'
      }
      const block = {
        apiToken: 'block.apiToken',
        projectId: 'block.projectId',
        formSlug: 'block.formSlug'
      }

      await expect(validateFormCredentials({ input, block })).resolves.toEqual({
        apiToken: 'input.apiToken',
        projectId: 'input.projectId',
        formSlug: 'input.formSlug'
      })
    })

    it('throws error if invalid projectId when clearing the slug and projectId is in the input', async () => {
      const mockFormiumClient = {
        findForms: jest
          .fn()
          .mockRejectedValueOnce(new Error('HTTP 404 Not Found (404)'))
      } as unknown as FormiumClient
      mockCreateClient.mockReturnValueOnce(mockFormiumClient)

      const input = {
        projectId: 'input.projectId',
        formSlug: null
      }
      const block = {
        apiToken: 'block.apiToken',
        projectId: 'block.projectId',
        formSlug: 'block.formSlug'
      }

      await expect(validateFormCredentials({ input, block })).rejects.toThrow(
        'invalid project id'
      )
    })

    it('throws error if invalid apiToken and projectId when clearing the slug and apiToken and projectId is in the input', async () => {
      const mockFormiumClient = {
        findForms: jest
          .fn()
          .mockRejectedValueOnce(new Error('Response Error (401)'))
      } as unknown as FormiumClient
      mockCreateClient.mockReturnValueOnce(mockFormiumClient)

      const input = {
        apiToken: 'apiToken',
        projectId: 'input.projectId',
        formSlug: null
      }
      const block = {
        apiToken: 'block.apiToken',
        projectId: 'block.projectId',
        formSlug: 'block.formSlug'
      }

      await expect(validateFormCredentials({ input, block })).rejects.toThrow(
        'invalid api token'
      )
    })

    it('should not validate apiToken and projectId when clearing the slug and both, apiToken and projectId is not in the input', async () => {
      const mockFormiumClient = {
        findForms: jest
          .fn()
          .mockRejectedValueOnce(new Error('Response Error (401)'))
      } as unknown as FormiumClient
      mockCreateClient.mockReturnValueOnce(mockFormiumClient)

      const input = {
        formSlug: null
      }
      const block = {
        apiToken: 'block.apiToken',
        projectId: 'block.projectId',
        formSlug: 'block.formSlug'
      }

      await validateFormCredentials({ input, block })
      expect(mockFormiumClient.findForms).not.toHaveBeenCalled()
    })

    it('clears formSlug', async () => {
      const mockFormiumClient = {
        findForms: jest.fn(() => ({
          id: 'input.projectId',
          name: 'form name'
        }))
      } as unknown as FormiumClient
      mockCreateClient.mockReturnValueOnce(mockFormiumClient)

      const input = {
        formSlug: null
      }
      const block = {
        apiToken: 'block.apiToken',
        projectId: 'block.projectId',
        formSlug: 'block.formSlug'
      }

      await expect(validateFormCredentials({ input, block })).resolves.toEqual({
        apiToken: 'block.apiToken',
        projectId: 'block.projectId',
        formSlug: null
      })
    })
  })

  it('throws general error if validation fails', async () => {
    const input = {}
    const block = {
      apiToken: null,
      projectId: null,
      formSlug: null
    }

    await expect(validateFormCredentials({ input, block })).rejects.toThrow(
      'error validating formium credentials'
    )
  })
})
