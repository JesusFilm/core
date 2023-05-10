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
    id: '1',
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
    id: '2',
    name: undefined,
    location: 'Dnipro, Ukraine',
    source: 'Youtube',
    createdAt: '2022-11-02T03:20:26.368Z',
    duration: '3 sec',
    icon: undefined,
    events: []
  },
  {
    id: '3',
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
    id: '4',
    name: undefined,
    location: 'Auckland, New Zealand',
    source: 'WhatsApp',
    createdAt: '2022-11-02T03:20:26.368Z',
    duration: '0 min',
    icon: undefined,
    events: []
  }
]
