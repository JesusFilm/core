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
//
// The unique index on email is case-sensitive, so legacy rows can differ only
// by case. ORDER BY makes the pick deterministic (oldest row first) instead
// of whichever row the planner returns, which matters for userImpersonate.
export async function findUserByEmail(
  email: string,
  query: { select?: Prisma.UserSelect; include?: undefined } = {}
): Promise<User | null> {
  const rows = await prisma.$queryRaw<
    Array<{ id: string }>
  >`SELECT id FROM "User" WHERE LOWER(email) = LOWER(${email}) ORDER BY "createdAt" ASC, id ASC LIMIT 1`
  const id = rows?.[0]?.id
  if (id == null) return null
  return await prisma.user.findUnique({
    ...(query as Prisma.UserFindUniqueArgs),
    where: { id }
  })
}

// True when a row keyed to a different Firebase UID already holds this email
// in any casing. The unique index is case-sensitive, so writing a lowercased
// email onto a row does not collide with a legacy 'Amin@Email.com' row and
// would silently leave two rows for one address.
export async function isEmailHeldByAnotherUser(
  email: string,
  userId: string
): Promise<boolean> {
  const rows = await prisma.$queryRaw<
    Array<{ id: string }>
  >`SELECT id FROM "User" WHERE LOWER(email) = LOWER(${email}) AND "userId" <> ${userId} LIMIT 1`
  return (rows?.length ?? 0) > 0
}
