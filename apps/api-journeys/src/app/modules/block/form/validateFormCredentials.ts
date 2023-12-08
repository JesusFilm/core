import { createClient } from '@formium/client'
import { GraphQLError } from 'graphql'

import { Block } from '.prisma/api-journeys-client'

import { FormBlockUpdateInput } from '../../../__generated__/graphql'

interface ValidateFormCredentialsProps {
  input: FormBlockUpdateInput
  block: Pick<Block, 'projectId' | 'formSlug' | 'apiToken'>
}

export async function validateFormCredentials({
  input,
  block
}: ValidateFormCredentialsProps): Promise<FormBlockUpdateInput> {
  const { apiToken, projectId, formSlug } = getCredentials({ input, block })

  // throws error if trying to edit projectId or formSlug without apiToken
  if (apiToken == null && (input.projectId != null || input.formSlug != null)) {
    throw new GraphQLError('provide api token first', {
      extensions: { code: 'BAD_USER_INPUT' }
    })
  }

  // throws error if trying to edit formSlug without projectId
  if ((apiToken == null || projectId == null) && input.formSlug != null) {
    throw new GraphQLError('provide project id first', {
      extensions: { code: 'BAD_USER_INPUT' }
    })
  }

  // clears apiToken, projectId, formSlug
  if (apiToken == null)
    return { apiToken: null, projectId: null, formSlug: null }

  // validates/updates apiToken, clears projectId, formSlug
  if (apiToken != null && projectId == null && formSlug == null) {
    if (input.apiToken != null)
      try {
        await createClient('', {
          apiToken: input.apiToken
        }).getMyProjects()
      } catch (error) {
        throw getError(error.message)
      }

    return { apiToken, projectId: null, formSlug: null }
  }

  // validates/updates apiToken, projectId, clears formSlug
  if (apiToken != null && projectId != null && formSlug == null) {
    if (input.projectId != null)
      try {
        await createClient(projectId, {
          apiToken
        }).findForms()
      } catch (error) {
        throw getError(error.message)
      }

    return { apiToken, projectId, formSlug: null }
  }

  // validates/updates apiToken, projectId, formSlug
  if (apiToken != null && projectId != null && formSlug != null) {
    if (input.formSlug != null) {
      let form
      try {
        form = await createClient(projectId, {
          apiToken
        }).getFormBySlug(formSlug)
      } catch (error) {
        throw getError(error.message)
      }
      if (!('name' in form)) throw getError('Response Error (401)')
    }

    return { apiToken, projectId, formSlug }
  }

  throw getError()
}

function getCredentials({
  input,
  block
}: ValidateFormCredentialsProps): FormBlockUpdateInput {
  const apiToken = 'apiToken' in input ? input.apiToken : block.apiToken
  const projectId = 'projectId' in input ? input.projectId : block.projectId
  const formSlug = 'formSlug' in input ? input.formSlug : block.formSlug

  // clears apiToken and below fields, also disallows apiToken below fields to be edited without one
  if (apiToken == null) {
    return {
      apiToken: null,
      projectId: null,
      formSlug: null
    }
  }

  // clears projectId and below fields, also disallows projectId below fields to be edited without one
  if (projectId == null) {
    return {
      apiToken,
      projectId: null,
      formSlug: null
    }
  }

  return {
    apiToken,
    projectId,
    formSlug
  }
}

function getError(message?: string): GraphQLError {
  if (message === 'Response Error (401)') {
    return new GraphQLError('invalid api token', {
      extensions: { code: 'BAD_USER_INPUT' }
    })
  } else if (message === 'HTTP 404 Not Found (404)') {
    return new GraphQLError('invalid project id', {
      extensions: { code: 'BAD_USER_INPUT' }
    })
  } else if (message === 'Form not found (404)') {
    return new GraphQLError('invalid form slug', {
      extensions: { code: 'BAD_USER_INPUT' }
    })
  } else {
    return new GraphQLError('error validating formium credentials', {
      extensions: { code: 'BAD_USER_INPUT' }
    })
  }
}
