import { createServer } from 'node:http'
import type { AddressInfo } from 'node:net'

import { encryptSymmetric } from '@core/yoga/crypto'

import {
  structureAuthUrl,
  structureFixture,
  structureJourneysUrl
} from './grantedStructureFixture'

const ref = (id: string) => ({ id })
const local = (key: string) => ({ local: key })
const end = { position: 'end' }

describe('form integration', () => {
  describe.skipIf(!structureAuthUrl || !structureJourneysUrl)(
    'complete forms through OAuth, MCP, gateway and owning PostgreSQL',
    () => {
      const calls: string[] = []
      let available = true
      let revokeAfterRouteRead = false
      let routeIds = ['route-a', 'route-b']
      let stalled = false
      const provider = createServer((req, res) => {
        calls.push(`${req.method} ${req.url}`)
        if (stalled) return
        const authorized =
          req.headers['access-id'] === 'controlled-access-id' &&
          req.headers['access-secret'] === 'controlled-provider-secret'
        res.writeHead(available && authorized ? 200 : 401, {
          'Content-Type': 'application/json'
        })
        res.end(
          JSON.stringify(
            routeIds.map((id) => ({
              id,
              name: `Synthetic ${id}`,
              privateResponse: 'never expose'
            }))
          )
        )
        if (revokeAfterRouteRead) available = false
      })

      beforeAll(async () => {
        await new Promise<void>((resolve) =>
          provider.listen(0, '127.0.0.1', resolve)
        )
        vi.stubEnv(
          'GROWTH_SPACES_URL',
          `http://127.0.0.1:${(provider.address() as AddressInfo).port}`
        )
        vi.stubEnv(
          'INTEGRATION_ACCESS_KEY_ENCRYPTION_SECRET',
          Buffer.alloc(32, 58).toString('base64')
        )
      })

      const f = structureFixture()
      const block = (id: string) =>
        f.journeys.block.findUniqueOrThrow({ where: { id } })
      const options = (parentBlockId: string) =>
        f.journeys.block.findMany({
          where: { parentBlockId, deletedAt: null },
          orderBy: { parentOrder: 'asc' }
        })
      const add = (key: string, content: unknown) => ({
        type: 'block_add',
        key,
        card: ref(f.id('ac')),
        placement: end,
        content
      })
      async function current() {
        const snapshot = await f.snapshot()
        const activeIds = new Set(
          snapshot.blocks.filter((row) => !row.deletedAt).map((row) => row.id)
        )
        return {
          blocks: snapshot.blocks
            .filter((row) => !row.deletedAt)
            .map(({ updatedAt, ...row }) => row),
          actions: snapshot.actions
            .filter((row) => activeIds.has(row.parentBlockId))
            .map(({ updatedAt, ...row }) => row)
        }
      }
      async function reversible(commands: unknown[]) {
        const before = await current()
        const saved = await f.save(commands)
        const after = await current()
        expect(after).not.toEqual(before)
        f.receipt(await f.historyAction('undo', saved.historyId!))
        expect(await current()).toEqual(before)
        f.receipt(await f.historyAction('redo', saved.historyId!))
        expect(await current()).toEqual(after)
        return saved
      }
      async function reject(commands: unknown[], code?: string) {
        const before = await f.snapshot()
        const result = await f.edit(await f.input(commands))
        expect(result.json.result?.isError, result.text).toBe(true)
        if (code) expect(result.text).toContain(code)
        expect(await f.snapshot()).toEqual(before)
      }
      let integrationId: string
      let eventCount: number
      let syncCount: number

      beforeEach(async () => {
        available = true
        revokeAfterRouteRead = false
        routeIds = ['route-a', 'route-b']
        stalled = false
        calls.length = 0
        await f.journeys.integration.deleteMany({
          where: { teamId: 'structure-team-alice' }
        })
        eventCount = await f.journeys.event.count()
        syncCount = await f.journeys.googleSheetsSync.count()
        const encrypted = await encryptSymmetric(
          'controlled-provider-secret',
          process.env.INTEGRATION_ACCESS_KEY_ENCRYPTION_SECRET
        )
        integrationId = f.id('integration')
        await f.journeys.integration.create({
          data: {
            id: integrationId,
            teamId: 'structure-team-alice',
            type: 'growthSpaces',
            accessId: 'controlled-access-id',
            accessSecretCipherText: encrypted.ciphertext,
            accessSecretIv: encrypted.iv,
            accessSecretTag: encrypted.tag
          }
        })
      })

      afterEach(async () => {
        expect(calls.every((call) => call === 'GET /routes')).toBe(true)
        expect(await f.journeys.event.count()).toBe(eventCount)
        expect(await f.journeys.googleSheetsSync.count()).toBe(syncCount)
        await f.journeys.integration.deleteMany({
          where: { id: { in: [integrationId, f.id('second')] } }
        })
      })

      afterAll(async () => {
        await new Promise<void>((resolve) => provider.close(() => resolve()))
        vi.unstubAllEnvs()
      })

      it('creates complete poll, multiselect and response content with a single shared submit and two icons', async () => {
        const events = await f.journeys.event.count()
        const syncs = await f.journeys.googleSheetsSync.count()
        const saved = await reversible([
          add('question', {
            kind: 'poll',
            gridView: true,
            options: [
              { key: 'yes_new', label: 'Yes' },
              { key: 'no_new', label: 'No' }
            ]
          }),
          add('choices', {
            kind: 'multiselect',
            min: 1,
            max: 2,
            options: [
              { key: 'one', label: 'One' },
              { key: 'two', label: 'Two' }
            ]
          }),
          add('email', {
            kind: 'response',
            responseType: 'email',
            required: true,
            minRows: 2
          }),
          {
            type: 'action_set',
            block: local('yes_new'),
            action: { kind: 'step', destination: ref(f.id('b')) }
          },
          {
            type: 'action_set',
            block: local('choices.submit'),
            action: { kind: 'step', destination: ref(f.id('c')) }
          },
          { type: 'button_set', blockId: '$choices.submit', label: 'Send' },
          {
            type: 'button_icon_set',
            blockId: '$choices.submit',
            slot: 'end',
            name: 'SendRounded',
            color: 'secondary'
          }
        ])
        expect(
          (await options(saved.idMap.question)).map((row) => row.label)
        ).toEqual(['Yes', 'No'])
        expect(await block(saved.idMap.choices)).toMatchObject({
          min: 1,
          max: 2
        })
        expect(await block(saved.idMap.email)).toMatchObject({
          type: 'email',
          label: 'Email',
          required: true,
          minRows: 2
        })
        const submits = (await options(f.id('ac'))).filter(
          (row) => row.typename === 'ButtonBlock' && row.submitEnabled
        )
        expect(submits).toHaveLength(1)
        expect(submits[0]).toMatchObject({
          label: 'Send',
          startIconId: expect.any(String),
          endIconId: expect.any(String)
        })
        expect(submits[0].startIconId).not.toBe(submits[0].endIconId)
        expect(await block(submits[0].endIconId!)).toMatchObject({
          name: 'SendRounded',
          color: 'secondary'
        })
        expect(
          (await options(submits[0].id)).map((row) => row.typename)
        ).toEqual(['IconBlock', 'IconBlock'])
        expect(await f.journeys.event.count()).toBe(events)
        expect(await f.journeys.googleSheetsSync.count()).toBe(syncs)
        expect(calls).toEqual([])
      })

      it.each(['poll', 'multiselect', 'response'] as const)(
        'creates %s in a new Step and restores its complete descendants',
        async (kind) => {
          const content =
            kind === 'response'
              ? { kind, responseType: 'phone', locale: 'es-ES' }
              : {
                  kind,
                  options: [
                    { key: 'first', label: 'First' },
                    { key: 'last', label: 'Last' }
                  ]
                }
          const saved = await reversible([
            {
              type: 'step_add',
              key: 'step',
              cardKey: 'card',
              placement: end,
              content: [{ key: 'field', content }]
            }
          ])
          if (kind === 'response')
            expect(await block(saved.idMap.field)).toMatchObject({
              label: 'Teléfono',
              type: 'phone'
            })
        }
      )

      it('adds, labels, reorders and removes poll options, preserving untouched IDs and routes', async () => {
        const no = await f.journeys.action.findUniqueOrThrow({
          where: { parentBlockId: f.id('no') }
        })
        await reversible([
          { type: 'poll_set', block: ref(f.id('poll')), gridView: true }
        ])
        const added = await reversible([
          {
            type: 'poll_option_add',
            question: ref(f.id('poll')),
            key: 'maybe',
            label: 'Maybe',
            placement: { position: 'before', anchor: ref(f.id('no')) },
            action: { kind: 'step', destination: ref(f.id('b')) }
          }
        ])
        expect(
          await f.journeys.action.findUniqueOrThrow({
            where: { parentBlockId: added.idMap.maybe }
          })
        ).toMatchObject({ blockId: f.id('b'), parentStepId: f.id('a') })
        await reversible([
          {
            type: 'poll_option_set',
            block: ref(added.idMap.maybe),
            label: 'Updated'
          }
        ])
        await reversible([
          {
            type: 'options_reorder',
            question: ref(f.id('poll')),
            options: [ref(f.id('no')), ref(added.idMap.maybe), ref(f.id('yes'))]
          }
        ])
        await reversible([
          {
            type: 'action_set',
            block: ref(f.id('yes')),
            action: { kind: 'step', destination: ref(f.id('c')) }
          }
        ])
        await reversible([
          { type: 'poll_option_remove', block: ref(added.idMap.maybe) }
        ])
        expect(
          await f.journeys.action.findUniqueOrThrow({
            where: { parentBlockId: f.id('no') }
          })
        ).toEqual(no)
        const removed = await reversible([
          { type: 'poll_option_remove', block: ref(f.id('yes')) },
          { type: 'poll_option_remove', block: ref(f.id('no')) }
        ])
        expect(removed.warnings.join(' ')).toContain('no options')
        expect(await options(f.id('poll'))).toEqual([])
      })

      it('bounds selected destination reads across five stalled integrations and skips outline lookups', async () => {
        const configuration = await f.journeys.integration.findUniqueOrThrow({
          where: { id: integrationId }
        })
        const responseIds: string[] = []
        const integrationIds: string[] = []
        for (let index = 0; index < 5; index++) {
          const selectedIntegration = f.id(`stalled-integration-${index}`)
          await f.journeys.integration.create({
            data: { ...configuration, id: selectedIntegration }
          })
          const saved = await f.save([
            add('field', { kind: 'response', responseType: 'email' }),
            {
              type: 'form_destination_set',
              block: local('field'),
              integrationId: selectedIntegration,
              routeId: 'route-a'
            }
          ])
          responseIds.push(saved.idMap.field)
          integrationIds.push(selectedIntegration)
        }
        const revision = await f.revision()
        calls.length = 0
        stalled = true
        const outline = await f.call('journey_read', {
          journeyId: f.journeyId,
          view: 'outline',
          revision
        })
        expect(outline.json.result?.isError, outline.text).not.toBe(true)
        expect(outline.json.result?.structuredContent).toMatchObject({
          revision
        })
        expect(calls).toEqual([])

        const started = performance.now()
        const result = await f.call('journey_read', {
          journeyId: f.journeyId,
          view: 'steps',
          revision
        })
        expect(result.json.result?.isError, result.text).not.toBe(true)
        expect(result.json.result?.structuredContent).toMatchObject({
          revision,
          blocks: expect.arrayContaining(
            responseIds.map((id) =>
              expect.objectContaining({ id, typename: 'TextResponseBlock' })
            )
          )
        })
        expect(performance.now() - started).toBeLessThan(10000)
        // One shared budget per protected read/output stage, not per field.
        expect(calls).toEqual(['GET /routes', 'GET /routes'])
        for (const selectedIntegration of integrationIds)
          expect(result.text).not.toContain(selectedIntegration)
        expect(result.text).not.toContain('route-a')
        for (const [index, id] of responseIds.entries())
          expect(await block(id)).toMatchObject({
            integrationId: integrationIds[index],
            routeId: 'route-a'
          })
      })

      it.each([
        { min: 2, max: 2, after: { min: 1, max: 1 } },
        { min: null, max: 2, after: { min: null, max: 1 } },
        { min: 2, max: null, after: { min: 1, max: null } },
        { min: null, max: null, after: { min: null, max: null } }
      ])(
        'normalizes only set multiselect bounds atomically after deletion: %j',
        async (bounds) => {
          const saved = await f.save([
            add('multi', {
              kind: 'multiselect',
              min: bounds.min,
              max: bounds.max,
              options: [
                { key: 'a1', label: 'A' },
                { key: 'a2', label: 'B' }
              ]
            })
          ])
          await reversible([
            { type: 'multiselect_option_remove', block: ref(saved.idMap.a1) }
          ])
          expect(await block(saved.idMap.multi)).toMatchObject(bounds.after)
          await reversible([
            { type: 'multiselect_option_remove', block: ref(saved.idMap.a2) }
          ])
          expect(await block(saved.idMap.multi)).toMatchObject({
            min: bounds.min === null ? null : 0,
            max: bounds.max === null ? null : 0
          })
        }
      )

      it('adds and updates multiselect options and bounds with reversible exact field changes', async () => {
        const saved = await f.save([
          add('multi', {
            kind: 'multiselect',
            options: [
              { key: 'a1', label: 'A' },
              { key: 'a2', label: 'B' }
            ]
          })
        ])
        const added = await reversible([
          {
            type: 'multiselect_option_add',
            question: ref(saved.idMap.multi),
            key: 'third',
            label: 'C',
            placement: end
          }
        ])
        await reversible([
          {
            type: 'options_reorder',
            question: ref(saved.idMap.multi),
            options: [
              ref(added.idMap.third),
              ref(saved.idMap.a2),
              ref(saved.idMap.a1)
            ]
          }
        ])
        await reversible([
          {
            type: 'multiselect_option_set',
            block: ref(added.idMap.third),
            label: 'Third'
          }
        ])
        await reversible([
          {
            type: 'multiselect_set',
            block: ref(saved.idMap.multi),
            min: 1,
            max: 3
          }
        ])
        await reject(
          [
            {
              type: 'multiselect_set',
              block: ref(saved.idMap.multi),
              min: 3,
              max: 2
            }
          ],
          'VALIDATION_FAILED'
        )
        await reject(
          [{ type: 'multiselect_set', block: ref(saved.idMap.multi), max: 0 }],
          'VALIDATION_FAILED'
        )
        await reversible([
          {
            type: 'multiselect_set',
            block: ref(saved.idMap.multi),
            min: null,
            max: null
          }
        ])
      })

      it.each(['freeForm', 'name', 'email', 'phone'])(
        'edits %s response null/omission/type resets and restores legacy prior values',
        async (responseType) => {
          await reversible([
            {
              type: 'response_set',
              block: ref(f.id('response')),
              responseType,
              label: 'Replacement',
              placeholder: null,
              hint: 'Hint',
              required: null,
              hideLabel: true,
              minRows: 4
            }
          ])
          expect(await block(f.id('response'))).toMatchObject({
            type: responseType,
            label: 'Replacement',
            hint: 'Hint',
            placeholder: null,
            required: null,
            hideLabel: true,
            minRows: 4
          })
          await reversible([
            {
              type: 'response_set',
              block: ref(f.id('response')),
              responseType: 'email',
              locale: 'es-ES',
              minRows: null
            }
          ])
          expect(await block(f.id('response'))).toMatchObject({
            label: 'Envía un correo electrónico a',
            hint: 'Hint',
            minRows: null
          })
        }
      )

      it('edits existing legacy SignUp label, owned icon and navigation without unsupported creation', async () => {
        await reversible([
          {
            type: 'signup_set',
            block: ref(f.id('legacy')),
            submitLabel: 'Join'
          }
        ])
        await reversible([
          {
            type: 'signup_icon_set',
            block: ref(f.id('legacy')),
            name: 'SendRounded',
            color: 'primary'
          }
        ])
        await reversible([
          { type: 'signup_icon_set', block: ref(f.id('legacy')), name: null }
        ])
        await reversible([
          {
            type: 'action_set',
            block: ref(f.id('legacy')),
            action: { kind: 'step', destination: ref(f.id('b')) }
          }
        ])
        await reversible([
          {
            type: 'action_set',
            block: ref(f.id('legacy')),
            action: { kind: 'email', email: 'visitor@example.test' }
          }
        ])
      })

      it('selects a current owned integration/route, clears an omitted route on switch, resets on type change and undoes every change', async () => {
        await f.save([
          {
            type: 'response_set',
            block: ref(f.id('response')),
            responseType: 'email'
          }
        ])
        await reversible([
          {
            type: 'form_destination_set',
            block: ref(f.id('response')),
            integrationId,
            routeId: 'route-a'
          }
        ])
        const priorReads = calls.length
        available = false
        await reversible([
          {
            type: 'response_set',
            block: ref(f.id('response')),
            hint: 'Preserve destination'
          }
        ])
        expect(calls).toHaveLength(priorReads)
        expect(await block(f.id('response'))).toMatchObject({
          integrationId,
          routeId: 'route-a'
        })
        available = true
        await reversible([
          {
            type: 'form_destination_set',
            block: ref(f.id('response')),
            integrationId: null
          }
        ])
        await f.save([
          {
            type: 'form_destination_set',
            block: ref(f.id('response')),
            integrationId,
            routeId: 'route-a'
          }
        ])
        const second = await f.journeys.integration.findUniqueOrThrow({
          where: { id: integrationId }
        })
        await f.journeys.integration.create({
          data: { ...second, id: f.id('second') }
        })
        await reversible([
          {
            type: 'form_destination_set',
            block: ref(f.id('response')),
            integrationId: f.id('second')
          }
        ])
        expect(await block(f.id('response'))).toMatchObject({
          integrationId: f.id('second'),
          routeId: null
        })
        await reversible([
          {
            type: 'response_set',
            block: ref(f.id('response')),
            responseType: 'phone'
          }
        ])
        expect(await block(f.id('response'))).toMatchObject({
          integrationId: null,
          routeId: null
        })
      })

      it.each([
        'foreign',
        'unavailable',
        'credentials',
        'revoked',
        'route',
        'wrong-type'
      ] as const)('denies %s destination atomically', async (reason) => {
        await f.save([
          {
            type: 'response_set',
            block: ref(f.id('response')),
            responseType: reason === 'wrong-type' ? 'phone' : 'name'
          }
        ])
        if (reason === 'foreign') {
          await f.journeys.team.create({
            data: { id: f.id('foreign-team'), title: 'Foreign team' }
          })
          await f.journeys.integration.update({
            where: { id: integrationId },
            data: { teamId: f.id('foreign-team') }
          })
        }
        if (reason === 'unavailable') available = false
        if (reason === 'credentials')
          await f.journeys.integration.update({
            where: { id: integrationId },
            data: { accessSecretCipherText: null }
          })
        if (reason === 'revoked')
          await f.journeys.integration.update({
            where: { id: integrationId },
            data: { accessId: null }
          })
        await reject([
          {
            type: 'form_destination_set',
            block: ref(f.id('response')),
            integrationId,
            routeId: reason === 'route' ? 'foreign-route' : 'route-a'
          }
        ])
      })

      it.each(['route', 'integration'] as const)(
        'rejects a %s revoked between preflight and final commit and preserves history',
        async (reason) => {
          await f.save([
            {
              type: 'response_set',
              block: ref(f.id('response')),
              responseType: 'email'
            }
          ])
          const before = await f.snapshot()
          f.checkpoint = async (point) => {
            if (point !== 'before_accept') return
            if (reason === 'route') routeIds = []
            else
              await f.journeys.integration.update({
                where: { id: integrationId },
                data: { oauthStale: true }
              })
          }
          const result = await f.edit(
            await f.input([
              {
                type: 'form_destination_set',
                block: ref(f.id('response')),
                integrationId,
                routeId: 'route-a'
              }
            ])
          )
          expect(result.json.result?.isError, result.text).toBe(true)
          expect(await f.snapshot()).toEqual(before)
        }
      )

      it('denies restoration of a revoked destination and does not advance its history cursor', async () => {
        await f.save([
          {
            type: 'response_set',
            block: ref(f.id('response')),
            responseType: 'email'
          }
        ])
        const saved = await f.save([
          {
            type: 'form_destination_set',
            block: ref(f.id('response')),
            integrationId,
            routeId: 'route-a'
          }
        ])
        f.receipt(await f.historyAction('undo', saved.historyId!))
        available = false
        const before = await f.snapshot()
        const denied = await f.historyAction('redo', saved.historyId!)
        expect(denied.json.result?.isError, denied.text).toBe(true)
        expect(await f.snapshot()).toEqual(before)
      })

      it.each(['after_child', 'after_history', 'before_commit'] as const)(
        'rolls back complete forms on interruption at %s and recovers by exact replay',
        async (point) => {
          const input = await f.input([
            add('field', { kind: 'response', label: 'Question' })
          ])
          const before = await f.snapshot()
          f.checkpoint = async (current) => {
            if (current === point) throw new Error('controlled-interruption')
          }
          expect((await f.edit(input)).json.result?.isError).toBe(true)
          expect(await f.snapshot()).toEqual(before)
          f.checkpoint = undefined
          const saved = f.receipt(await f.edit(input))
          expect(f.receipt(await f.edit(input))).toEqual(saved)
          expect(await f.counts()).toMatchObject({
            operations: 1,
            history: 1,
            effects: 1
          })
        }
      )

      it('recovers a lost complete-form response once and rejects changed payload or stale revision', async () => {
        const input = await f.input([add('field', { kind: 'response' })])
        f.loseNextResponse()
        expect((await f.edit(input)).json.result?.isError).toBe(true)
        const saved = f.receipt(await f.edit(input))
        expect(f.receipt(await f.edit(input))).toEqual(saved)
        expect(
          (
            await f.edit({
              ...input,
              commands: [add('field', { kind: 'response', label: 'Changed' })]
            })
          ).text
        ).toContain('IDEMPOTENCY_KEY_REUSED')
        const stale = await f.input([
          {
            type: 'response_set',
            block: ref(saved.idMap.field),
            label: 'Stale'
          }
        ])
        await f.save([
          {
            type: 'response_set',
            block: ref(saved.idMap.field),
            label: 'Newer'
          }
        ])
        const before = await f.snapshot()
        expect((await f.edit(stale)).text).toContain('REVISION_CONFLICT')
        expect(await f.snapshot()).toEqual(before)
      })

      it('keeps existing SignUp icon names when changing color and denies aliases', async () => {
        await f.save([
          {
            type: 'signup_icon_set',
            block: ref(f.id('legacy')),
            name: 'SendRounded'
          }
        ])
        await reversible([
          {
            type: 'signup_icon_set',
            block: ref(f.id('legacy')),
            color: 'secondary'
          }
        ])
        const signup = await block(f.id('legacy'))
        expect(await block(signup.submitIconId!)).toMatchObject({
          name: 'SendRounded',
          color: 'secondary'
        })
        await f.journeys.block.update({
          where: { id: f.id('button') },
          data: { endIconId: signup.submitIconId }
        })
        await reject(
          [{ type: 'signup_icon_set', block: ref(f.id('legacy')), name: null }],
          'ACCESS_DENIED_OR_NOT_FOUND'
        )
        await f.journeys.block.update({
          where: { id: f.id('button') },
          data: { endIconId: f.id('end') }
        })
        await f.journeys.block.update({
          where: { id: signup.submitIconId! },
          data: { parentBlockId: f.id('button') }
        })
        await reject([
          { type: 'signup_icon_set', block: ref(f.id('legacy')), name: null }
        ])
        await f.journeys.block.update({
          where: { id: signup.submitIconId! },
          data: { parentBlockId: f.id('legacy'), deletedAt: new Date() }
        })
        await reject([
          {
            type: 'signup_set',
            block: ref(f.id('legacy')),
            submitLabel: 'Unsafe owner'
          }
        ])
      })

      it('rejects incomplete, duplicate, foreign and non-question option reorder requests atomically', async () => {
        const other = await f.save([
          add('other', {
            kind: 'poll',
            options: [
              { key: 'other_a', label: 'A' },
              { key: 'other_b', label: 'B' }
            ]
          })
        ])
        for (const command of [
          {
            type: 'options_reorder',
            question: ref(f.id('poll')),
            options: [ref(f.id('yes'))]
          },
          {
            type: 'options_reorder',
            question: ref(f.id('poll')),
            options: [ref(f.id('yes')), ref(f.id('yes'))]
          },
          {
            type: 'options_reorder',
            question: ref(f.id('poll')),
            options: [ref(f.id('yes')), ref(other.idMap.other_a)]
          },
          { type: 'options_reorder', question: ref(f.id('ac')), options: [] }
        ])
          await reject([command])
      })

      it('requires integration team membership even when direct journey rights permit editing', async () => {
        await f.journeys.userJourney.create({
          data: { userId: 'alice', journeyId: f.journeyId, role: 'owner' }
        })
        await f.journeys.userTeam.deleteMany({
          where: { teamId: 'structure-team-alice', userId: 'alice' }
        })
        await reject(
          [
            {
              type: 'form_destination_set',
              block: ref(f.id('response')),
              integrationId,
              routeId: 'route-a'
            }
          ],
          'ACCESS_DENIED_OR_NOT_FOUND'
        )
      })

      it('preserves legacy questions beyond the Add-option limit while enforcing that mounted add gesture', async () => {
        const question = await f.save([
          add('large', {
            kind: 'poll',
            options: Array.from({ length: 12 }, (_, index) => ({
              key: 'option_' + index,
              label: String(index)
            }))
          })
        ])
        await reject(
          [
            {
              type: 'poll_option_add',
              question: ref(question.idMap.large),
              key: 'extra',
              label: 'Extra',
              placement: end
            }
          ],
          'LIMIT_EXCEEDED'
        )
        await reversible([
          {
            type: 'block_duplicate',
            source: ref(question.idMap.option_0),
            key: 'duplicate',
            placement: end
          }
        ])
        expect(await options(question.idMap.large)).toHaveLength(13)
        await reversible([
          { type: 'poll_set', block: ref(question.idMap.large), gridView: true }
        ])
      })

      it('rejects unsupported submit navigation without partial form creation', async () => {
        await reject(
          [
            add('field', { kind: 'response' }),
            {
              type: 'action_set',
              block: local('field.submit'),
              action: { kind: 'link', url: 'https://example.test' }
            }
          ],
          'VALIDATION_FAILED'
        )
      })

      it('rejects adding to zero finite bounds unless the same batch makes them valid', async () => {
        const saved = await f.save([
          add('multi', {
            kind: 'multiselect',
            min: 1,
            max: 2,
            options: [
              { key: 'a1', label: 'A' },
              { key: 'a2', label: 'B' }
            ]
          })
        ])
        await f.save([
          { type: 'multiselect_option_remove', block: ref(saved.idMap.a1) },
          { type: 'multiselect_option_remove', block: ref(saved.idMap.a2) }
        ])
        const append = {
          type: 'multiselect_option_add',
          question: ref(saved.idMap.multi),
          key: 'new_option',
          label: 'New',
          placement: end
        }
        await reject([append], 'VALIDATION_FAILED')
        await reversible([
          append,
          { type: 'multiselect_set', block: ref(saved.idMap.multi), max: 1 }
        ])
      })

      it.each([false, true])(
        'completes a form when its old submit is removed, with explicit replacement=%s',
        async (explicit) => {
          await f.journeys.block.update({
            where: { id: f.id('button') },
            data: { parentBlockId: f.id('ac'), parentOrder: 2 }
          })
          const commands: unknown[] = [
            add('response', { kind: 'response' }),
            { type: 'block_remove', block: ref(f.id('button')) }
          ]
          if (explicit)
            commands.push(add('replacement', { kind: 'button', label: 'Send' }))
          await reversible(commands)
          const submits = (await options(f.id('ac'))).filter(
            (row) => row.typename === 'ButtonBlock' && row.submitEnabled
          )
          expect(submits).toHaveLength(1)
          expect(submits[0].startIconId).toBeTruthy()
          expect(submits[0].endIconId).toBeTruthy()
        }
      )

      it('restores the actual legacy invalid bounds after undoing normalized option deletion', async () => {
        const saved = await f.save([
          add('multi', {
            kind: 'multiselect',
            options: [
              { key: 'a1', label: 'A' },
              { key: 'a2', label: 'B' }
            ]
          })
        ])
        await f.journeys.block.update({
          where: { id: saved.idMap.multi },
          data: { min: 4, max: 2 }
        })
        await reversible([
          { type: 'multiselect_option_remove', block: ref(saved.idMap.a1) }
        ])
        expect(await block(saved.idMap.multi)).toMatchObject({ min: 1, max: 1 })
      })

      it('preserves later human bounds by rejecting an option-add undo that would invalidate them', async () => {
        const created = await f.save([
          add('multi', {
            kind: 'multiselect',
            options: [
              { key: 'a1', label: 'A' },
              { key: 'a2', label: 'B' }
            ]
          })
        ])
        const added = await f.save([
          {
            type: 'multiselect_option_add',
            question: ref(created.idMap.multi),
            key: 'third',
            label: 'C',
            placement: end
          }
        ])
        await f.journeys.block.update({
          where: { id: created.idMap.multi },
          data: { min: 3, max: 3 }
        })
        const before = await f.snapshot()
        expect(
          (await f.historyAction('undo', added.historyId!)).text
        ).toContain('HISTORY_CONFLICT')
        expect(await f.snapshot()).toEqual(before)
      })

      it('edits labels in a legacy question without requiring unrelated invalid bounds to change', async () => {
        const created = await f.save([
          add('multi', {
            kind: 'multiselect',
            options: [
              { key: 'a1', label: 'A' },
              { key: 'a2', label: 'B' }
            ]
          })
        ])
        await f.journeys.block.update({
          where: { id: created.idMap.multi },
          data: { min: 4, max: 2 }
        })
        await reversible([
          {
            type: 'multiselect_option_set',
            block: ref(created.idMap.a1),
            label: 'New label'
          }
        ])
        expect(await block(created.idMap.multi)).toMatchObject({
          min: 4,
          max: 2
        })
        const copied = await reversible([
          {
            type: 'block_duplicate',
            source: ref(created.idMap.multi),
            key: 'legacy_copy',
            placement: end
          }
        ])
        expect(await block(copied.idMap.legacy_copy)).toMatchObject({
          min: 4,
          max: 2
        })
      })

      it('refuses bound restoration made invalid by a later Admin option deletion', async () => {
        const created = await f.save([
          add('multi', {
            kind: 'multiselect',
            min: 3,
            options: [
              { key: 'a1', label: 'A' },
              { key: 'a2', label: 'B' },
              { key: 'a3', label: 'C' }
            ]
          })
        ])
        const saved = await f.save([
          { type: 'multiselect_set', block: ref(created.idMap.multi), min: 1 }
        ])
        await f.adminBlockMutation('Delete', created.idMap.a3)
        const before = await f.snapshot()
        expect(
          (await f.historyAction('undo', saved.historyId!)).text
        ).toContain('HISTORY_CONFLICT')
        expect(await f.snapshot()).toEqual(before)
      })

      it.each([
        { min: 2, max: 0, expected: { min: 1, max: 1 } },
        { min: -1, max: -2, expected: { min: 0, max: 1 } }
      ])(
        'normalizes legacy set bounds %j into the nonempty selection range on deletion',
        async (value) => {
          const created = await f.save([
            add('multi', {
              kind: 'multiselect',
              options: [
                { key: 'a1', label: 'A' },
                { key: 'a2', label: 'B' }
              ]
            })
          ])
          await f.journeys.block.update({
            where: { id: created.idMap.multi },
            data: { min: value.min, max: value.max }
          })
          await reversible([
            { type: 'multiselect_option_remove', block: ref(created.idMap.a1) }
          ])
          expect(await block(created.idMap.multi)).toMatchObject(value.expected)
        }
      )

      it('lists safe current destinations through protected reads and keeps credentials and visitor data out of tools and results', async () => {
        const result = await f.call('journey_read', {
          journeyId: f.journeyId,
          view: 'form_destinations'
        })
        expect(result.json.result?.isError, result.text).not.toBe(true)
        expect(result.json.result?.structuredContent).toMatchObject({
          destinations: expect.arrayContaining([
            {
              integrationId,
              name: 'Growth Spaces',
              routes: [
                { id: 'route-a', name: 'Synthetic route-a' },
                { id: 'route-b', name: 'Synthetic route-b' }
              ]
            }
          ])
        })
        for (const value of [
          'controlled-access-id',
          'controlled-provider-secret',
          'privateResponse',
          'accessSecret',
          'accessId',
          'visitorResponse'
        ])
          expect(result.text).not.toContain(value)
        expect(result.text).toContain('response_set')
      })

      it('reads each saved destination at its revision and distinguishes fields using different routes', async () => {
        const saved = await f.save([
          add('second', { kind: 'response', responseType: 'email' }),
          add('default', { kind: 'response', responseType: 'name' }),
          add('unset', { kind: 'response', responseType: 'email' }),
          {
            type: 'form_destination_set',
            block: ref(f.id('response')),
            integrationId,
            routeId: 'route-a'
          },
          {
            type: 'form_destination_set',
            block: local('second'),
            integrationId,
            routeId: 'route-b'
          },
          {
            type: 'form_destination_set',
            block: local('default'),
            integrationId
          }
        ])
        const revision = await f.revision()
        calls.length = 0
        const result = await f.call('journey_read', {
          journeyId: f.journeyId,
          view: 'steps',
          revision
        })
        expect(result.json.result?.isError, result.text).not.toBe(true)
        expect(result.json.result?.structuredContent).toMatchObject({
          revision,
          blocks: expect.arrayContaining([
            expect.objectContaining({
              id: f.id('response'),
              integrationId,
              routeId: 'route-a'
            }),
            expect.objectContaining({
              id: saved.idMap.second,
              integrationId,
              routeId: 'route-b'
            }),
            expect.objectContaining({
              id: saved.idMap.default,
              integrationId,
              routeId: null
            }),
            expect.objectContaining({
              id: saved.idMap.unset,
              integrationId: null,
              routeId: null
            })
          ])
        })
        // Each protected read/output stage checks the shared integration once.
        expect(calls).toEqual(['GET /routes', 'GET /routes'])
        for (const secret of [
          'controlled-access-id',
          'controlled-provider-secret',
          'privateResponse',
          'accessSecret',
          'visitorResponse'
        ])
          expect(result.text).not.toContain(secret)
        await f.save([
          {
            type: 'form_destination_set',
            block: ref(f.id('response')),
            integrationId,
            routeId: 'route-b'
          }
        ])
        const stale = await f.call('journey_read', {
          journeyId: f.journeyId,
          view: 'steps',
          revision
        })
        expect(stale.text).toContain('REVISION_CONFLICT')
        expect(stale.text).not.toContain('route-a')
        const updated = await f.call('journey_read', {
          journeyId: f.journeyId,
          view: 'steps'
        })
        expect(updated.json.result?.structuredContent).toMatchObject({
          revision: await f.revision(),
          blocks: expect.arrayContaining([
            expect.objectContaining({
              id: f.id('response'),
              integrationId,
              routeId: 'route-b'
            })
          ])
        })
      })

      it.each([
        'foreign',
        'unavailable',
        'credentials',
        'revoked',
        'stale',
        'route',
        'wrong-type',
        'team-membership'
      ] as const)(
        'omits a %s saved destination while preserving readable content',
        async (reason) => {
          await f.save([
            {
              type: 'form_destination_set',
              block: ref(f.id('response')),
              integrationId,
              routeId: 'route-a'
            }
          ])
          if (reason === 'foreign') {
            await f.journeys.team.create({
              data: { id: f.id('foreign-team'), title: 'Foreign team' }
            })
            await f.journeys.integration.update({
              where: { id: integrationId },
              data: { teamId: f.id('foreign-team') }
            })
          }
          if (reason === 'unavailable') available = false
          if (reason === 'credentials')
            await f.journeys.integration.update({
              where: { id: integrationId },
              data: { accessSecretCipherText: null }
            })
          if (reason === 'revoked')
            await f.journeys.integration.update({
              where: { id: integrationId },
              data: { accessId: null }
            })
          if (reason === 'stale')
            await f.journeys.integration.update({
              where: { id: integrationId },
              data: { oauthStale: true }
            })
          if (reason === 'route') routeIds = ['route-b']
          if (reason === 'wrong-type')
            await f.journeys.block.update({
              where: { id: f.id('response') },
              data: { type: 'phone' }
            })
          if (reason === 'team-membership') {
            await f.journeys.userJourney.create({
              data: { journeyId: f.journeyId, userId: 'alice', role: 'editor' }
            })
            await f.journeys.userTeam.delete({
              where: {
                teamId_userId: {
                  teamId: 'structure-team-alice',
                  userId: 'alice'
                }
              }
            })
          }
          const result = await f.call('journey_read', {
            journeyId: f.journeyId,
            view: 'steps'
          })
          expect(result.json.result?.isError, result.text).not.toBe(true)
          expect(result.json.result?.structuredContent).toMatchObject({
            revision: await f.revision(),
            blocks: expect.arrayContaining([
              expect.objectContaining({ id: f.id('response') })
            ])
          })
          expect(result.text).not.toContain(integrationId)
          expect(result.text).not.toContain('route-a')
          expect(await block(f.id('response'))).toMatchObject({
            integrationId,
            routeId: 'route-a'
          })
        }
      )

      it('withholds saved destinations revoked between the read and protected output', async () => {
        await f.save([
          {
            type: 'form_destination_set',
            block: ref(f.id('response')),
            integrationId,
            routeId: 'route-a'
          }
        ])
        calls.length = 0
        revokeAfterRouteRead = true
        const result = await f.call('journey_read', {
          journeyId: f.journeyId,
          view: 'steps'
        })
        expect(result.status).toBe(500)
        expect(result.json).toEqual({ error: 'Request failed' })
        expect(calls).toEqual(['GET /routes', 'GET /routes'])
        expect(result.text).not.toContain(integrationId)
        expect(result.text).not.toContain('route-a')
      })

      it('rechecks a repeated destination assignment after provider revocation', async () => {
        await f.save([
          {
            type: 'form_destination_set',
            block: ref(f.id('response')),
            integrationId,
            routeId: 'route-a'
          }
        ])
        available = false
        await reject([
          {
            type: 'form_destination_set',
            block: ref(f.id('response')),
            integrationId,
            routeId: 'route-a'
          }
        ])
      })

      it.each(['published', 'read-only', 'revoked', 'role'] as const)(
        'rejects complete form creation for a %s target or grant',
        async (reason) => {
          if (reason === 'published')
            await f.journeys.journey.update({
              where: { id: f.journeyId },
              data: {
                status: 'published',
                publishedAt: new Date(),
                firstPublishedAt: new Date()
              }
            })
          if (reason === 'read-only') {
            const token = await f.consent('view')
            const before = await f.snapshot()
            const result = await f.edit(
              await f.input([add('field', { kind: 'response' })]),
              token
            )
            expect(result.json.result?.isError, result.text).toBe(true)
            expect(await f.snapshot()).toEqual(before)
            return
          }
          if (reason === 'revoked')
            await f.auth.agentConnection.updateMany({
              data: { revokedAt: new Date() }
            })
          if (reason === 'role')
            await f.journeys.userTeam.deleteMany({
              where: { teamId: 'structure-team-alice', userId: 'alice' }
            })
          await reject([add('field', { kind: 'response' })])
        }
      )
    }
  )
})
