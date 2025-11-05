// import { MockedProvider } from '@apollo/client/testing'
import { MockedResponse } from '@apollo/client/testing'
import { Meta, StoryObj } from '@storybook/nextjs'

import { journeysAdminConfig } from '@core/shared/ui/storybook'

import {
  CheckCustomDomain,
  CheckCustomDomain_customDomainCheck as CustomDomainCheck
} from '../../../../../__generated__/CheckCustomDomain'
import { GetCustomDomains_customDomains as CustomDomain } from '../../../../../__generated__/GetCustomDomains'

import { CHECK_CUSTOM_DOMAIN, DNSConfigSection } from '.'

const DNSConfigSectionStory: Meta<typeof DNSConfigSection> = {
  ...journeysAdminConfig,
  component: DNSConfigSection,
  title: 'Journeys-Admin/Team/CustomDomain/CustomDomainDialog/DNSConfigSection'
}

const customDomain: CustomDomain = {
  __typename: 'CustomDomain',
  name: 'example.com',
  apexName: 'example.com',
  id: 'customDomainId',
  journeyCollection: null
}

const customSubdomain: CustomDomain = {
  __typename: 'CustomDomain',
  name: 'www.example.com',
  apexName: 'example.com',
  id: 'customDomainId',
  journeyCollection: null
}

const checkCustomDomainMock: (
  customDomainCheck?: Partial<CustomDomainCheck>
) => MockedResponse<CheckCustomDomain> = (customDomainCheck) => ({
  request: {
    query: CHECK_CUSTOM_DOMAIN,
    variables: {
      customDomainId: 'customDomainId'
    }
  },
  result: {
    data: {
      customDomainCheck: {
        __typename: 'CustomDomainCheck',
        configured: true,
        verified: true,
        verification: null,
        verificationResponse: null,
        ...customDomainCheck
      }
    }
  }
})

const Template: StoryObj<typeof DNSConfigSection> = {
  render: (args) => <DNSConfigSection {...args} />
}

export const Default = {
  ...Template,
  args: {
    customDomain
  },
  parameters: {
    apolloClient: {
      mocks: [checkCustomDomainMock()]
    }
  }
}

export const Loading = {
  ...Template,
  args: {
    customDomain
  },
  parameters: {
    apolloClient: {
      mocks: [{ ...checkCustomDomainMock(), delay: 100000000000000 }]
    }
  }
}

export const WithSubdomain = {
  ...Template,
  args: {
    customDomain: customSubdomain
  },
  parameters: {
    apolloClient: {
      mocks: [checkCustomDomainMock()]
    }
  }
}

export const Misconfigured = {
  ...Template,
  args: {
    customDomain
  },
  parameters: {
    apolloClient: {
      mocks: [checkCustomDomainMock({ configured: false })]
    }
  }
}

export const MisconfiguredWithSubdomain = {
  ...Template,
  args: {
    customDomain: customSubdomain
  },
  parameters: {
    apolloClient: {
      mocks: [checkCustomDomainMock({ configured: false })]
    }
  }
}

export const Unverified = {
  ...Template,
  args: {
    customDomain
  },
  parameters: {
    apolloClient: {
      mocks: [
        checkCustomDomainMock({
          verified: false,
          verification: [
            {
              __typename: 'CustomDomainVerification',
              type: 'TXT',
              domain: '_vercel.example.com',
              value: 'vc-domain-verify=example.com,61eb769fc89e3d03578a',
              reason: ''
            }
          ],
          verificationResponse: {
            __typename: 'CustomDomainVerificationResponse',
            code: 'missing_txt_record',
            message:
              'Domain _vercel.example.com is missing required TXT Record "vc-domain-verify=www.example.com,e886cd36c2ae9464e6b5"'
          }
        })
      ]
    }
  }
}

export const UnverifiedWithExistingProjectDomain = {
  ...Template,
  args: {
    customDomain
  },
  parameters: {
    apolloClient: {
      mocks: [
        checkCustomDomainMock({
          verified: false,
          verification: [
            {
              __typename: 'CustomDomainVerification',
              type: 'TXT',
              domain: '_vercel.example.com',
              value: 'vc-domain-verify=example.com,61eb769fc89e3d03578a',
              reason: ''
            }
          ],
          verificationResponse: {
            __typename: 'CustomDomainVerificationResponse',
            code: 'existing_project_domain',
            message:
              'Domain example.com was added to a different project. Please complete verification to add it to this project instead.'
          }
        })
      ]
    }
  }
}

export default DNSConfigSectionStory
