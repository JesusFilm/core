import { MockedResponse } from '@apollo/client/testing'

import {
  GetDiscoveryJourneys_discoveryJourneys as DiscoveryJourneys,
  GetDiscoveryJourneys
} from '../../../__generated__/GetDiscoveryJourneys'
import {
  ButtonColor,
  ButtonSize,
  ButtonVariant,
  IconName,
  ThemeMode,
  ThemeName,
  TypographyAlign,
  TypographyVariant
} from '../../../__generated__/globalTypes'

import { GET_DISCOVERY_JOURNEYS } from './DiscoveryJourneys'

export const discoveryJourneys: DiscoveryJourneys[] = [
  {
    id: '336ea06f-c08a-4d27-9bb7-16336d1a1f98',
    seoTitle: 'Beta Version ',
    blocks: [
      {
        id: '3724621a-7539-4946-950c-d5b764b767f9',
        parentBlockId: null,
        parentOrder: 0,
        locked: false,
        nextBlockId: null,
        __typename: 'StepBlock'
      },
      {
        id: 'bbd6b8ac-39f1-4e1a-820f-b7414918fab0',
        parentBlockId: '3724621a-7539-4946-950c-d5b764b767f9',
        parentOrder: 0,
        backgroundColor: '#FFFFFF',
        coverBlockId: null,
        themeMode: ThemeMode.light,
        themeName: ThemeName.base,
        fullscreen: false,
        __typename: 'CardBlock'
      },
      {
        id: '8b724278-1a1d-484b-86db-52b79ac2da2d',
        parentBlockId: 'bbd6b8ac-39f1-4e1a-820f-b7414918fab0',
        parentOrder: 0,
        align: TypographyAlign.center,
        color: null,
        content: '⚠️',
        variant: TypographyVariant.h1,
        __typename: 'TypographyBlock'
      },
      {
        id: '10482a9c-06cf-4584-98a9-b2b108c03121',
        parentBlockId: 'bbd6b8ac-39f1-4e1a-820f-b7414918fab0',
        parentOrder: 1,
        align: TypographyAlign.center,
        color: null,
        content: 'BETA VERSION',
        variant: TypographyVariant.h6,
        __typename: 'TypographyBlock'
      },
      {
        id: 'c8a4ee5b-f23d-4ffc-ab89-397b36636c58',
        parentBlockId: 'bbd6b8ac-39f1-4e1a-820f-b7414918fab0',
        parentOrder: 2,
        align: TypographyAlign.center,
        color: null,
        content: 'NEW HERE?',
        variant: TypographyVariant.h2,
        __typename: 'TypographyBlock'
      },
      {
        id: '27d4e497-f830-4cf8-87d1-58c8671a80ca',
        parentBlockId: 'bbd6b8ac-39f1-4e1a-820f-b7414918fab0',
        parentOrder: 3,
        align: TypographyAlign.center,
        color: null,
        content:
          'You are one of the first users to test our product. Learn about limitations.',
        variant: TypographyVariant.body1,
        __typename: 'TypographyBlock'
      },
      {
        id: '465c7a41-38f4-4ea3-95ea-b3c3db6b66ad',
        parentBlockId: 'bbd6b8ac-39f1-4e1a-820f-b7414918fab0',
        parentOrder: 4,
        label: 'Start Here',
        buttonVariant: ButtonVariant.text,
        buttonColor: ButtonColor.secondary,
        size: ButtonSize.large,
        startIconId: null,
        endIconId: 'e7fb67f3-6bf9-4e71-83ef-6b0bc2f9a790',
        action: null,
        __typename: 'ButtonBlock'
      },
      {
        id: 'e7fb67f3-6bf9-4e71-83ef-6b0bc2f9a790',
        parentBlockId: '465c7a41-38f4-4ea3-95ea-b3c3db6b66ad',
        parentOrder: null,
        iconName: IconName.ArrowForwardRounded,
        iconSize: null,
        iconColor: null,
        __typename: 'IconBlock'
      }
    ],
    __typename: 'Journey'
  },
  {
    id: 'f76713ff-1ec0-499c-87fa-5aa394ca66cf',
    seoTitle: 'Tutorials',
    blocks: [
      {
        id: 'ed3d2e81-c2dd-4573-9e1f-745351c5b1ea',
        parentBlockId: null,
        parentOrder: 0,
        locked: false,
        nextBlockId: null,
        __typename: 'StepBlock'
      },
      {
        id: 'a1aa5824-6017-4ce4-98d4-1b66343dbe87',
        parentBlockId: 'ed3d2e81-c2dd-4573-9e1f-745351c5b1ea',
        parentOrder: 0,
        backgroundColor: '#FFFFFF',
        coverBlockId: null,
        themeMode: ThemeMode.light,
        themeName: ThemeName.base,
        fullscreen: false,
        __typename: 'CardBlock'
      },
      {
        id: 'ec48faab-2ecd-429c-b1b3-81204fad3ced',
        parentBlockId: 'a1aa5824-6017-4ce4-98d4-1b66343dbe87',
        parentOrder: 0,
        align: TypographyAlign.center,
        color: null,
        content: '🧭',
        variant: TypographyVariant.h1,
        __typename: 'TypographyBlock'
      },
      {
        id: '98711407-d4e6-44b3-a710-2f960b567697',
        parentBlockId: 'a1aa5824-6017-4ce4-98d4-1b66343dbe87',
        parentOrder: 1,
        align: TypographyAlign.center,
        color: null,
        content: 'HELP CENTER',
        variant: TypographyVariant.h6,
        __typename: 'TypographyBlock'
      },
      {
        id: '65ff04a1-a034-424b-8c0d-69a566ee6ef0',
        parentBlockId: 'a1aa5824-6017-4ce4-98d4-1b66343dbe87',
        parentOrder: 2,
        align: TypographyAlign.center,
        color: null,
        content: 'TUTORIALS',
        variant: TypographyVariant.h2,
        __typename: 'TypographyBlock'
      },
      {
        id: '69ef9d88-4e99-484c-acf1-3b66a5159162',
        parentBlockId: 'a1aa5824-6017-4ce4-98d4-1b66343dbe87',
        parentOrder: 3,
        align: TypographyAlign.center,
        color: null,
        content: 'Watch our video tutorials\nor ask a question',
        variant: TypographyVariant.body1,
        __typename: 'TypographyBlock'
      },
      {
        id: '91505e5e-4f5c-4f16-8e3e-b73ad794211f',
        parentBlockId: 'a1aa5824-6017-4ce4-98d4-1b66343dbe87',
        parentOrder: 4,
        label: 'Learn More',
        buttonVariant: ButtonVariant.text,
        buttonColor: ButtonColor.primary,
        size: ButtonSize.large,
        startIconId: null,
        endIconId: 'b0439cf7-4521-4b84-9883-569b455f2ea7',
        action: null,
        __typename: 'ButtonBlock'
      },
      {
        id: 'b0439cf7-4521-4b84-9883-569b455f2ea7',
        parentBlockId: '91505e5e-4f5c-4f16-8e3e-b73ad794211f',
        parentOrder: null,
        iconName: IconName.ArrowForwardRounded,
        iconSize: null,
        iconColor: null,
        __typename: 'IconBlock'
      }
    ],
    __typename: 'Journey'
  },
  {
    id: '22ff40a2-b3a3-48af-b48a-6f9ee600bf33',
    seoTitle: 'Onboarding',
    blocks: [
      {
        id: 'e3b3196a-02d8-4a23-881e-9151ac0afef7',
        parentBlockId: null,
        parentOrder: 0,
        locked: false,
        nextBlockId: null,
        __typename: 'StepBlock'
      },
      {
        id: '9e178a41-ce1e-4091-9310-33e247780311',
        parentBlockId: 'e3b3196a-02d8-4a23-881e-9151ac0afef7',
        parentOrder: 0,
        backgroundColor: null,
        coverBlockId: null,
        themeMode: ThemeMode.light,
        themeName: ThemeName.base,
        fullscreen: false,
        __typename: 'CardBlock'
      },
      {
        id: 'da8c8f8c-a9b9-4058-9ccf-6757835a6c8b',
        parentBlockId: '9e178a41-ce1e-4091-9310-33e247780311',
        parentOrder: 0,
        align: TypographyAlign.center,
        color: null,
        content: '💬',
        variant: TypographyVariant.h1,
        __typename: 'TypographyBlock'
      },
      {
        id: 'd9de5dca-8eb2-4e19-bbde-2ced5d1d5eb7',
        parentBlockId: '9e178a41-ce1e-4091-9310-33e247780311',
        parentOrder: 1,
        align: TypographyAlign.center,
        color: null,
        content: 'Free one-on-one',
        variant: TypographyVariant.h6,
        __typename: 'TypographyBlock'
      },
      {
        id: '13d47b1b-d0b6-4af0-8e23-832b438d9a1c',
        parentBlockId: '9e178a41-ce1e-4091-9310-33e247780311',
        parentOrder: 2,
        align: TypographyAlign.center,
        color: null,
        content: 'ONBOARDING',
        variant: TypographyVariant.h2,
        __typename: 'TypographyBlock'
      },
      {
        id: '1e9d5926-ea58-44c9-8288-cb843d7bb098',
        parentBlockId: '9e178a41-ce1e-4091-9310-33e247780311',
        parentOrder: 3,
        align: TypographyAlign.center,
        color: null,
        content:
          'Get hands-on guidance and personalized support or share your feedback',
        variant: TypographyVariant.body1,
        __typename: 'TypographyBlock'
      },
      {
        id: 'b35c9995-328e-456b-a260-302eddda803d',
        parentBlockId: '9e178a41-ce1e-4091-9310-33e247780311',
        parentOrder: 4,
        label: 'Request Now',
        buttonVariant: ButtonVariant.text,
        buttonColor: ButtonColor.primary,
        size: ButtonSize.large,
        startIconId: null,
        endIconId: '4c9033bb-25cb-4456-a95b-443a30c914d9',
        action: null,
        __typename: 'ButtonBlock'
      },
      {
        id: '4c9033bb-25cb-4456-a95b-443a30c914d9',
        parentBlockId: 'b35c9995-328e-456b-a260-302eddda803d',
        parentOrder: null,
        iconName: IconName.ArrowForwardRounded,
        iconSize: null,
        iconColor: null,
        __typename: 'IconBlock'
      }
    ],
    __typename: 'Journey'
  }
]

export const getDiscoveryJourneysMock: MockedResponse<GetDiscoveryJourneys> = {
  request: {
    query: GET_DISCOVERY_JOURNEYS,
    variables: {
      where: {
        ids: [
          '336ea06f-c08a-4d27-9bb7-16336d1a1f98',
          'f76713ff-1ec0-499c-87fa-5aa394ca66cf',
          '22ff40a2-b3a3-48af-b48a-6f9ee600bf33'
        ]
      }
    }
  },
  result: {
    data: {
      discoveryJourneys
    }
  }
}
