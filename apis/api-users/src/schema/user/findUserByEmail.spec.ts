import { prismaMock } from '../../../test/prismaMock'

import { findUserByEmail } from './findUserByEmail'
import { user } from './user.mock'

const storedRows = [
  { ...user, id: 'wildcardRowId', email: 'johnXsmith@x.com' },
  { ...user, id: 'literalRowId', email: 'John_Smith@x.com' }
]

// prismaMock cannot run SQL, so this stands in for Postgres by evaluating the
// predicate the query actually sends: LOWER(email) = LOWER($1) is plain
// equality, while an ILIKE predicate would read `_` and `%` in the bound value
// as wildcards. If findUserByEmail ever switched to ILIKE, the fake would
// switch semantics with it and the wildcard test below would fail.
function mockPostgres(rows: typeof storedRows = storedRows): void {
  prismaMock.$queryRaw.mockImplementation((async (
    strings: TemplateStringsArray,
    email: string
  ) => {
    const sql = strings.join('$1')
    const matches = (stored: string): boolean => {
      if (sql.includes('LOWER(email) = LOWER($1)'))
        return stored.toLowerCase() === email.toLowerCase()
      const pattern = email
        .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        .replace(/%/g, '.*')
        .replace(/_/g, '.')
      return new RegExp(`^${pattern}$`, 'i').test(stored)
    }
    return rows
      .filter((row) => matches(row.email))
      .slice(0, 1)
      .map(({ id }) => ({ id }))
  }) as never)
  prismaMock.user.findUnique.mockImplementation(
    ((args: { where: { id: string } }) =>
      rows.find((row) => row.id === args.where.id) ?? null) as never
  )
}

describe('findUserByEmail', () => {
  beforeEach(() => {
    mockPostgres()
  })

  it('should not treat _ as a wildcard', async () => {
    const found = await findUserByEmail('john_smith@x.com')

    // 'johnXsmith@x.com' would match an ILIKE 'john_smith@x.com'; it must not
    // here, and the literal (differently cased) row is the only match.
    expect(found?.id).toBe('literalRowId')
    expect(found?.email).toBe('John_Smith@x.com')
  })

  it('should return null rather than a wildcard match', async () => {
    mockPostgres([storedRows[0]])

    expect(await findUserByEmail('john_smith@x.com')).toBeNull()
    expect(prismaMock.user.findUnique).not.toHaveBeenCalled()
  })

  it('should not treat % as a wildcard', async () => {
    expect(await findUserByEmail('%@x.com')).toBeNull()
  })

  it('should match regardless of case', async () => {
    const found = await findUserByEmail('JOHN_SMITH@X.COM')

    expect(found?.id).toBe('literalRowId')
  })

  it('should bind the email as a parameter and load the row by primary key', async () => {
    await findUserByEmail('john_smith@x.com', { select: { id: true } })

    const [strings, ...values] = prismaMock.$queryRaw.mock
      .calls[0] as unknown as [TemplateStringsArray, ...unknown[]]
    expect(strings.join('?')).toContain('LOWER(email) = LOWER(?)')
    // Case-variant duplicates exist (the unique index is case-sensitive), so
    // the pick must be deterministic: oldest row first.
    expect(strings.join('?')).toContain('ORDER BY "createdAt" ASC, id ASC')
    expect(values).toEqual(['john_smith@x.com'])
    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
      select: { id: true },
      where: { id: 'literalRowId' }
    })
    expect(prismaMock.user.findFirst).not.toHaveBeenCalled()
  })
})
