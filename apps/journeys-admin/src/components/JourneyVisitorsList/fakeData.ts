export interface Journey {
  id: string
  name?: string
  location?: string
  source?: string
  createdAt: string
  duration: string
  icon?: string
  events: Event[]
}

export interface Event {
  __typename: string
  label: string
  value: string
}

export const fakeJourneys: Journey[] = [
  {
    id: '36f0af56-2aa0-4477-8b79-f8303182c69b',
    name: 'Ben',
    location: 'Dnipro, Ukraine',
    source: 'Facebook',
    createdAt: '2022-11-02T03:20:26.368Z',
    duration: '5 min',
    icon: 'tick',
    events: [
      {
        __typename: 'Chat',
        label: 'Chat Started',
        value: '2:34pm'
      },
      {
        __typename: 'Poll',
        label: 'Do you think Jesus loves you?',
        value: 'Yes, Im sure of it!'
      },
      {
        __typename: 'Text',
        label: 'If you have any question...',
        value:
          'Sometimes its hard to hear God, but we know that God delights in the prayers of the faithful, and He promises to give us what we need.'
      }
    ]
  },
  {
    id: '416960f7-b037-481e-80e3-3e4d9897970a',
    name: undefined,
    location: 'Dnipro, Ukraine',
    source: 'Youtube',
    createdAt: '2022-11-02T03:20:26.368Z',
    duration: '3 sec',
    icon: undefined,
    events: []
  },
  {
    id: '0c874c32-ac87-4480-b0fb-23ef3d61babe',
    name: 'John',
    location: 'Halifax, Canada',
    source: 'Facebook',
    createdAt: '2022-11-02T03:20:26.368Z',
    duration: '5 min',
    icon: 'warning',
    events: [
      {
        __typename: 'Poll',
        label: 'Do you think Jesus loves you?',
        value: 'Yes, Im sure of it!'
      }
    ]
  },
  {
    id: '0357598b-597d-4419-8c7c-d94854f8a95b',
    name: undefined,
    location: 'Auckland, New Zealand',
    source: 'WhatsApp',
    createdAt: '2022-11-02T03:20:26.368Z',
    duration: '0 min',
    icon: undefined,
    events: []
  }
]
