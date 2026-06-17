import { parse } from 'graphql'

import { CountryLanguage, LanguageRole } from '@core/prisma/languages/client'

import { getClient } from '../../../test/client'
import { prismaMock } from '../../../test/prismaMock'
import { language } from '../language/language.mock'
import { country, countryLanguage } from '../country/country.mock'

const COUNTRY_LANGUAGE_CREATE_MUTATION = parse(`
  mutation CountryLanguageCreate($input: CountryLanguageCreateInput!) {
    countryLanguageCreate(input: $input) {
      id
      speakers
      displaySpeakers
      primary
      suggested
      order
      country { id }
      language { id }
    }
  }
`)

const COUNTRY_LANGUAGE_UPDATE_MUTATION = parse(`
  mutation CountryLanguageUpdate($input: CountryLanguageUpdateInput!) {
    countryLanguageUpdate(input: $input) {
      id
      speakers
      displaySpeakers
      primary
      suggested
      order
    }
  }
`)

const COUNTRY_LANGUAGE_DELETE_MUTATION = parse(`
  mutation CountryLanguageDelete($id: ID!) {
    countryLanguageDelete(id: $id) {
      id
      country { id }
      language { id }
    }
  }
`)

const authClient = getClient({
  headers: {
    authorization: 'token'
  }
})

function mockPublisher(): void {
  prismaMock.userLanguageRole.findUnique.mockResolvedValue({
    id: 'roleId',
    userId: 'id',
    roles: [LanguageRole.publisher]
  })
}

describe('countryLanguageCreate', () => {
  it('should create a country language link', async () => {
    mockPublisher()
    prismaMock.countryLanguage.create.mockResolvedValue({
      ...countryLanguage,
      country,
      language
    } as unknown as CountryLanguage)

    const data = await authClient({
      document: COUNTRY_LANGUAGE_CREATE_MUTATION,
      variables: {
        input: {
          languageId: language.id,
          countryId: country.id,
          speakers: 250,
          displaySpeakers: 200,
          primary: true,
          suggested: false,
          order: 2
        }
      }
    })

    expect(prismaMock.countryLanguage.create).toHaveBeenCalledWith({
      include: {
        country: true,
        language: true
      },
      data: {
        languageId: language.id,
        countryId: country.id,
        speakers: 250,
        displaySpeakers: 200,
        primary: true,
        suggested: false,
        order: 2
      }
    })
    expect(data).toHaveProperty('data.countryLanguageCreate', {
      id: countryLanguage.id,
      speakers: countryLanguage.speakers,
      displaySpeakers: countryLanguage.displaySpeakers,
      primary: countryLanguage.primary,
      suggested: countryLanguage.suggested,
      order: countryLanguage.order,
      country: { id: country.id },
      language: { id: language.id }
    })
  })

  it('should use defaults for optional create fields', async () => {
    mockPublisher()
    prismaMock.countryLanguage.create.mockResolvedValue({
      ...countryLanguage,
      displaySpeakers: null,
      primary: false,
      suggested: false,
      order: null,
      country,
      language
    } as unknown as CountryLanguage)

    await authClient({
      document: COUNTRY_LANGUAGE_CREATE_MUTATION,
      variables: {
        input: {
          languageId: language.id,
          countryId: country.id,
          speakers: 250
        }
      }
    })

    expect(prismaMock.countryLanguage.create).toHaveBeenCalledWith({
      include: {
        country: true,
        language: true
      },
      data: {
        languageId: language.id,
        countryId: country.id,
        speakers: 250,
        displaySpeakers: undefined,
        primary: false,
        suggested: false,
        order: undefined
      }
    })
  })

  it('should require publisher permission', async () => {
    prismaMock.userLanguageRole.findUnique.mockResolvedValue({
      id: 'roleId',
      userId: 'id',
      roles: []
    })

    const data = await authClient({
      document: COUNTRY_LANGUAGE_CREATE_MUTATION,
      variables: {
        input: {
          languageId: language.id,
          countryId: country.id,
          speakers: 250
        }
      }
    })

    expect(prismaMock.countryLanguage.create).not.toHaveBeenCalled()
    expect(data).toHaveProperty('errors')
  })

  it('should surface duplicate link errors', async () => {
    mockPublisher()
    prismaMock.countryLanguage.create.mockRejectedValue(
      new Error('Unique constraint failed')
    )

    const data = await authClient({
      document: COUNTRY_LANGUAGE_CREATE_MUTATION,
      variables: {
        input: {
          languageId: language.id,
          countryId: country.id,
          speakers: 250,
          suggested: false
        }
      }
    })

    expect(data).toHaveProperty('errors')
  })
})

describe('countryLanguageUpdate', () => {
  it('should update country language fields', async () => {
    mockPublisher()
    prismaMock.countryLanguage.update.mockResolvedValue({
      ...countryLanguage,
      speakers: 300,
      displaySpeakers: null,
      primary: false,
      suggested: true,
      order: 3
    } as unknown as CountryLanguage)

    const data = await authClient({
      document: COUNTRY_LANGUAGE_UPDATE_MUTATION,
      variables: {
        input: {
          id: countryLanguage.id,
          languageId: language.id,
          countryId: country.id,
          speakers: 300,
          displaySpeakers: null,
          primary: false,
          suggested: true,
          order: 3
        }
      }
    })

    expect(prismaMock.countryLanguage.update).toHaveBeenCalledWith({
      where: { id: countryLanguage.id },
      data: {
        languageId: language.id,
        countryId: country.id,
        speakers: 300,
        displaySpeakers: null,
        primary: false,
        suggested: true,
        order: 3
      }
    })
    expect(data).toHaveProperty('data.countryLanguageUpdate', {
      id: countryLanguage.id,
      speakers: 300,
      displaySpeakers: null,
      primary: false,
      suggested: true,
      order: 3
    })
  })
})

describe('countryLanguageDelete', () => {
  it('should delete a country language link', async () => {
    mockPublisher()
    prismaMock.countryLanguage.delete.mockResolvedValue({
      ...countryLanguage,
      country,
      language
    } as unknown as CountryLanguage)

    const data = await authClient({
      document: COUNTRY_LANGUAGE_DELETE_MUTATION,
      variables: { id: countryLanguage.id }
    })

    expect(prismaMock.countryLanguage.delete).toHaveBeenCalledWith({
      include: {
        country: true,
        language: true
      },
      where: { id: countryLanguage.id }
    })
    expect(data).toHaveProperty('data.countryLanguageDelete', {
      id: countryLanguage.id,
      country: { id: country.id },
      language: { id: language.id }
    })
  })
})
