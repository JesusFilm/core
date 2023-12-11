import { createClient } from '@formium/client'
import { GraphQLError } from 'graphql'

import { Block } from '.prisma/api-journeys-client'

import { FormBlockUpdateInput } from '../../../../__generated__/graphql'

interface ValidateFormCredentialsProps {
  input: FormBlockUpdateInput
  block: Pick<Block, 'projectId' | 'formSlug' | 'apiToken'>
}

export async function validateFormCredentials({
  input,
  block
}: ValidateFormCredentialsProps): Promise<FormBlockUpdateInput> {
  const combinedApiToken = input.apiToken ?? block.apiToken
  const combinedProjectId = input.projectId ?? block.projectId
  const inputApiToken = 'apiToken' in input
  const inputProjectId = 'projectId' in input
  const inputFormSlug = 'formSlug' in input

  // checks if there is apiToken before allowing projectId or formSlug update
  if (
    combinedApiToken == null &&
    (input.projectId != null || input.formSlug != null)
  ) {
    throw new GraphQLError('provide apiToken first', {
      extensions: { code: 'BAD_USER_INPUT' }
    })
  }

  // checks if there is projectId before allowing formSlug update
  if (combinedProjectId == null && input.formSlug != null) {
    throw new GraphQLError('provide projectId first', {
      extensions: { code: 'BAD_USER_INPUT' }
    })
  }

  // apiToken
  if (inputApiToken && !inputProjectId && !inputFormSlug) {
    if (input.apiToken != null) {
      await validateApiToken(input.apiToken)
      // updates apiToken clears projectId and formSlug
      return { apiToken: input.apiToken, projectId: null, formSlug: null }
    } else {
      // clears apiToken, projectId and formSlug
      return { apiToken: null, projectId: null, formSlug: null }
    }
  }

  // projectId
  if (combinedApiToken != null && inputProjectId && !inputFormSlug) {
    if (input.projectId != null) {
      await validateApiTokenProjectId(combinedApiToken, input.projectId)
      // updates projectId clears formSlug
      return {
        apiToken: combinedApiToken,
        projectId: input.projectId,
        formSlug: null
      }
    } else {
      if (input.apiToken != null) await validateApiToken(combinedApiToken)
      // clears projectId and formSlug
      return { apiToken: combinedApiToken, projectId: null, formSlug: null }
    }
  }

  // formSlug
  if (combinedApiToken != null && combinedProjectId != null && inputFormSlug) {
    if (input.formSlug != null) {
      await validateApiTokenProjectIdFormSlug(
        combinedApiToken,
        combinedProjectId,
        input.formSlug
      )
      // updates formSlug
      return {
        apiToken: combinedApiToken,
        projectId: combinedProjectId,
        formSlug: input.formSlug
      }
    } else {
      if (input.apiToken != null || input.projectId != null)
        await validateApiTokenProjectId(combinedApiToken, combinedProjectId)
      // clears formSlug
      return {
        apiToken: combinedApiToken,
        projectId: combinedProjectId,
        formSlug: null
      }
    }
  }

  throw getError()
}

async function validateApiToken(apiToken: string): Promise<void> {
  try {
    await createClient('', {
      apiToken
    }).getMyProjects()
  } catch (error) {
    throw getError(error)
  }
}

async function validateApiTokenProjectId(
  apiToken: string,
  projectId: string
): Promise<void> {
  try {
    await createClient(projectId, {
      apiToken
    }).findForms()
  } catch (error) {
    throw getError(error)
  }
}

async function validateApiTokenProjectIdFormSlug(
  apiToken: string,
  projectId: string,
  formSlug: string
): Promise<void> {
  let form
  try {
    form = await createClient(projectId, {
      apiToken
    }).getFormBySlug(formSlug)
  } catch (error) {
    throw getError(error)
  }
  if (!('name' in form))
    throw getError({ message: 'Response Error (401)' } as unknown as Error)
}

function getError(error?: Error): GraphQLError {
  switch (error?.message) {
    case 'Response Error (401)':
      return new GraphQLError('invalid api token', {
        extensions: { code: 'BAD_USER_INPUT' }
      })
    case 'HTTP 404 Not Found (404)':
      return new GraphQLError('invalid project id', {
        extensions: { code: 'BAD_USER_INPUT' }
      })
    case 'Form not found (404)':
      return new GraphQLError('invalid form slug', {
        extensions: { code: 'BAD_USER_INPUT' }
      })
    default:
      return new GraphQLError('error validating formium credentials', {
        extensions: { code: 'BAD_USER_INPUT' }
      })
  }
}
