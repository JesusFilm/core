import { ExecutionResult, parse } from 'graphql'
import { vi } from 'vitest'

import { Prisma } from '@core/prisma/journeys/client'
import { getUserFromPayload } from '@core/yoga/firebaseClient'

import { getClient } from '../../../test/client'
import { journeyWithAcl } from '../../../test/journeyWithAcl'
import { prismaMock } from '../../../test/prismaMock'

import { Journey } from './journey.acl'

vi.mock('@core/yoga/firebaseClient', () => ({
  getUserFromPayload: vi.fn()
}))

const labelFields = ['custom1Label', 'custom2Label', 'custom3Label'] as const
const selection = 'id custom1Label custom2Label custom3Label'
const update = parse(`
  mutation UpdateLabels($id: ID!, $input: JourneyUpdateInput!) {
    journeyUpdate(id: $id, input: $input) { ${selection} }
  }
`)
const read = parse(`
  query ReadLabels($id: ID!) {
    adminJourney(id: $id, idType: databaseId) { ${selection} }
  }
`)
const publicRead = parse(`
  query PublicReadLabels($id: ID!) {
    journey(id: $id, idType: databaseId) { ${selection} }
  }
`)

type Labels = Pick<Journey, (typeof labelFields)[number] | 'id'>
type LabelInput = Partial<Labels> & { title?: string }
type LabelResult = ExecutionResult<{
  journeyUpdate: Labels
  adminJourney: Labels
  journey: Labels
  journeyTemplate: Labels
}>

describe('template custom tracking display labels', () => {
  const user = {
    id: 'userId',
    email: 'test@example.com',
    emailVerified: true,
    firstName: 'Test',
    lastName: 'User',
    imageUrl: null
  }
  const client = getClient({ headers: { authorization: 'token' } })
  const publicClient = getClient()
  let journeys: Map<string, Journey>

  async function updateLabels(
    id: string,
    input: LabelInput
  ): Promise<LabelResult> {
    return (await client({
      document: update,
      variables: { id, input }
    })) as LabelResult
  }

  beforeEach(() => {
    vi.mocked(getUserFromPayload).mockReturnValue(user)
    journeys = new Map([
      [
        'parent',
        journeyWithAcl({
          id: 'parent',
          template: true,
          status: 'draft',
          custom1Label: 'First',
          custom2Label: 'Second',
          custom3Label: 'Third'
        })
      ],
      [
        'other',
        journeyWithAcl({
          id: 'other',
          template: true,
          status: 'draft',
          custom1Label: 'Other'
        })
      ],
      ['child', journeyWithAcl({ id: 'child', fromTemplateId: 'parent' })]
    ])
    prismaMock.journey.findUnique.mockImplementation((async ({
      where
    }: Prisma.JourneyFindUniqueArgs) => {
      const journey = journeys.get(String(where.id))
      return journey == null
        ? null
        : { ...journey, _count: { journeyCustomizationFields: 0 } }
    }) as unknown as typeof prismaMock.journey.findUnique)
    prismaMock.journey.findUniqueOrThrow.mockImplementation((async ({
      where
    }: Prisma.JourneyFindUniqueOrThrowArgs) => {
      const journey = journeys.get(String(where.id))
      if (journey == null) throw new Error('missing test journey')
      return journey
    }) as unknown as typeof prismaMock.journey.findUniqueOrThrow)
    prismaMock.$transaction.mockImplementation(async (callback) => {
      if (typeof callback !== 'function')
        throw new Error('expected interactive transaction')
      return await callback(prismaMock)
    })
    prismaMock.journey.update.mockImplementation((async ({
      where,
      data
    }: Prisma.JourneyUpdateArgs) => {
      const journey = journeys.get(String(where.id))
      if (journey == null) throw new Error('missing test journey')
      // The in-memory store models Prisma's scalar updates and omission semantics.
      const updated = { ...journey }
      for (const field of labelFields) {
        const value = data[field]
        if (typeof value === 'string' || value === null) updated[field] = value
      }
      if (typeof data.template === 'boolean') updated.template = data.template
      journeys.set(journey.id, updated)
      return updated
    }) as unknown as typeof prismaMock.journey.update)
    prismaMock.block.findMany.mockResolvedValue([])
    prismaMock.chatButton.findMany.mockResolvedValue([])
  })

  it.each(['manager', 'member', 'owner', 'editor', 'publisher'] as const)(
    'retains existing %s update permission',
    async (role) => {
      const parent = journeys.get('parent')!
      journeys.set('parent', {
        ...parent,
        userJourneys:
          role === 'owner' || role === 'editor'
            ? [
                {
                  id: 'access',
                  journeyId: parent.id,
                  userId: user.id,
                  role,
                  updatedAt: new Date(),
                  openedAt: null
                }
              ]
            : [],
        team: {
          ...parent.team,
          userTeams:
            role === 'manager' || role === 'member'
              ? [{ ...parent.team.userTeams[0], role }]
              : []
        }
      })
      if (role === 'publisher')
        prismaMock.userRole.findUnique.mockResolvedValue({
          id: 'role',
          userId: user.id,
          roles: ['publisher']
        })
      const result = await client({
        document: parse(`mutation {
      journeyUpdate(id: "parent", input: {custom1Label: "Allowed"}) { ${selection} }
    }`)
      })
      expect(result).not.toHaveProperty('errors')
      expect(journeys.get('parent')?.custom1Label).toBe('Allowed')
      if (role === 'publisher') {
        const readResult = (await client({
          document: read,
          variables: { id: 'parent' }
        })) as LabelResult
        expect(readResult.errors?.[0].extensions.code).toBe('FORBIDDEN')
        const publicResult = (await client({
          document: publicRead,
          variables: { id: 'parent' }
        })) as LabelResult
        expect(publicResult.data?.journey.custom1Label).toBeNull()
        expect(publicResult.errors).toHaveLength(3)
      }
    }
  )

  it.each(labelFields)(
    'reads and independently updates %s, returning all definitions',
    async (field) => {
      const before = journeys.get('parent')!
      const result = await updateLabels('parent', { [field]: '  祈り 🙏  ' })
      expect(result.errors).toBeUndefined()
      expect(result.data?.journeyUpdate).toEqual({
        id: 'parent',
        custom1Label: before.custom1Label,
        custom2Label: before.custom2Label,
        custom3Label: before.custom3Label,
        [field]: '祈り 🙏'
      })
      const readResult = (await client({
        document: read,
        variables: { id: 'parent' }
      })) as LabelResult
      expect(readResult.errors).toBeUndefined()
      expect(readResult.data?.adminJourney).toEqual(result.data?.journeyUpdate)
      expect(journeys.get('other')?.custom1Label).toBe('Other')
      expect(journeys.get('child')?.custom1Label).toBeNull()
      expect(prismaMock.block.update).not.toHaveBeenCalled()
      expect(prismaMock.event.update).not.toHaveBeenCalled()
    }
  )

  it.each(
    labelFields.flatMap((field) =>
      [null, '', ' \n\t\u3000 '].map((value) => ({ field, value }))
    )
  )('resets $field with $value', async ({ field, value }) => {
    const result = await updateLabels('parent', { [field]: value })
    expect(result.errors).toBeUndefined()
    expect(result.data?.journeyUpdate[field]).toBeNull()
  })

  it('preserves omitted definitions, including an omitted GraphQL variable', async () => {
    const result = (await client({
      document: parse(`mutation Omitted($label: String) {
        journeyUpdate(id: "parent", input: {title: "New title", custom1Label: $label}) { ${selection} }
      }`),
      variables: {}
    })) as LabelResult
    expect(result.errors).toBeUndefined()
    expect(result.data?.journeyUpdate).toEqual({
      id: 'parent',
      custom1Label: 'First',
      custom2Label: 'Second',
      custom3Label: 'Third'
    })
    const data = prismaMock.journey.update.mock.calls[0][0].data
    for (const field of labelFields) expect(data).not.toHaveProperty(field)
  })

  it.each(labelFields)(
    'accepts 100 Unicode code points in %s after trimming',
    async (field) => {
      const result = await updateLabels('parent', {
        [field]: ` ${'🙏'.repeat(100)} `
      })
      expect(result.errors).toBeUndefined()
      expect(result.data?.journeyUpdate[field]).toBe('🙏'.repeat(100))
    }
  )

  it.each(
    labelFields.flatMap((field) =>
      ['a', '🙏'].map((character) => ({ field, character }))
    )
  )(
    'rejects overlength $field with $character before writing',
    async ({ field, character }) => {
      const result = await updateLabels('parent', {
        [field]: character.repeat(101)
      })
      expect(result.errors?.[0].extensions).toMatchObject({
        code: 'BAD_USER_INPUT',
        field
      })
      expect(prismaMock.$transaction).not.toHaveBeenCalled()
    }
  )

  it('stores markup-like strings and translation-like keys as plain data', async () => {
    const result = await updateLabels('parent', {
      custom1Label: '<b>祈り</b>',
      custom2Label: 'tracking.custom2'
    })
    expect(result.errors).toBeUndefined()
    expect(result.data?.journeyUpdate).toMatchObject({
      custom1Label: '<b>祈り</b>',
      custom2Label: 'tracking.custom2'
    })
  })

  it.each(
    labelFields.flatMap((field) =>
      ['Label', null, ' '].map((value) => ({ field, value }))
    )
  )(
    'rejects ordinary journey writes of $field with $value',
    async ({ field, value }) => {
      const result = await updateLabels('child', { [field]: value })
      expect(result.errors?.[0].extensions).toMatchObject({
        code: 'BAD_USER_INPUT',
        field
      })
      expect(prismaMock.journey.update).not.toHaveBeenCalled()
    }
  )

  it('keeps ordinary journey updates without definitions working', async () => {
    const result = await updateLabels('child', { title: 'Child title' })
    expect(result.errors).toBeUndefined()
    expect(result.data?.journeyUpdate).toEqual({
      id: 'child',
      custom1Label: null,
      custom2Label: null,
      custom3Label: null
    })
  })

  it('never grants parent read or update access through child ownership', async () => {
    const parent = journeys.get('parent')!
    journeys.set('parent', {
      ...parent,
      team: { ...parent.team, userTeams: [] }
    })
    const child = journeys.get('child')!
    journeys.set('child', {
      ...child,
      team: { ...child.team, userTeams: [] },
      userJourneys: [
        {
          id: 'child-owner',
          userId: user.id,
          journeyId: child.id,
          role: 'owner',
          openedAt: null,
          updatedAt: new Date()
        }
      ]
    })
    const result = await updateLabels('parent', { custom1Label: 'Denied' })
    expect(result.errors?.[0].extensions.code).toBe('FORBIDDEN')
    expect(prismaMock.journey.update).not.toHaveBeenCalled()
    const readResult = (await client({
      document: read,
      variables: { id: 'parent' }
    })) as LabelResult
    expect(readResult.errors?.[0].extensions.code).toBe('FORBIDDEN')
    const bypass = (await client({
      document: publicRead,
      variables: { id: 'parent' }
    })) as LabelResult
    expect(bypass.data?.journey.custom1Label).toBeNull()
    expect(bypass.errors).toHaveLength(3)
    const childRead = (await client({
      document: read,
      variables: { id: 'child' }
    })) as LabelResult
    expect(childRead.errors).toBeUndefined()
    expect(childRead.data?.adminJourney.custom1Label).toBeNull()
  })

  it('rejects unauthenticated writes and protects fields on public reads', async () => {
    vi.mocked(getUserFromPayload).mockReturnValue(null)
    const result = (await publicClient({
      document: update,
      variables: { id: 'parent', input: { custom1Label: 'Denied' } }
    })) as LabelResult
    expect(result.errors).toBeDefined()
    expect(prismaMock.journey.update).not.toHaveBeenCalled()
    const readResult = (await publicClient({
      document: publicRead,
      variables: { id: 'parent' }
    })) as LabelResult
    expect(readResult.data?.journey.custom1Label).toBeNull()
    expect(readResult.errors).toHaveLength(3)
  })

  it('promotes a child with fromTemplateId using its own defaults, then stores independent definitions', async () => {
    const result = (await client({
      document: parse(`mutation {
      journeyTemplate(id: "child", input: {template: true}) { ${selection} }
    }`)
    })) as LabelResult
    expect(result.errors).toBeUndefined()
    expect(result.data?.journeyTemplate).toEqual({
      id: 'child',
      custom1Label: null,
      custom2Label: null,
      custom3Label: null
    })
    expect(journeys.get('child')?.fromTemplateId).toBe('parent')
    await updateLabels('child', { custom1Label: 'Child template' })
    await updateLabels('parent', { custom1Label: 'Parent changed' })
    expect(journeys.get('child')?.custom1Label).toBe('Child template')
    expect(
      prismaMock.journey.findUnique.mock.calls.every(([args]) =>
        ['child', 'parent'].includes(String(args.where.id))
      )
    ).toBe(true)
  })
})
