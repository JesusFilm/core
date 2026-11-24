# Users

The identity context. `api-users` owns _who a person is_ — their name, email, photo, and verification/admin status — as a thin, read-through projection of Firebase Auth. It is the source of truth for user profile and account status; what a user is allowed to do (journeys, teams, roles) lives in other contexts and references a user only by id.

## Language

### Identity

**User**:
A person's identity as this context knows it. The GraphQL interface specialising into **Anonymous User** and **Authenticated User**; the stored `User` row is a read-through projection of a Firebase Auth record, created on first sight rather than provisioned up front.
_Avoid_: account, person, profile

**Firebase Auth record**:
The external identity held by Firebase — the source of truth for authentication. The `User` row mirrors it; the two can legitimately diverge (Firebase-only accounts, id/email mismatches), which the lookup and deletion flows reconcile.
_Avoid_: auth user, firebase user (informal)

**Anonymous User**:
A User with no email — a Firebase anonymous session that has a `User` row but no confirmed real-world identity. Exposes only its id.
_Avoid_: guest, anon (except the `isAnonymous` auth check)

**Authenticated User**:
A User with an email — an identity backed by a real sign-in. Carries name, photo, `superAdmin`, and email-verified status.
_Avoid_: registered user, member, signed-in user

**Firebase UID**:
The Firebase-assigned identifier for a User (`userId` column, unique). This is the identity's **inbound key**: the value passed to look a user up, the argument to the `user` query, and the federation `@key`. Other contexts reference a user by this value.
_Avoid_: userId (that is only the column name), uid

**User record id**:
This context's own primary key for the `User` row (`id` column, a UUID). This is the identifier the graph **exposes as the `id` field** on every User type.
_Avoid_: databaseId (reserved as a delete Id Type), internal id, db id

> **The `id` asymmetry (hazard).** `id` does not mean one thing. The `id` you _read off_ a User in the graph is the **User record id** (DB UUID); the `id` you _pass in_ to a lookup, reference, or federation key is the **Firebase UID**. They are different values for the same person and are not interchangeable — a User record id fed back into `user(id:)` resolves to nothing. Always say which one you mean.

**Conversion**:
The transition of an Anonymous User into an Authenticated User via Firebase account linking, back-filling email, name, and photo onto the existing `User` row and triggering email verification. The `User` row is kept; only its identity is enriched.
_Avoid_: promotion, upgrade, registration, linking (the Firebase primitive, not the domain transition)

**superAdmin**:
The elevated-privilege flag on a User. Permits impersonating any user and deleting any user; without it a caller may act only on themselves.
_Avoid_: admin, root, staff

**Impersonation**:
A superAdmin obtaining a token to act as another user, identified by email.
_Avoid_: sudo, act-as, login-as

### Email verification

**Verification Request**:
An ephemeral email-verification challenge — a tokenised link emailed to a user for a given App. It is not a stored entity; it exists only as the emailed token.
_Avoid_: verification email, verification token (that is the secret carried inside it)

**Email Verified**:
Whether a User's email has been confirmed. A binary, always-set fact (defaults true) — not a tri-state.
_Avoid_: validated, confirmed email

**App**:
The consuming product a Verification Request is themed and routed for (`NextSteps`, `JesusFilmOne`). A branding/routing choice, never a permission or a tenant boundary.
_Avoid_: platform, brand, tenant, client

### Account deletion

**Caller**:
The authenticated user requesting a deletion. Authorized to delete only themselves unless they are a superAdmin.
_Avoid_: actor, requester, initiator

**Target**:
The user being deleted, identified by an Id Type.
_Avoid_: subject, victim, deletee

**Id Type**:
How a deletion Target is identified: `databaseId` (a User record id), `email`, or `jwt` (a Firebase token resolved to a Firebase UID).
_Avoid_: lookup type, identifier kind

**Firebase-only account**:
A Target that exists in Firebase Auth but has no `User` row. Deletion still runs, cleaning up the orphaned Firebase record.
_Avoid_: orphan account, ghost user

**User Delete Check**:
A dry run that locates a Target across the DB and Firebase and reports what _would_ be removed, changing nothing.
_Avoid_: delete preview, dry delete

**User Delete Confirm**:
The streamed deletion that actually removes the User (DB row first, then Firebase records), emitting a progress Log Entry per step.
_Avoid_: delete execute, hard delete

**Log Entry**:
One line of the live, operator-facing narration of a deletion run — a leveled, timestamped message returned by the Check and Confirm mutations as they progress. The type is a shared kernel (`libs/shared/user-delete`) so the journeys half of the deletion saga speaks the same shape. Ephemeral, for the operator watching the run — not the durable record.
_Avoid_: confusing with the User Delete Audit Log (below)

**User Delete Audit Log**:
The durable, write-first record of a deletion attempt — caller, target, the cross-context ids removed, and final success. Written before any irreversible step so an attempt is always recorded.
_Avoid_: deletion record, tombstone
