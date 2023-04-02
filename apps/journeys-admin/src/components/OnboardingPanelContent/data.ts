import { DocumentNode } from 'graphql'
import { GetOnboardingTemplate_template } from '../../../__generated__/GetOnboardingTemplate'
import { GET_ONBOARDING_TEMPLATE } from './OnboardingPanelContent'

interface OnboardingTemplateMock {
  request: {
    query: DocumentNode
    variables: { id: string }
  }
  result: {
    data: { template: Omit<GetOnboardingTemplate_template, '__typename'> }
  }
}

export const getOnboardingTemplateMock = (
  id: string,
  index: string
): OnboardingTemplateMock => {
  return {
    request: {
      query: GET_ONBOARDING_TEMPLATE,
      variables: {
        id
      }
    },
    result: {
      data: {
        template: {
          id,
          title: `template ${index} title`,
          description: `template ${index} description`,
          primaryImageBlock: {
            __typename: 'ImageBlock',
            src: 'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/e8692352-21c7-4f66-cb57-0298e86a3300/public'
          }
        }
      }
    }
  }
}
