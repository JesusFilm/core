import { Meta, StoryObj } from '@storybook/react'

import { simpleComponentConfig } from '../../libs/storybook'

import { OnboardingForm } from '.'

const OnboardingFormStory: Meta<typeof OnboardingForm> = {
  ...simpleComponentConfig,
  component: OnboardingForm,
  title: 'Journeys-Admin/OnboardingForm'
}

const form = {
  id: '65138709d7745a0001e7fc30',
  customerId: '650cebe8d7745a0001e7dc83',
  projectId: '650cebe8d7745a0001e7dc84',
  name: 'A few Questions',
  previewMode: 'HOSTED',
  schema: {
    pageIds: ['kAK5E-4QC', 'xk74F-Mb-', 'Rf9XOdOhk'],
    fields: {
      'kAK5E-4QC': {
        id: 'kAK5E-4QC',
        title: 'A Few Questions',
        slug: 'aFewQuestions',
        type: 'PAGE',
        hidden: false,
        dynamic: false,
        orderLast: false,
        items: ['RNCHPInKt', 'KyUmNVOxt', '4BQGBCa_S', 'Yj4LTaB23'],
        actions: []
      },
      RNCHPInKt: {
        id: 'RNCHPInKt',
        title: 'Hidden User Id',
        slug: 'hiddenUserId',
        type: 'SHORT_TEXT',
        hidden: true,
        dynamic: false,
        orderLast: false,
        items: [],
        actions: []
      },
      KyUmNVOxt: {
        id: 'KyUmNVOxt',
        title: 'Hidden User Email',
        slug: 'hiddenUserEmail',
        type: 'SHORT_TEXT',
        hidden: true,
        dynamic: false,
        orderLast: false,
        items: [],
        actions: []
      },
      '4BQGBCa_S': {
        id: '4BQGBCa_S',
        title: "What's powering your digital ministry?",
        slug: 'dsTools',
        type: 'CHECKBOX',
        required: true,
        hidden: false,
        dynamic: false,
        description: 'The platform and tools you use.',
        orderLast: false,
        items: [
          'LN6kUgwbZ',
          'yLu6nhIx_',
          'afuusgxRe',
          'wViuvZe_R',
          'rVN3pxmNq',
          '7d4fLrQEs'
        ],
        actions: [
          {
            action: 'SHOW',
            details: { to: [{ type: 'FIELD', value: 'Yj4LTaB23' }] },
            condition: {
              op: 'and',
              vars: [
                {
                  op: 'eq',
                  vars: [
                    { op: 'field', value: '4BQGBCa_S' },
                    { op: 'choice', value: '7d4fLrQEs' }
                  ]
                }
              ]
            }
          }
        ]
      },
      LN6kUgwbZ: {
        id: 'LN6kUgwbZ',
        title: 'Social Media (Ads, Social Sharing, Publishing)',
        slug: 'LN6kUgwbZ',
        type: 'CHOICE',
        hidden: false,
        dynamic: false,
        orderLast: false,
        items: [],
        actions: []
      },
      yLu6nhIx_: {
        id: 'yLu6nhIx_',
        title: 'Search Engines (SEO, Paid Ads)',
        slug: 'yLu6nhIx_',
        type: 'CHOICE',
        hidden: false,
        dynamic: false,
        orderLast: false,
        items: [],
        actions: []
      },
      afuusgxRe: {
        id: 'afuusgxRe',
        title: 'Messaging, Chat, or Contact Forms',
        slug: 'afuusgxRe',
        type: 'CHOICE',
        hidden: false,
        dynamic: false,
        orderLast: false,
        items: [],
        actions: []
      },
      wViuvZe_R: {
        id: 'wViuvZe_R',
        title: 'Offline Digital Tools (QR Codes, Links)',
        slug: 'wViuvZe_R',
        type: 'CHOICE',
        hidden: false,
        dynamic: false,
        orderLast: false,
        items: [],
        actions: []
      },
      rVN3pxmNq: {
        id: 'rVN3pxmNq',
        title: "I'm not doing online ministry",
        slug: 'rVN3pxmNq',
        type: 'CHOICE',
        hidden: false,
        dynamic: false,
        orderLast: false,
        items: [],
        actions: []
      },
      '7d4fLrQEs': {
        id: '7d4fLrQEs',
        title: 'Other',
        slug: '7d4fLrQEs',
        type: 'CHOICE',
        hidden: false,
        dynamic: false,
        orderLast: false,
        items: [],
        actions: []
      },
      Yj4LTaB23: {
        id: 'Yj4LTaB23',
        title: 'What other tools do you use?',
        slug: 'dsToolsOther',
        type: 'SHORT_TEXT',
        hidden: true,
        dynamic: false,
        orderLast: false,
        items: [],
        actions: []
      },
      'xk74F-Mb-': {
        id: 'xk74F-Mb-',
        title: 'A Few Questions',
        slug: 'xk74F-Mb-',
        type: 'PAGE',
        hidden: false,
        dynamic: false,
        orderLast: false,
        items: ['gVgMVoMLWz'],
        actions: []
      },
      gVgMVoMLWz: {
        id: 'gVgMVoMLWz',
        title: 'How often do you engage in online ministry?',
        slug: 'dsFrequency',
        type: 'RADIO',
        required: true,
        hidden: false,
        dynamic: false,
        description: 'Your Digital Outreach',
        orderLast: false,
        items: ['X52NHoJ48', 'jg6qxH-nL', '4DKPcPV1F', 'ua87pDis_'],
        actions: []
      },
      X52NHoJ48: {
        id: 'X52NHoJ48',
        title: 'Less than a day per week',
        slug: 'X52NHoJ48',
        type: 'CHOICE',
        hidden: false,
        dynamic: false,
        orderLast: false,
        items: [],
        actions: []
      },
      'jg6qxH-nL': {
        id: 'jg6qxH-nL',
        title: '1 to 2 days per week',
        slug: 'jg6qxH-nL',
        type: 'CHOICE',
        hidden: false,
        dynamic: false,
        orderLast: false,
        items: [],
        actions: []
      },
      '4DKPcPV1F': {
        id: '4DKPcPV1F',
        title: '4 to 5 days per week',
        slug: '4DKPcPV1F',
        type: 'CHOICE',
        hidden: false,
        dynamic: false,
        orderLast: false,
        items: [],
        actions: []
      },
      ua87pDis_: {
        id: 'ua87pDis_',
        title: 'Not applicable',
        slug: 'ua87pDis_',
        type: 'CHOICE',
        hidden: false,
        dynamic: false,
        orderLast: false,
        items: [],
        actions: []
      },
      Rf9XOdOhk: {
        id: 'Rf9XOdOhk',
        title: 'A Few Questions',
        slug: 'Rf9XOdOhk',
        type: 'PAGE',
        hidden: false,
        dynamic: false,
        orderLast: false,
        items: ['H1manuhEBJ'],
        actions: []
      },
      H1manuhEBJ: {
        id: 'H1manuhEBJ',
        title:
          'What challenges or obstacles do you frequently encounter in online ministry?',
        slug: 'dsChallenges',
        type: 'LONG_TEXT',
        hidden: false,
        dynamic: false,
        orderLast: false,
        items: [],
        actions: []
      }
    }
  },
  slug: 'ns-onboarding-form',
  keys: [
    { name: 'hiddenUserId', visibility: 'SHOWN' },
    { name: 'hiddenUserEmail', visibility: 'SHOWN' },
    { name: 'dsTools', visibility: 'SHOWN' },
    { name: 'dsToolsOther', visibility: 'SHOWN' },
    { name: 'dsFrequency', visibility: 'SHOWN' },
    { name: 'dsChallenges', visibility: 'SHOWN' },
    { name: 'X52NHoJ48', visibility: 'SHOWN' }
  ],
  submitLayout: 'LIST',
  uploadTypes: [],
  status: 'ACTIVE',
  validate: 'ANY',
  actionIds: [],
  submitCount: 6,
  version: 14,
  createAt: '2023-09-27T01:36:09.393Z',
  createId: '65109e23d7745a0001e7ecbf',
  updateAt: '2023-10-03T23:12:39.618Z',
  updateId: '651c9fe7d7745a0001e82613'
}

const Template: StoryObj<typeof OnboardingForm> = {
  render: ({ ...args }) => {
    return <OnboardingForm {...args} />
  }
}

export const Default = {
  ...Template,
  args: {
    form,
    authUser: {
      id: 'user.id',
      email: 'user@eample.com'
    }
  }
}

export default OnboardingFormStory
