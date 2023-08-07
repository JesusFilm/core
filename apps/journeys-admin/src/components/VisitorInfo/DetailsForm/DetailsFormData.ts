import { GetVisitorForForm } from '../../../../__generated__/GetVisitorForForm'
import {
  MessagePlatform,
  VisitorStatus,
  VisitorUpdateInput
} from '../../../../__generated__/globalTypes'
import { VisitorUpdate } from '../../../../__generated__/VisitorUpdate'

import { GET_VISITOR_FOR_FORM, VISITOR_UPDATE } from './DetailsForm'

const getVisitor: GetVisitorForForm = {
  visitor: {
    __typename: 'Visitor',
    id: 'visitorId',
    messagePlatformId: '0800123456',
    messagePlatform: MessagePlatform.whatsApp,
    name: 'Bilbo Baggins',
    notes: 'Has a ring to give you.',
    status: VisitorStatus.partyPopper,
    countryCode: null,
    lastChatStartedAt: null
  }
}

export const getVisitorMock = {
  request: {
    query: GET_VISITOR_FOR_FORM,
    variables: {
      id: 'visitorId'
    }
  },
  result: {
    data: getVisitor
  }
}

const getVisitorUnfilled: GetVisitorForForm = {
  visitor: {
    __typename: 'Visitor',
    id: 'visitorId',
    messagePlatformId: null,
    messagePlatform: null,
    name: null,
    notes: null,
    status: null,
    countryCode: null,
    lastChatStartedAt: null
  }
}

export const getVisitorUnfilledMock = {
  request: {
    query: GET_VISITOR_FOR_FORM,
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
