import { GET_DISCOVERY_JOURNEY } from './EmbedJourney/EmbedJourney'

export const mocks = [
  {
    request: {
      query: GET_DISCOVERY_JOURNEY,
      variables: {
        id: 'discovery-admin-left'
      }
    },
    result: {
      data: {
        discoveryJourney: {
          id: 'd3ec8a9a-51e8-4977-a4da-750245cc22d2',
          title: 'Discovery Journey - Vision',
          seoTitle: null,
          blocks: [
            {
              id: '3250f2c3-082f-4373-b46d-d2e4df899789',
              parentBlockId: null,
              parentOrder: 0,
              locked: false,
              nextBlockId: null,
              __typename: 'StepBlock'
            },
            {
              id: '89bd305e-3662-4d1e-913a-066f2f55d9c0',
              parentBlockId: '3250f2c3-082f-4373-b46d-d2e4df899789',
              parentOrder: 0,
              backgroundColor: '#FFFFFF',
              coverBlockId: '8c1a1509-685c-4c5e-9bbf-f3b9dd0e7aff',
              themeMode: 'light',
              themeName: 'base',
              fullscreen: false,
              __typename: 'CardBlock'
            },
            {
              id: 'aee42424-97bb-4a60-b459-8123b97868a6',
              parentBlockId: '89bd305e-3662-4d1e-913a-066f2f55d9c0',
              parentOrder: 0,
              align: 'center',
              color: null,
              content: 'Vision',
              variant: 'h6',
              __typename: 'TypographyBlock'
            },
            {
              id: '74bf83db-292b-47e9-b465-7044f12c0bc4',
              parentBlockId: '89bd305e-3662-4d1e-913a-066f2f55d9c0',
              parentOrder: 1,
              align: 'center',
              color: null,
              content: 'Innovation in Digital Missions',
              variant: 'h1',
              __typename: 'TypographyBlock'
            },
            {
              id: '65862251-8e65-4430-9e98-cd909b85bb4f',
              parentBlockId: '89bd305e-3662-4d1e-913a-066f2f55d9c0',
              parentOrder: 2,
              label:
                'Learn how NextSteps can be instrumental in reaching the lost.',
              buttonVariant: 'text',
              buttonColor: 'primary',
              size: 'medium',
              startIconId: null,
              endIconId: null,
              action: null,
              __typename: 'ButtonBlock'
            },
            {
              id: '8c1a1509-685c-4c5e-9bbf-f3b9dd0e7aff',
              parentBlockId: '89bd305e-3662-4d1e-913a-066f2f55d9c0',
              parentOrder: null,
              src: 'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/0faecc7a-1749-4e2c-66a0-4dde6d5cbc00/public',
              alt: 'public',
              width: 6000,
              height: 4000,
              blurhash: 'LZECIr~Xxtxb?K?I%LocIUWCxubD',
              __typename: 'ImageBlock'
            }
          ],
          __typename: 'Journey'
        }
      }
    }
  },
  {
    request: {
      query: GET_DISCOVERY_JOURNEY,
      variables: {
        id: 'discovery-admin-center'
      }
    },
    result: {
      data: {
        discoveryJourney: {
          id: 'b6cf2b79-31f2-46f2-8ffe-aa9190f88905',
          title: 'Discovery Journey - How To',
          seoTitle: null,
          blocks: [
            {
              id: 'fcd8c212-71a2-4a36-a8cd-4790adf379ca',
              parentBlockId: '099e8cd9-5f1f-4717-89a5-2e30bc2b2b91',
              parentOrder: 0,
              align: 'center',
              color: null,
              content: 'How To',
              variant: 'h6',
              __typename: 'TypographyBlock'
            },
            {
              id: '74eabb3f-0477-4829-bb8f-3ab0ff5bf0f7',
              parentBlockId: null,
              parentOrder: 0,
              locked: false,
              nextBlockId: null,
              __typename: 'StepBlock'
            },
            {
              id: '099e8cd9-5f1f-4717-89a5-2e30bc2b2b91',
              parentBlockId: '74eabb3f-0477-4829-bb8f-3ab0ff5bf0f7',
              parentOrder: 0,
              backgroundColor: '#FFFFFF',
              coverBlockId: '8aa78d0c-10c1-4266-9c30-e7125f607cb6',
              themeMode: 'light',
              themeName: 'base',
              fullscreen: false,
              __typename: 'CardBlock'
            },
            {
              id: '7465565f-d8f7-4a83-9456-eb34f43a4240',
              parentBlockId: '099e8cd9-5f1f-4717-89a5-2e30bc2b2b91',
              parentOrder: 1,
              align: 'center',
              color: null,
              content: 'Making Journeys',
              variant: 'h1',
              __typename: 'TypographyBlock'
            },
            {
              id: 'eba86e89-4d0e-4d92-80ab-47222a3b7c62',
              parentBlockId: '099e8cd9-5f1f-4717-89a5-2e30bc2b2b91',
              parentOrder: 2,
              align: 'center',
              color: null,
              content: 'Need more instruction? \nClick below to find help.',
              variant: 'body1',
              __typename: 'TypographyBlock'
            },
            {
              id: '06518d87-c12e-40fa-a5df-083c2528b6ab',
              parentBlockId: '099e8cd9-5f1f-4717-89a5-2e30bc2b2b91',
              parentOrder: 3,
              label: 'Open Help Site',
              buttonVariant: 'text',
              buttonColor: 'primary',
              size: 'large',
              startIconId: null,
              endIconId: '4371f1a9-9e10-4a54-bc1c-15338f8656b1',
              action: null,
              __typename: 'ButtonBlock'
            },
            {
              id: '8aa78d0c-10c1-4266-9c30-e7125f607cb6',
              parentBlockId: '099e8cd9-5f1f-4717-89a5-2e30bc2b2b91',
              parentOrder: null,
              src: 'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/bd04bbd5-7882-486e-cfe9-fe29868b1900/public',
              alt: 'public',
              width: 1303,
              height: 768,
              blurhash: 'UdKUcvR+oyM{~qt7M_j@-;Rjogt7D%RPs:t6',
              __typename: 'ImageBlock'
            },
            {
              id: '4371f1a9-9e10-4a54-bc1c-15338f8656b1',
              parentBlockId: '06518d87-c12e-40fa-a5df-083c2528b6ab',
              parentOrder: null,
              iconName: 'ContactSupportRounded',
              iconSize: null,
              iconColor: null,
              __typename: 'IconBlock'
            }
          ],
          __typename: 'Journey'
        }
      }
    }
  },
  {
    request: {
      query: GET_DISCOVERY_JOURNEY,
      variables: {
        id: 'discovery-admin-right'
      }
    },
    result: {
      data: {
        discoveryJourney: {
          id: 'b4e65885-4da2-4441-b23f-0a167d411f17',
          title: 'Discovery Journey - Feedback',
          seoTitle: null,
          blocks: [
            {
              id: 'd7b268c7-e05f-4b84-b7b9-8de3aa754e3f',
              parentBlockId: 'e1347399-b88d-40a6-b2b2-b75ca16e66c4',
              parentOrder: 0,
              align: 'center',
              color: null,
              content: 'Feedback',
              variant: 'h6',
              __typename: 'TypographyBlock'
            },
            {
              id: 'e1347399-b88d-40a6-b2b2-b75ca16e66c4',
              parentBlockId: '53c06a04-f4f2-4ac1-92e6-a12d575f8832',
              parentOrder: 0,
              backgroundColor: null,
              coverBlockId: 'c04ceca9-811a-4993-b5de-d4992c158336',
              themeMode: 'light',
              themeName: 'base',
              fullscreen: false,
              __typename: 'CardBlock'
            },
            {
              id: '53c06a04-f4f2-4ac1-92e6-a12d575f8832',
              parentBlockId: null,
              parentOrder: 0,
              locked: false,
              nextBlockId: null,
              __typename: 'StepBlock'
            },
            {
              id: '5d8aa750-b639-45a3-a207-49a89349e377',
              parentBlockId: 'e1347399-b88d-40a6-b2b2-b75ca16e66c4',
              parentOrder: 1,
              align: 'center',
              color: null,
              content: 'We Want to Hear From You!',
              variant: 'h1',
              __typename: 'TypographyBlock'
            },
            {
              id: '113d3144-971c-49c3-ab82-83c04aadf9bd',
              parentBlockId: 'e1347399-b88d-40a6-b2b2-b75ca16e66c4',
              parentOrder: 2,
              label: 'Make a suggestion',
              buttonVariant: 'text',
              buttonColor: 'primary',
              size: 'large',
              startIconId: null,
              endIconId: '74f4af70-dcb7-4689-a4d1-d97089e7d8bc',
              action: null,
              __typename: 'ButtonBlock'
            },
            {
              id: 'c04ceca9-811a-4993-b5de-d4992c158336',
              parentBlockId: 'e1347399-b88d-40a6-b2b2-b75ca16e66c4',
              parentOrder: null,
              src: 'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/83f612f9-6b75-466f-9b63-5e042f554600/public',
              alt: 'public',
              width: 1152,
              height: 768,
              blurhash: 'UDNcya_NELV@^*%2s:NG01D$$hR*?G%Nf+t7',
              __typename: 'ImageBlock'
            },
            {
              id: '74f4af70-dcb7-4689-a4d1-d97089e7d8bc',
              parentBlockId: '113d3144-971c-49c3-ab82-83c04aadf9bd',
              parentOrder: null,
              iconName: 'ArrowForwardRounded',
              iconSize: null,
              iconColor: null,
              __typename: 'IconBlock'
            }
          ],
          __typename: 'Journey'
        }
      }
    }
  }
]
