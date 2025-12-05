import { MockedResponse } from '@apollo/client/testing'
import { User } from 'next-firebase-auth'

import {
  GetAdminJourneys,
  GetAdminJourneysVariables
} from '../../../../__generated__/GetAdminJourneys'
import { JourneyStatus } from '../../../../__generated__/globalTypes'
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
  email: 'test@example.com'
} as unknown as User

export const activeJourneysMock: MockedResponse<
  GetAdminJourneys,
  GetAdminJourneysVariables
> = {
  request: {
    query: GET_ADMIN_JOURNEYS,
    variables: {
      status: [JourneyStatus.draft, JourneyStatus.published],
      template: false,
      useLastActiveTeamId: true
    }
  },
  result: {
    data: {
      journeys: [defaultJourney, oldJourney]
    }
  }
}

export const noJourneysMock: MockedResponse<
  GetAdminJourneys,
  GetAdminJourneysVariables
> = {
  request: {
    query: GET_ADMIN_JOURNEYS,
    variables: {
      status: [JourneyStatus.draft, JourneyStatus.published],
      template: false,
      useLastActiveTeamId: true
    }
  },
  result: {
    data: {
      journeys: []
    }
  }
}

export const templatesMock: MockedResponse<
  GetAdminJourneys,
  GetAdminJourneysVariables
> = {
  request: {
    query: GET_ADMIN_JOURNEYS,
    variables: {
      status: [JourneyStatus.draft, JourneyStatus.published],
      template: true,
      useLastActiveTeamId: true
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

export const archivedJourneysMock: MockedResponse<
  GetAdminJourneys,
  GetAdminJourneysVariables
> = {
  request: {
    query: GET_ADMIN_JOURNEYS,
    variables: {
      status: [JourneyStatus.archived],
      template: false,
      useLastActiveTeamId: true
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

export const trashedJourneysMock: MockedResponse<
  GetAdminJourneys,
  GetAdminJourneysVariables
> = {
  request: {
    query: GET_ADMIN_JOURNEYS,
    variables: {
      status: [JourneyStatus.trashed],
      template: false,
      useLastActiveTeamId: true
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

export const noTemplatesMock: MockedResponse<
  GetAdminJourneys,
  GetAdminJourneysVariables
> = {
  request: {
    query: GET_ADMIN_JOURNEYS,
    variables: {
      status: [JourneyStatus.draft, JourneyStatus.published],
      template: true,
      useLastActiveTeamId: true
    }
  },
  result: {
    data: {
      journeys: []
    }
  }
}

export const noArchivedMock: MockedResponse<
  GetAdminJourneys,
  GetAdminJourneysVariables
> = {
  request: {
    query: GET_ADMIN_JOURNEYS,
    variables: {
      status: [JourneyStatus.archived],
      template: false,
      useLastActiveTeamId: true
    }
  },
  result: {
    data: {
      journeys: []
    }
  }
}

export const noTrashedMock: MockedResponse<
  GetAdminJourneys,
  GetAdminJourneysVariables
> = {
  request: {
    query: GET_ADMIN_JOURNEYS,
    variables: {
      status: [JourneyStatus.trashed],
      template: false,
      useLastActiveTeamId: true
    }
  },
  result: {
    data: {
      journeys: []
    }
  }
}

export const archivedTemplatesMock: MockedResponse<
  GetAdminJourneys,
  GetAdminJourneysVariables
> = {
  request: {
    query: GET_ADMIN_JOURNEYS,
    variables: {
      status: [JourneyStatus.archived],
      template: true,
      useLastActiveTeamId: true
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

export const noArchivedTemplatesMock: MockedResponse<
  GetAdminJourneys,
  GetAdminJourneysVariables
> = {
  request: {
    query: GET_ADMIN_JOURNEYS,
    variables: {
      status: [JourneyStatus.archived],
      template: true,
      useLastActiveTeamId: true
    }
  },
  result: {
    data: {
      journeys: []
    }
  }
}

export const trashedTemplatesMock: MockedResponse<
  GetAdminJourneys,
  GetAdminJourneysVariables
> = {
  request: {
    query: GET_ADMIN_JOURNEYS,
    variables: {
      status: [JourneyStatus.trashed],
      template: true,
      useLastActiveTeamId: true
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

export const noTrashedTemplatesMock: MockedResponse<
  GetAdminJourneys,
  GetAdminJourneysVariables
> = {
  request: {
    query: GET_ADMIN_JOURNEYS,
    variables: {
      status: [JourneyStatus.trashed],
      template: true,
      useLastActiveTeamId: true
    }
  },
  result: {
    data: {
      journeys: []
    }
  }
}

export const archiveActiveJourneysMutationMock: MockedResponse = {
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

export const trashActiveJourneysMutationMock: MockedResponse = {
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

export const archiveActiveTemplatesMutationMock: MockedResponse = {
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

export const trashActiveTemplatesMutationMock: MockedResponse = {
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

export const restoreArchivedJourneysMutationMock: MockedResponse = {
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

export const trashArchivedJourneysMutationMock: MockedResponse = {
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

export const restoreArchivedTemplatesMutationMock: MockedResponse = {
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

export const trashArchivedTemplatesMutationMock: MockedResponse = {
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

export const restoreTrashedJourneysMutationMock: MockedResponse = {
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

export const deleteTrashedJourneysMutationMock: MockedResponse = {
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

export const restoreTrashedTemplatesMutationMock: MockedResponse = {
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

export const deleteTrashedTemplatesMutationMock: MockedResponse = {
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
