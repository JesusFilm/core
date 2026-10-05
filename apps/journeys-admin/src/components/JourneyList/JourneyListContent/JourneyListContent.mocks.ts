import { MockLink } from '@apollo/client/testing'

import {
  GetAdminJourneys,
  GetAdminJourneysVariables
} from '../../../../__generated__/GetAdminJourneys'
import { JourneyStatus } from '../../../../__generated__/globalTypes'
import { User } from '../../../libs/auth/authContext'
import { GET_ADMIN_JOURNEYS } from '../../../libs/useAdminJourneysQuery/useAdminJourneysQuery'
import { defaultJourney, oldJourney } from '../journeyListData'

import {
  ARCHIVE_ACTIVE_JOURNEYS,
  DELETE_TRASHED_JOURNEYS,
  RESTORE_ARCHIVED_JOURNEYS,
  RESTORE_TRASHED_JOURNEYS,
  TRASH_ACTIVE_JOURNEYS,
  TRASH_ARCHIVED_JOURNEYS
} from './JourneyListContent'

export const user: User = {
  id: 'user-id1',
  displayName: 'Test User',
  email: 'test@example.com',
  photoURL: null,
  phoneNumber: null,
  emailVerified: true,
  token: 'mock-token'
} as unknown as User

export const mockTeamId = 'team-id1'

export const activeJourneysMock: MockLink.MockedResponse<
  GetAdminJourneys,
  GetAdminJourneysVariables
> = {
  request: {
    query: GET_ADMIN_JOURNEYS,
    variables: {
      status: [JourneyStatus.draft, JourneyStatus.published],
      template: false,
      teamId: mockTeamId
    }
  },
  result: {
    data: {
      journeys: [defaultJourney, oldJourney]
    }
  }
}

export const noJourneysMock: MockLink.MockedResponse<
  GetAdminJourneys,
  GetAdminJourneysVariables
> = {
  request: {
    query: GET_ADMIN_JOURNEYS,
    variables: {
      status: [JourneyStatus.draft, JourneyStatus.published],
      template: false,
      teamId: mockTeamId
    }
  },
  result: {
    data: {
      journeys: []
    }
  }
}

export const templatesMock: MockLink.MockedResponse<
  GetAdminJourneys,
  GetAdminJourneysVariables
> = {
  request: {
    query: GET_ADMIN_JOURNEYS,
    variables: {
      status: [JourneyStatus.draft, JourneyStatus.published],
      template: true,
      teamId: mockTeamId
    }
  },
  result: {
    data: {
      journeys: [
        {
          ...defaultJourney,
          template: true
        }
      ]
    }
  }
}

export const archivedJourneysMock: MockLink.MockedResponse<
  GetAdminJourneys,
  GetAdminJourneysVariables
> = {
  request: {
    query: GET_ADMIN_JOURNEYS,
    variables: {
      status: [JourneyStatus.archived],
      template: false,
      teamId: mockTeamId
    }
  },
  result: {
    data: {
      journeys: [
        {
          ...defaultJourney,
          status: JourneyStatus.archived
        }
      ]
    }
  }
}

export const trashedJourneysMock: MockLink.MockedResponse<
  GetAdminJourneys,
  GetAdminJourneysVariables
> = {
  request: {
    query: GET_ADMIN_JOURNEYS,
    variables: {
      status: [JourneyStatus.trashed],
      template: false,
      teamId: mockTeamId
    }
  },
  result: {
    data: {
      journeys: [
        {
          ...defaultJourney,
          status: JourneyStatus.trashed,
          trashedAt: new Date().toISOString()
        }
      ]
    }
  }
}

export const noTemplatesMock: MockLink.MockedResponse<
  GetAdminJourneys,
  GetAdminJourneysVariables
> = {
  request: {
    query: GET_ADMIN_JOURNEYS,
    variables: {
      status: [JourneyStatus.draft, JourneyStatus.published],
      template: true,
      teamId: mockTeamId
    }
  },
  result: {
    data: {
      journeys: []
    }
  }
}

export const noArchivedMock: MockLink.MockedResponse<
  GetAdminJourneys,
  GetAdminJourneysVariables
> = {
  request: {
    query: GET_ADMIN_JOURNEYS,
    variables: {
      status: [JourneyStatus.archived],
      template: false,
      teamId: mockTeamId
    }
  },
  result: {
    data: {
      journeys: []
    }
  }
}

export const noTrashedMock: MockLink.MockedResponse<
  GetAdminJourneys,
  GetAdminJourneysVariables
> = {
  request: {
    query: GET_ADMIN_JOURNEYS,
    variables: {
      status: [JourneyStatus.trashed],
      template: false,
      teamId: mockTeamId
    }
  },
  result: {
    data: {
      journeys: []
    }
  }
}

export const archivedTemplatesMock: MockLink.MockedResponse<
  GetAdminJourneys,
  GetAdminJourneysVariables
> = {
  request: {
    query: GET_ADMIN_JOURNEYS,
    variables: {
      status: [JourneyStatus.archived],
      template: true,
      teamId: mockTeamId
    }
  },
  result: {
    data: {
      journeys: [
        {
          ...defaultJourney,
          status: JourneyStatus.archived,
          template: true
        }
      ]
    }
  }
}

export const noArchivedTemplatesMock: MockLink.MockedResponse<
  GetAdminJourneys,
  GetAdminJourneysVariables
> = {
  request: {
    query: GET_ADMIN_JOURNEYS,
    variables: {
      status: [JourneyStatus.archived],
      template: true,
      teamId: mockTeamId
    }
  },
  result: {
    data: {
      journeys: []
    }
  }
}

export const trashedTemplatesMock: MockLink.MockedResponse<
  GetAdminJourneys,
  GetAdminJourneysVariables
> = {
  request: {
    query: GET_ADMIN_JOURNEYS,
    variables: {
      status: [JourneyStatus.trashed],
      template: true,
      teamId: mockTeamId
    }
  },
  result: {
    data: {
      journeys: [
        {
          ...defaultJourney,
          status: JourneyStatus.trashed,
          template: true,
          trashedAt: new Date().toISOString()
        }
      ]
    }
  }
}

export const noTrashedTemplatesMock: MockLink.MockedResponse<
  GetAdminJourneys,
  GetAdminJourneysVariables
> = {
  request: {
    query: GET_ADMIN_JOURNEYS,
    variables: {
      status: [JourneyStatus.trashed],
      template: true,
      teamId: mockTeamId
    }
  },
  result: {
    data: {
      journeys: []
    }
  }
}

export const archiveActiveJourneysMutationMock: MockLink.MockedResponse = {
  request: {
    query: ARCHIVE_ACTIVE_JOURNEYS,
    variables: { ids: [defaultJourney.id, oldJourney.id] }
  },
  result: {
    data: {
      journeysArchive: [
        { id: defaultJourney.id, status: JourneyStatus.archived },
        { id: oldJourney.id, status: JourneyStatus.archived }
      ]
    }
  }
}

export const trashActiveJourneysMutationMock: MockLink.MockedResponse = {
  request: {
    query: TRASH_ACTIVE_JOURNEYS,
    variables: { ids: [defaultJourney.id, oldJourney.id] }
  },
  result: {
    data: {
      journeysTrash: [
        { id: defaultJourney.id, status: JourneyStatus.trashed },
        { id: oldJourney.id, status: JourneyStatus.trashed }
      ]
    }
  }
}

export const archiveActiveTemplatesMutationMock: MockLink.MockedResponse = {
  request: {
    query: ARCHIVE_ACTIVE_JOURNEYS,
    variables: { ids: [defaultJourney.id] }
  },
  result: {
    data: {
      journeysArchive: [
        { id: defaultJourney.id, status: JourneyStatus.archived }
      ]
    }
  }
}

export const trashActiveTemplatesMutationMock: MockLink.MockedResponse = {
  request: {
    query: TRASH_ACTIVE_JOURNEYS,
    variables: { ids: [defaultJourney.id] }
  },
  result: {
    data: {
      journeysTrash: [{ id: defaultJourney.id, status: JourneyStatus.trashed }]
    }
  }
}

export const restoreArchivedJourneysMutationMock: MockLink.MockedResponse = {
  request: {
    query: RESTORE_ARCHIVED_JOURNEYS,
    variables: { ids: [defaultJourney.id] }
  },
  result: {
    data: {
      journeysRestore: [
        { id: defaultJourney.id, status: JourneyStatus.published }
      ]
    }
  }
}

export const trashArchivedJourneysMutationMock: MockLink.MockedResponse = {
  request: {
    query: TRASH_ARCHIVED_JOURNEYS,
    variables: { ids: [defaultJourney.id] }
  },
  result: {
    data: {
      journeysTrash: [{ id: defaultJourney.id, status: JourneyStatus.trashed }]
    }
  }
}

export const restoreArchivedTemplatesMutationMock: MockLink.MockedResponse = {
  request: {
    query: RESTORE_ARCHIVED_JOURNEYS,
    variables: { ids: [defaultJourney.id] }
  },
  result: {
    data: {
      journeysRestore: [
        { id: defaultJourney.id, status: JourneyStatus.published }
      ]
    }
  }
}

export const trashArchivedTemplatesMutationMock: MockLink.MockedResponse = {
  request: {
    query: TRASH_ARCHIVED_JOURNEYS,
    variables: { ids: [defaultJourney.id] }
  },
  result: {
    data: {
      journeysTrash: [{ id: defaultJourney.id, status: JourneyStatus.trashed }]
    }
  }
}

export const restoreTrashedJourneysMutationMock: MockLink.MockedResponse = {
  request: {
    query: RESTORE_TRASHED_JOURNEYS,
    variables: { ids: [defaultJourney.id] }
  },
  result: {
    data: {
      journeysRestore: [
        { id: defaultJourney.id, status: JourneyStatus.published }
      ]
    }
  }
}

export const deleteTrashedJourneysMutationMock: MockLink.MockedResponse = {
  request: {
    query: DELETE_TRASHED_JOURNEYS,
    variables: { ids: [defaultJourney.id] }
  },
  result: {
    data: {
      journeysDelete: [{ id: defaultJourney.id, status: JourneyStatus.deleted }]
    }
  }
}

export const restoreTrashedTemplatesMutationMock: MockLink.MockedResponse = {
  request: {
    query: RESTORE_TRASHED_JOURNEYS,
    variables: { ids: [defaultJourney.id] }
  },
  result: {
    data: {
      journeysRestore: [
        { id: defaultJourney.id, status: JourneyStatus.published }
      ]
    }
  }
}

export const deleteTrashedTemplatesMutationMock: MockLink.MockedResponse = {
  request: {
    query: DELETE_TRASHED_JOURNEYS,
    variables: { ids: [defaultJourney.id] }
  },
  result: {
    data: {
      journeysDelete: [{ id: defaultJourney.id, status: JourneyStatus.deleted }]
    }
  }
}
