import { Prisma, User, prisma } from '@core/prisma/users/client'

// Finds the User row whose email matches case-insensitively.
//
// Raw SQL, not `findFirst` with `mode: 'insensitive'`: on Postgres that mode
// compiles to ILIKE, where `_` and `%` in the email are wildcards (so
// 'john_smith@x.com' can match 'johnXsmith@x.com'), and which the
// LOWER(email) expression index cannot serve. LOWER(email) = LOWER($1) is a
// plain equality predicate: `_` and `%` are literal characters, and the
// index applies. The row is then loaded by primary key so callers still get
// the caller's `select` / `include` applied.
export async function findUserByEmail(
  email: string,
  query: { select?: Prisma.UserSelect; include?: Prisma.UserInclude } = {}
): Promise<User | null> {
  const rows = await prisma.$queryRaw<
    Array<{ id: string }>
  >`SELECT id FROM "User" WHERE LOWER(email) = LOWER(${email}) LIMIT 1`
  const id = rows?.[0]?.id
  if (id == null) return null
  return await prisma.user.findUnique({
    ...(query as Prisma.UserFindUniqueArgs),
    where: { id }
  })
}
