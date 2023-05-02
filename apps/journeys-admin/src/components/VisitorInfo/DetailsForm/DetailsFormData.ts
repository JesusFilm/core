import { VisitorUpdate } from '../../../../__generated__/VisitorUpdate'
import { GetVisitor } from '../../../../__generated__/GetVisitor'
import {
  MessagePlatform,
  VisitorStatus,
  VisitorUpdateInput
} from '../../../../__generated__/globalTypes'
import { GET_VISITOR, VISITOR_UPDATE } from './DetailsForm'

const getVisitor: GetVisitor = {
  visitor: {
    __typename: 'Visitor',
    id: 'visitorId',
    countryCode: 'NZ',
    lastChatStartedAt: '2022-11-02T03:20:26.368Z',
    messagePlatformId: '0800123456',
    messagePlatform: MessagePlatform.whatsApp,
    name: 'Bilbo Baggins',
    notes: 'Has a ring to give you.',
    status: VisitorStatus.partyPopper
  }
}

export const getVisitorMock = {
  request: {
    query: GET_VISITOR,
    variables: {
      id: 'visitorId'
    }
  },
  result: {
    data: getVisitor
  }
}

const getVisitorUnfilled: GetVisitor = {
  visitor: {
    __typename: 'Visitor',
    id: 'visitorId',
    countryCode: null,
    lastChatStartedAt: null,
    messagePlatformId: null,
    messagePlatform: null,
    name: null,
    notes: null,
    status: null
  }
}

export const getVisitorUnfilledMock = {
  request: {
    query: GET_VISITOR,
    variables: {
      id: 'visitorId'
    }
  },
  result: {
    data: getVisitorUnfilled
  }
}

const visitorUpdate: VisitorUpdate = {
  visitorUpdate: {
    __typename: 'Visitor',
    id: 'visitorId',
    messagePlatformId: '0800123456',
    messagePlatform: MessagePlatform.whatsApp,
    name: 'Bilbo Baggins',
    notes: 'Has a ring to give you.',
    status: null
  }
}

const visitorUpdateInput: VisitorUpdateInput = {
  messagePlatformId: '0800123456',
  messagePlatform: MessagePlatform.whatsApp,
  name: 'Bilbo Baggins',
  notes: 'Has a ring to give you.',
  status: null
}

export const visitorUpdateMock = {
  request: {
    query: VISITOR_UPDATE,
    variables: {
      id: 'visitorId',
      input: visitorUpdateInput
    }
  },
  result: {
    data: visitorUpdate
  }
}
