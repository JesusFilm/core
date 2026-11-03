-- findOrFetchUser looks up a legacy mixed-case email with `mode: 'insensitive'`
-- (compiled to ILIKE) on every brand-new sign-in. Postgres satisfies that
-- with this functional index instead of a full table scan. Not representable
-- in schema.prisma (Prisma has no expression-index syntax), so this will show
-- as drift on `prisma migrate dev` / introspection -- that's expected.
-- CreateIndex
CREATE INDEX "User_email_lower_idx" ON "User" (LOWER("email"));
