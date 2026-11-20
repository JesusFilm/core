import { historyResult } from '@core/yoga/mcp/editContract'

import {
  structureAuthUrl,
  structureFixture,
  structureJourneysUrl
} from './grantedStructureFixture'

const end = { position: 'end' }
const ref = (id: string) => ({ id })
const local = (key: string) => ({ local: key })

/** Real OAuth -> MCP HTTP -> Hive -> owning service -> PostgreSQL. The fixture
 * controls Firebase identity and explicit fault hooks, never grants or writes.
 */
describe('structural integration', () => {
  describe.skipIf(!structureAuthUrl || !structureJourneysUrl)(
    'structure and navigation through real authorized participants',
    () => {
      const f = structureFixture()
      const block = (suffix: string) =>
        f.journeys.block.findUniqueOrThrow({ where: { id: f.id(suffix) } })
      const action = (suffix: string) =>
        f.journeys.action.findUnique({ where: { parentBlockId: f.id(suffix) } })
      const defaults = (destination: string | null) => ({
        type: 'step_default_set',
        step: ref(f.id('a')),
        destination: destination ? ref(f.id(destination)) : null
      })
      const route = (source: string, destination: string) => ({
        type: 'action_set',
        block: ref(f.id(source)),
        action: { kind: 'step', destination: ref(f.id(destination)) }
      })
      async function assertRejected(commands: unknown[]) {
        const before = await f.snapshot()
        const result = await f.edit(await f.input(commands))
        expect(result.json.result?.isError, result.text).toBe(true)
        expect(await f.snapshot()).toEqual(before)
        return result
      }
      async function rows() {
        return f.journeys.block.findMany({
          where: { journeyId: f.journeyId, deletedAt: null },
          orderBy: { id: 'asc' }
        })
      }
      async function steps() {
        return f.journeys.block.findMany({
          where: {
            journeyId: f.journeyId,
            typename: 'StepBlock',
            deletedAt: null
          },
          orderBy: { parentOrder: 'asc' }
        })
      }

      it('reads stable IDs and implemented structural capabilities through the protected MCP route', async () => {
        const read = await f.call('journey_read', {
          journeyId: f.journeyId,
          view: 'steps'
        })
        expect(read.json.result?.isError, read.text).not.toBe(true)
        expect(read.text).toContain(f.id('yes'))
        expect(read.text).toContain('step_add')
        expect(read.text).toContain('step_remove')
        expect(read.text).toContain('action_set')
        expect(read.text).toContain('graph_auto_arrange')
        expect(read.text).toContain(await f.revision())
      })

      it('resolves a later local Step, builds complete Card/content descendants and changes only the requested poll answer', async () => {
        const untouched = await action('no')
        const oldIds = (await rows()).map(({ id }) => id)
        const saved = await f.save([
          {
            type: 'action_set',
            block: ref(f.id('yes')),
            action: { kind: 'step', destination: local('new_step') }
          },
          {
            type: 'step_add',
            key: 'new_step',
            cardKey: 'new_card',
            placement: end,
            x: 900,
            y: 400,
            content: [
              {
                key: 'title',
                content: {
                  kind: 'typography',
                  content: 'Connected Step',
                  variant: 'h1'
                }
              },
              {
                key: 'continue',
                content: { kind: 'button', label: 'Continue' }
              },
              { key: 'space', content: { kind: 'spacer', spacing: 40 } }
            ]
          }
        ])
        expect(Object.keys(saved.idMap).sort()).toEqual([
          'continue',
          'new_card',
          'new_step',
          'space',
          'title'
        ])
        expect(new Set(Object.values(saved.idMap)).size).toBe(5)
        expect(await action('yes')).toMatchObject({
          blockId: saved.idMap.new_step,
          parentStepId: f.id('a'),
          gtmEventName: 'human-tracking'
        })
        expect(await action('no')).toEqual(untouched)
        const created = await f.journeys.block.findMany({
          where: { journeyId: f.journeyId, id: { notIn: oldIds } }
        })
        expect(created).toHaveLength(7)
        expect(
          created.find(({ id }) => id === saved.idMap.new_step)
        ).toMatchObject({
          typename: 'StepBlock',
          parentBlockId: null,
          x: 900,
          y: 400
        })
        expect(
          created.find(({ id }) => id === saved.idMap.new_card)
        ).toMatchObject({
          typename: 'CardBlock',
          parentBlockId: saved.idMap.new_step
        })
        const button = created.find(({ id }) => id === saved.idMap.continue)!
        expect(button).toMatchObject({
          parentBlockId: saved.idMap.new_card,
          parentOrder: 1,
          label: 'Continue'
        })
        expect(button.startIconId).toBeTruthy()
        expect(button.endIconId).toBeTruthy()
        expect(
          created
            .filter((item) => item.parentBlockId === button.id)
            .map((item) => item.typename)
        ).toEqual(['IconBlock', 'IconBlock'])
        expect(await f.counts()).toEqual({
          operations: 1,
          history: 1,
          effects: 1
        })
        expect(saved.historyId).toBeTruthy()
      })

      it.each([
        {
          kind: 'typography',
          content: 'New content',
          variant: 'caption',
          align: 'right',
          color: '#123456'
        },
        {
          kind: 'button',
          label: 'New button',
          variant: 'outlined',
          size: 'small',
          color: 'secondary',
          align: 'center'
        },
        { kind: 'spacer', spacing: 80 },
        { kind: 'image' },
        { kind: 'video' }
      ])(
        'adds complete mounted $kind content inside the actual Card',
        async (content) => {
          const saved = await f.save([
            {
              type: 'block_add',
              key: 'content',
              card: ref(f.id('ac')),
              placement: end,
              content
            }
          ])
          const created = await f.journeys.block.findUniqueOrThrow({
            where: { id: saved.idMap.content }
          })
          expect(created.parentBlockId).toBe(f.id('ac'))
          expect(created.parentOrder).toBe(2)
          if (content.kind === 'button') {
            expect(created.startIconId).toBeTruthy()
            expect(created.endIconId).toBeTruthy()
          }
          expect(await block('legacy')).toMatchObject({
            submitLabel: 'Legacy sign up',
            deletedAt: null
          })
        }
      )

      it('keeps declaration order for multiple insertions at the same anchor', async () => {
        const saved = await f.save([
          {
            type: 'block_add',
            key: 'first',
            card: ref(f.id('ac')),
            placement: { position: 'after', anchor: ref(f.id('heading')) },
            content: { kind: 'typography', content: 'First' }
          },
          {
            type: 'block_add',
            key: 'second',
            card: ref(f.id('ac')),
            placement: { position: 'after', anchor: ref(f.id('heading')) },
            content: { kind: 'typography', content: 'Second' }
          }
        ])
        const ordered = await f.journeys.block.findMany({
          where: {
            parentBlockId: f.id('ac'),
            deletedAt: null,
            parentOrder: { not: null }
          },
          orderBy: { parentOrder: 'asc' }
        })
        expect(ordered.map(({ id }) => id)).toEqual([
          f.id('heading'),
          saved.idMap.first,
          saved.idMap.second,
          f.id('poll')
        ])
      })

      it('resolves a later local placement anchor and preserves both complete Steps', async () => {
        const saved = await f.save([
          {
            type: 'step_add',
            key: 'before',
            cardKey: 'before_card',
            placement: { position: 'before', anchor: local('after') }
          },
          {
            type: 'step_add',
            key: 'after',
            cardKey: 'after_card',
            placement: end
          }
        ])
        expect((await steps()).map((step) => step.id)).toEqual([
          ...['a', 'b', 'c'].map(f.id),
          saved.idMap.before,
          saved.idMap.after
        ])
        expect(
          await f.journeys.block.count({
            where: {
              parentBlockId: { in: [saved.idMap.before, saved.idMap.after] },
              typename: 'CardBlock',
              deletedAt: null
            }
          })
        ).toBe(2)
      })

      it('returns lossless mappings when the same Step is duplicated twice and replays them exactly', async () => {
        const input = await f.input([
          {
            type: 'step_duplicate',
            source: ref(f.id('b')),
            key: 'first',
            placement: end
          },
          {
            type: 'step_duplicate',
            source: ref(f.id('b')),
            key: 'second',
            placement: end
          }
        ])
        const saved = f.receipt(await f.edit(input))
        expect(
          saved.duplicateMaps?.first.find((item) => item.sourceId === f.id('b'))
            ?.blockId
        ).toBe(saved.idMap.first)
        expect(
          saved.duplicateMaps?.second.find(
            (item) => item.sourceId === f.id('b')
          )?.blockId
        ).toBe(saved.idMap.second)
        const firstIds = saved.duplicateMaps!.first.map((item) => item.blockId)
        const secondIds = saved.duplicateMaps!.second.map(
          (item) => item.blockId
        )
        expect(firstIds.length).toBeGreaterThan(3)
        expect(new Set([...firstIds, ...secondIds]).size).toBe(
          firstIds.length + secondIds.length
        )
        expect(f.receipt(await f.edit(input))).toEqual(saved)
        f.receipt(await f.historyAction('undo', saved.historyId!))
        expect(
          await f.journeys.block.count({
            where: { id: { in: [...firstIds, ...secondIds] }, deletedAt: null }
          })
        ).toBe(0)
      })

      it.each(['existing', 'local'])(
        'rejects an entire mixed batch with a default self continuation using %s references',
        async (reference) => {
          const result = await assertRejected(
            reference === 'existing'
              ? [route('yes', 'c'), defaults('a')]
              : [
                  {
                    type: 'step_default_set',
                    step: local('new'),
                    destination: local('new')
                  },
                  {
                    type: 'step_add',
                    key: 'new',
                    cardKey: 'card',
                    placement: end
                  }
                ]
          )
          expect(result.text).toContain('VALIDATION_FAILED')
        }
      )

      it('clears a legacy self continuation without changing the start Step', async () => {
        await f.journeys.block.update({
          where: { id: f.id('a') },
          data: { nextBlockId: f.id('a') }
        })
        await f.save([defaults(null)])
        expect(await block('a')).toMatchObject({
          nextBlockId: null,
          parentOrder: 0
        })
      })

      it.each(['step', 'none'] as const)(
        'permits an explicit %s replacement of a copied action in the same batch',
        async (kind) => {
          const saved = await f.save([
            {
              type: 'block_duplicate',
              source: ref(f.id('button')),
              key: 'copy',
              placement: end
            },
            {
              type: 'action_set',
              block: local('copy'),
              action:
                kind === 'none'
                  ? { kind }
                  : { kind, destination: ref(f.id('a')) }
            }
          ])
          const copied = await f.journeys.action.findUnique({
            where: { parentBlockId: saved.idMap.copy }
          })
          if (kind === 'none') expect(copied).toBeNull()
          else expect(copied?.blockId).toBe(f.id('a'))
        }
      )

      it('rejects a reserved local key without committing hidden descendants or a receipt', async () => {
        await assertRejected([
          {
            type: 'step_add',
            key: '__proto__',
            cardKey: 'card',
            placement: end
          }
        ])
      })

      it('reports unchanged incoming routes when history removes a Step again', async () => {
        const removed = await f.save([
          { type: 'step_remove', step: ref(f.id('b')) }
        ])
        f.receipt(await f.historyAction('undo', removed.historyId!))
        await f.journeys.block.update({
          where: { id: f.id('c') },
          data: { nextBlockId: f.id('b') }
        })
        const before = await block('c')
        const redone = f.receipt(
          await f.historyAction('redo', removed.historyId!)
        )
        expect(redone.affectedLinks).toContainEqual({
          sourceBlockId: f.id('c'),
          kind: 'default',
          destinationStepId: f.id('b')
        })
        expect(await block('c')).toEqual(before)
      })

      it('uses complete Step order for the start connection and restores its prior order', async () => {
        const saved = await f.save([
          {
            type: 'steps_reorder',
            steps: ['c', 'a', 'b'].map((name) => ref(f.id(name)))
          }
        ])
        expect((await steps()).map(({ id }) => id)).toEqual(
          ['c', 'a', 'b'].map(f.id)
        )
        f.receipt(await f.historyAction('undo', saved.historyId!))
        expect((await steps()).map(({ id }) => id)).toEqual(
          ['a', 'b', 'c'].map(f.id)
        )
        f.receipt(await f.historyAction('redo', saved.historyId!))
        expect((await steps())[0].id).toBe(f.id('c'))
      })

      it('reorders all ordinary content while preserving null-order cover and nested child order', async () => {
        const cover = await block('cover')
        const child = await block('end')
        await f.save([
          {
            type: 'content_reorder',
            card: ref(f.id('bc')),
            blocks: ['video', 'button', 'btext'].map((name) => ref(f.id(name)))
          }
        ])
        expect((await block('video')).parentOrder).toBe(0)
        expect((await block('btext')).parentOrder).toBe(2)
        expect(await block('cover')).toEqual(cover)
        expect(await block('end')).toEqual(child)
        await assertRejected([
          {
            type: 'content_reorder',
            card: ref(f.id('bc')),
            blocks: [ref(f.id('video'))]
          }
        ])
      })

      it('persists graph positions and auto-arranges using owning graph inputs without route or content changes', async () => {
        await f.save([
          { type: 'step_position_set', step: ref(f.id('b')), x: -450, y: 890 },
          { type: 'social_position_set', x: 77, y: -88 }
        ])
        expect(await block('b')).toMatchObject({ x: -450, y: 890 })
        expect((await f.snapshot()).journey).toMatchObject({
          socialNodeX: 77,
          socialNodeY: -88
        })
        const before = await f.snapshot()
        const saved = await f.save([{ type: 'graph_auto_arrange' }])
        const after = await f.snapshot()
        expect(after.actions).toEqual(before.actions)
        expect(after.journey).toMatchObject({
          socialNodeX: -240,
          socialNodeY: -46
        })
        const omitPosition = (
          value: Awaited<ReturnType<typeof rows>>[number]
        ) => {
          const { x: _x, y: _y, updatedAt: _updatedAt, ...content } = value
          return content
        }
        expect(after.blocks.map(omitPosition)).toEqual(
          before.blocks.map(omitPosition)
        )
        expect(
          after.blocks.find(({ id }) => id === f.id('b'))
        ).not.toMatchObject({ x: -450, y: 890 })
        f.receipt(await f.historyAction('undo', saved.historyId!))
        expect(await block('b')).toMatchObject({ x: -450, y: 890 })
        expect((await f.snapshot()).journey).toMatchObject({
          socialNodeX: 77,
          socialNodeY: -88
        })
      })

      it('sets and clears the website Card slug on its Step and rejects duplicate slugs atomically', async () => {
        await f.journeys.journey.update({
          where: { id: f.journeyId },
          data: { website: true }
        })
        await f.save([
          { type: 'card_slug_set', step: ref(f.id('b')), slug: 'learn-more' }
        ])
        expect(await block('b')).toMatchObject({ slug: 'learn-more' })
        await assertRejected([
          { type: 'step_default_set', step: ref(f.id('a')), destination: null },
          { type: 'card_slug_set', step: ref(f.id('c')), slug: 'learn-more' }
        ])
        await f.save([
          { type: 'card_slug_set', step: ref(f.id('b')), slug: '' }
        ])
        expect(await block('b')).toMatchObject({ slug: null })
      })

      it.each(['learn-more', '', null])(
        'rejects a mixed batch with slug %j when website mode is off',
        async (slug) => {
          expect((await f.snapshot()).journey.website).toBe(false)
          const rejected = await assertRejected([
            defaults('c'),
            { type: 'card_slug_set', step: ref(f.id('b')), slug }
          ])
          expect(rejected.text).toContain('VALIDATION_FAILED')
        }
      )

      it('rejects an intervening website mode change and rejects slug writes after refreshing', async () => {
        await f.journeys.journey.update({
          where: { id: f.journeyId },
          data: { website: true }
        })
        const before = await f.snapshot()
        f.checkpoint = async (current) => {
          if (current !== 'before_accept') return
          await f.journeys.journey.update({
            where: { id: f.journeyId },
            data: { website: false }
          })
        }
        const rejected = await f.edit(
          await f.input([
            defaults('c'),
            { type: 'card_slug_set', step: ref(f.id('b')), slug: 'learn-more' }
          ])
        )
        f.checkpoint = undefined
        expect(rejected.json.result?.isError, rejected.text).toBe(true)
        expect(rejected.text).toContain('REVISION_CONFLICT')
        const after = await f.snapshot()
        expect(after.blocks).toEqual(before.blocks)
        expect(after.actions).toEqual(before.actions)
        expect(after.counts).toEqual(before.counts)
        expect(after.journey.website).toBe(false)
        const refreshed = await assertRejected([
          defaults('c'),
          { type: 'card_slug_set', step: ref(f.id('b')), slug: 'learn-more' }
        ])
        expect(refreshed.text).toContain('VALIDATION_FAILED')
      })

      it.each(['learn-more', null])(
        'requires website mode for undo and redo of a mixed slug edit to %j',
        async (slug) => {
          await f.journeys.journey.update({
            where: { id: f.journeyId },
            data: { website: true }
          })
          await f.journeys.block.update({
            where: { id: f.id('b') },
            data: { slug: 'original-slug' }
          })
          const originalDefault = (await block('a')).nextBlockId
          const saved = await f.save([
            defaults('c'),
            { type: 'card_slug_set', step: ref(f.id('b')), slug }
          ])
          for (const direction of ['undo', 'redo'] as const) {
            await f.journeys.journey.update({
              where: { id: f.journeyId },
              data: { website: false }
            })
            const before = await f.snapshot()
            const rejected = await f.historyAction(direction, saved.historyId!)
            expect(rejected.json.result?.isError, rejected.text).toBe(true)
            expect(rejected.text).toContain('HISTORY_CONFLICT')
            expect(await f.snapshot()).toEqual(before)
            await f.journeys.journey.update({
              where: { id: f.journeyId },
              data: { website: true }
            })
            f.receipt(await f.historyAction(direction, saved.historyId!))
            expect(await block('b')).toMatchObject({
              slug: direction === 'undo' ? 'original-slug' : slug
            })
            expect((await block('a')).nextBlockId).toBe(
              direction === 'undo' ? originalDefault : f.id('c')
            )
          }
        }
      )

      it('duplicates a complete Step with owned ID remapping, order, Video and authorized external action references', async () => {
        const source = await f.snapshot()
        const saved = await f.save([
          {
            type: 'step_duplicate',
            source: ref(f.id('b')),
            key: 'copy',
            placement: { position: 'after', anchor: ref(f.id('b')) }
          }
        ])
        const map = saved.duplicateIdMap!
        const names = [
          'b',
          'bc',
          'btext',
          'button',
          'start',
          'end',
          'video',
          'poster',
          'cover'
        ]
        expect(Object.keys(map).sort()).toEqual(names.map(f.id).sort())
        expect(new Set(Object.values(map)).size).toBe(names.length)
        for (const name of names) expect(map[f.id(name)]).not.toBe(f.id(name))
        expect(saved.idMap.copy).toBe(map[f.id('b')])
        const copied = await f.journeys.block.findMany({
          where: { id: { in: Object.values(map) } }
        })
        expect(copied.find(({ id }) => id === map[f.id('b')])).toMatchObject({
          nextBlockId: null,
          parentBlockId: null
        })
        expect(copied.find(({ id }) => id === map[f.id('bc')])).toMatchObject({
          parentBlockId: map[f.id('b')],
          coverBlockId: map[f.id('cover')]
        })
        expect(
          copied.find(({ id }) => id === map[f.id('video')])
        ).toMatchObject({
          parentBlockId: map[f.id('bc')],
          posterBlockId: map[f.id('poster')],
          videoId: 'dQw4w9WgXcQ',
          source: 'youTube',
          parentOrder: 2
        })
        expect(
          copied.find(({ id }) => id === map[f.id('button')])
        ).toMatchObject({
          parentBlockId: map[f.id('bc')],
          startIconId: map[f.id('start')],
          endIconId: map[f.id('end')],
          submitEnabled: true,
          parentOrder: 1
        })
        expect(
          await f.journeys.action.findUnique({
            where: { parentBlockId: map[f.id('button')] }
          })
        ).toMatchObject({
          blockId: f.id('c'),
          parentStepId: map[f.id('b')],
          gtmEventName: 'human-tracking'
        })
        for (const name of names.filter((name) => name !== 'b'))
          expect(await block(name)).toEqual(
            source.blocks.find(({ id }) => id === f.id(name))
          )
        expect((await steps()).map(({ id }) => id)).toEqual([
          f.id('a'),
          f.id('b'),
          saved.idMap.copy,
          f.id('c')
        ])
      })

      it('duplicates a standalone submit Button with icons as a non-submit sibling', async () => {
        const saved = await f.save([
          {
            type: 'block_duplicate',
            source: ref(f.id('button')),
            key: 'copy',
            placement: end
          }
        ])
        const created = await f.journeys.block.findUniqueOrThrow({
          where: { id: saved.idMap.copy }
        })
        expect(created).toMatchObject({
          typename: 'ButtonBlock',
          parentBlockId: f.id('bc'),
          submitEnabled: false
        })
        expect(created.startIconId).toBe(saved.duplicateIdMap![f.id('start')])
        expect(created.endIconId).toBe(saved.duplicateIdMap![f.id('end')])
        expect((await block('button')).submitEnabled).toBe(true)
      })

      it('rejects standalone Video duplication before any other command commits', async () => {
        await assertRejected([
          {
            type: 'typography_set',
            blockId: f.id('heading'),
            content: 'Must roll back'
          },
          {
            type: 'block_duplicate',
            source: ref(f.id('video')),
            key: 'copy',
            placement: end
          }
        ])
      })

      it('preserves legacy/unmounted source content in a whole-Step copy and unrelated edits', async () => {
        const source = await block('legacy')
        const saved = await f.save([
          {
            type: 'step_duplicate',
            source: ref(f.id('c')),
            key: 'copy',
            placement: end
          }
        ])
        expect(
          await f.journeys.block.findUnique({
            where: { id: saved.duplicateIdMap![source.id] }
          })
        ).toMatchObject({
          typename: 'SignUpBlock',
          submitLabel: source.submitLabel,
          parentOrder: source.parentOrder
        })
        await f.save([
          { type: 'step_position_set', step: ref(f.id('a')), x: 10, y: 20 }
        ])
        expect(await block('legacy')).toEqual(source)
      })

      it.each([
        { kind: 'none' },
        { kind: 'step', destination: 'c' },
        { kind: 'link', url: 'https://example.com/next' },
        { kind: 'email', email: 'creator@example.com' },
        { kind: 'chat', chatUrl: 'https://wa.me/15555550100' },
        { kind: 'phone', phone: '+1 555 555 0100', countryCode: 'US' },
        { kind: 'sms', phone: '+1 555 555 0100', countryCode: 'US' }
      ])(
        'replaces the complete $kind action while preserving human tracking fields',
        async (value) => {
          const requested =
            value.kind === 'step'
              ? { ...value, destination: ref(f.id(value.destination!)) }
              : value
          const saved = await f.save([
            { type: 'action_set', block: ref(f.id('yes')), action: requested }
          ])
          const current = await action('yes')
          if (value.kind === 'none') expect(current).toBeNull()
          else {
            expect(current).toMatchObject({
              parentStepId: f.id('a'),
              gtmEventName: 'human-tracking'
            })
            const activeField = {
              step: 'blockId',
              link: 'url',
              email: 'email',
              chat: 'chatUrl',
              phone: 'phone',
              sms: 'phone'
            }[value.kind]
            for (const key of [
              'blockId',
              'url',
              'email',
              'chatUrl',
              'phone'
            ] as const)
              if (key !== activeField) expect(current![key]).toBeNull()
            switch (value.kind) {
              case 'step':
                expect(current!.blockId).toBe(f.id(value.destination!))
                break
              case 'link':
                expect(current!.url).toBe(value.url)
                break
              case 'email':
                expect(current!.email).toBe(value.email)
                break
              case 'chat':
                expect(current!.chatUrl).toBe(value.chatUrl)
                break
              case 'phone':
              case 'sms':
                expect(current).toMatchObject({
                  phone: value.phone,
                  countryCode: value.countryCode
                })
                break
            }
            if (value.kind === 'sms')
              expect(current!.contactAction).toBe('text')
            if (value.kind === 'phone')
              expect(current!.contactAction).toBe('call')
          }
          f.receipt(await f.historyAction('undo', saved.historyId!))
          expect(await action('yes')).toMatchObject({
            blockId: f.id('b'),
            gtmEventName: 'human-tracking'
          })
        }
      )

      it('reconnects and removes default/action edges independently', async () => {
        const untouched = await action('no')
        await f.save([defaults('c'), route('yes', 'a')])
        expect(await block('a')).toMatchObject({ nextBlockId: f.id('c') })
        expect(await action('yes')).toMatchObject({ blockId: f.id('a') })
        await f.save([
          defaults(null),
          {
            type: 'action_set',
            block: ref(f.id('yes')),
            action: { kind: 'none' }
          }
        ])
        expect(await block('a')).toMatchObject({ nextBlockId: null })
        expect(await action('yes')).toBeNull()
        expect(await action('no')).toEqual(untouched)
      })

      it('configures existing Video completion and legacy response submit routes while preserving response settings', async () => {
        const response = await block('response')
        const saved = await f.save([
          route('video', 'a'),
          route('legacy', 'a'),
          {
            type: 'block_add',
            key: 'submit',
            card: ref(f.id('cc')),
            placement: end,
            content: { kind: 'button', label: 'Send response' }
          }
        ])
        expect(await action('video')).toMatchObject({
          blockId: f.id('a'),
          parentStepId: f.id('b')
        })
        expect(await action('legacy')).toMatchObject({
          blockId: f.id('a'),
          parentStepId: f.id('c')
        })
        expect(await block('response')).toEqual(response)
        expect(
          await f.journeys.block.findUnique({
            where: { id: saved.idMap.submit }
          })
        ).toMatchObject({ submitEnabled: true })
      })

      it('preserves unsupported Cloudflare media when duplicating its owning Step', async () => {
        await f.journeys.block.update({
          where: { id: f.id('video') },
          data: {
            source: 'cloudflare',
            videoId: 'legacy-cloudflare-id',
            notes: 'unmounted publisher notes'
          }
        })
        const saved = await f.save([
          {
            type: 'step_duplicate',
            source: ref(f.id('b')),
            key: 'copy',
            placement: end
          }
        ])
        expect(
          await f.journeys.block.findUnique({
            where: { id: saved.duplicateIdMap![f.id('video')] }
          })
        ).toMatchObject({
          source: 'cloudflare',
          videoId: 'legacy-cloudflare-id',
          notes: 'unmounted publisher notes'
        })
      })

      it('clears and restores the owning menu reference as part of Step deletion', async () => {
        await f.journeys.journey.update({
          where: { id: f.journeyId },
          data: { menuStepBlockId: f.id('b') }
        })
        const saved = await f.save([
          { type: 'step_remove', step: ref(f.id('b')) }
        ])
        expect((await f.snapshot()).journey.menuStepBlockId).toBeNull()
        f.receipt(await f.historyAction('undo', saved.historyId!))
        expect((await f.snapshot()).journey.menuStepBlockId).toBe(f.id('b'))
      })

      it('rejects external actions on submit Buttons and permits None or Step actions', async () => {
        await assertRejected([
          {
            type: 'action_set',
            block: ref(f.id('button')),
            action: { kind: 'link', url: 'https://example.com' }
          }
        ])
        await f.save([route('button', 'a')])
        await f.save([
          {
            type: 'action_set',
            block: ref(f.id('button')),
            action: { kind: 'none' }
          }
        ])
        expect(await action('button')).toBeNull()
      })

      it('deletes B once, preserves incoming route rows exactly, and reports affected links without repairing them', async () => {
        const source = await block('a')
        const yes = await action('yes')
        const no = await action('no')
        const deletion = await f.input([
          { type: 'step_remove', step: ref(f.id('b')) }
        ])
        const saved = f.receipt(await f.edit(deletion))
        expect(await block('a')).toEqual(source)
        expect(await action('yes')).toEqual(yes)
        expect(await action('no')).toEqual(no)
        expect(saved.affectedLinks).toEqual(
          expect.arrayContaining([
            {
              sourceBlockId: f.id('a'),
              kind: 'default',
              destinationStepId: f.id('b')
            },
            {
              sourceBlockId: f.id('yes'),
              kind: 'action',
              destinationStepId: f.id('b')
            }
          ])
        )
        expect((await block('b')).deletedAt).toBeInstanceOf(Date)
        expect((await block('poster')).deletedAt).toBeInstanceOf(Date)
        const read = await f.call('journey_read', {
          journeyId: f.journeyId,
          view: 'steps'
        })
        expect(read.json.result?.isError, read.text).not.toBe(true)
        expect(read.text).toContain(f.id('b'))
        expect(read.text).toContain('unresolvedDefaultRoute')
        expect(read.text).toContain('unresolved')
        expect(f.receipt(await f.edit(deletion))).toEqual(saved)
        expect(await f.counts()).toEqual({
          operations: 1,
          history: 1,
          effects: 1
        })
        const proposedRepairs = [defaults('c'), route('yes', 'c')]
        expect(proposedRepairs).toHaveLength(2)
        expect(await block('a')).toEqual(source)
        await f.save([
          {
            type: 'typography_set',
            blockId: f.id('heading'),
            content: 'Unrelated later edit'
          }
        ])
        expect(await action('yes')).toEqual(yes)
        await assertRejected([route('no', 'b')])
      })

      it('preserves visible Step order through Admin delete and Undo after an MCP deletion', async () => {
        await f.journeys.block.create({
          data: {
            id: f.id('d'),
            journeyId: f.journeyId,
            typename: 'StepBlock',
            parentOrder: 3
          }
        })
        await f.journeys.block.update({
          where: { id: f.id('b') },
          data: { nextBlockId: f.id('a') }
        })
        const incomingDefault = await block('b')
        const incomingActions = await f.journeys.action.findMany({
          where: { parentBlock: { journeyId: f.journeyId } },
          orderBy: { parentBlockId: 'asc' }
        })

        await f.save([{ type: 'step_remove', step: ref(f.id('a')) }])
        expect(await block('b')).toEqual(incomingDefault)
        expect(
          await f.journeys.action.findMany({
            where: { parentBlock: { journeyId: f.journeyId } },
            orderBy: { parentBlockId: 'asc' }
          })
        ).toEqual(incomingActions)
        expect(
          (await steps()).map(({ id, parentOrder }) => [id, parentOrder])
        ).toEqual([
          [f.id('b'), 1],
          [f.id('c'), 2],
          [f.id('d'), 3]
        ])

        await f.adminBlockMutation('Delete', f.id('c'))
        expect((await steps()).map(({ id }) => id)).toEqual([
          f.id('b'),
          f.id('d')
        ])
        await f.adminBlockMutation('Restore', f.id('c'))
        expect((await steps()).map(({ id }) => id)).toEqual([
          f.id('b'),
          f.id('c'),
          f.id('d')
        ])
        expect(await block('cc')).toMatchObject({
          parentBlockId: f.id('c'),
          deletedAt: null
        })
      })

      it('applies only requested repairs after deletion and keeps the untouched answer unchanged', async () => {
        await f.save([{ type: 'step_remove', step: ref(f.id('b')) }])
        const untouched = await action('no')
        await f.save([route('yes', 'c')])
        expect(await action('yes')).toMatchObject({ blockId: f.id('c') })
        expect(await action('no')).toEqual(untouched)
        expect(await block('a')).toMatchObject({ nextBlockId: f.id('b') })
      })

      it.each([
        'heading',
        'settings',
        'action',
        'tracking',
        'added-action',
        'removed-action',
        'content-removal'
      ])(
        'refuses redo after a newer Admin %s edit in the restored subtree',
        async (edit) => {
          const saved = await f.save([
            edit === 'content-removal'
              ? { type: 'block_remove', block: ref(f.id('button')) }
              : { type: 'step_remove', step: ref(f.id('b')) }
          ])
          f.receipt(await f.historyAction('undo', saved.historyId!))
          if (edit === 'heading' || edit === 'settings') {
            await f.journeys.block.update({
              where: { id: f.id('btext') },
              data:
                edit === 'heading'
                  ? { content: 'New Admin heading' }
                  : { settings: { human: 'New Admin setting' } }
            })
          } else if (edit === 'added-action') {
            await f.journeys.action.create({
              data: {
                parentBlockId: f.id('video'),
                blockId: f.id('a'),
                parentStepId: f.id('b')
              }
            })
          } else if (edit === 'removed-action') {
            await f.journeys.action.delete({
              where: { parentBlockId: f.id('button') }
            })
          } else {
            await f.journeys.action.update({
              where: { parentBlockId: f.id('button') },
              data:
                edit === 'tracking'
                  ? { gtmEventName: 'New Admin tracking' }
                  : { blockId: f.id('a') }
            })
          }
          const before = await f.snapshot()
          const history = await f.journeys.mcpEditHistory.findMany({
            where: { journeyId: f.journeyId }
          })
          const result = await f.historyAction('redo', saved.historyId!)
          expect(result.json.result?.isError, result.text).toBe(true)
          expect(result.text).toContain('HISTORY_CONFLICT')
          expect(await f.snapshot()).toEqual(before)
          expect(
            await f.journeys.mcpEditHistory.findMany({
              where: { journeyId: f.journeyId }
            })
          ).toEqual(history)
        }
      )

      it('restores delete-only content with the same complete IDs while preserving newer human routes and Host state', async () => {
        const subtreeIds = [
          'b',
          'bc',
          'btext',
          'button',
          'start',
          'end',
          'video',
          'poster',
          'cover'
        ].map(f.id)
        const before = await rows()
        const saved = await f.save([
          { type: 'step_remove', step: ref(f.id('b')) }
        ])
        await f.journeys.block.update({
          where: { id: f.id('a') },
          data: { nextBlockId: f.id('c') }
        })
        await f.journeys.action.update({
          where: { parentBlockId: f.id('yes') },
          data: { blockId: f.id('a') }
        })
        const host = await f.journeys.host.create({
          data: { teamId: 'structure-team-alice', title: 'Later human Host' }
        })
        await f.journeys.journey.update({
          where: { id: f.journeyId },
          data: { hostId: host.id }
        })
        const inbound = { step: await block('a'), answer: await action('yes') }
        f.receipt(await f.historyAction('undo', saved.historyId!))
        const restored = await rows()
        for (const id of subtreeIds) {
          const { updatedAt: _oldUpdatedAt, ...expected } = before.find(
            (item) => item.id === id
          )!
          const { updatedAt: _newUpdatedAt, ...actual } = restored.find(
            (item) => item.id === id
          )!
          expect(actual).toEqual(expected)
        }
        expect(await block('a')).toEqual(inbound.step)
        expect(await action('yes')).toEqual(inbound.answer)
        expect((await f.snapshot()).journey.hostId).toBe(host.id)
      })

      it.each([
        { min: 2, max: 2 },
        { min: 2, max: null },
        { min: null, max: 2 }
      ])(
        'normalizes existing option bounds %j on removal and restores them with the same IDs',
        async (bounds) => {
          await f.journeys.block.create({
            data: {
              id: f.id('multiselect'),
              journeyId: f.journeyId,
              typename: 'MultiselectBlock',
              parentBlockId: f.id('ac'),
              parentOrder: 2,
              ...bounds
            }
          })
          await f.journeys.block.createMany({
            data: ['first', 'second'].map((label, parentOrder) => ({
              id: f.id(label),
              journeyId: f.journeyId,
              typename: 'MultiselectOptionBlock',
              parentBlockId: f.id('multiselect'),
              parentOrder,
              label
            }))
          })
          const saved = await f.save([
            { type: 'block_remove', block: ref(f.id('first')) }
          ])
          const normalized = {
            min: bounds.min === null ? null : 1,
            max: bounds.max === null ? null : 1
          }
          expect(await block('multiselect')).toMatchObject(normalized)
          expect((await block('first')).deletedAt).toBeInstanceOf(Date)
          expect(await block('second')).toMatchObject({ parentOrder: 0 })

          f.receipt(await f.historyAction('undo', saved.historyId!))
          expect(await block('multiselect')).toMatchObject(bounds)
          expect(await block('first')).toMatchObject({
            deletedAt: null,
            parentBlockId: f.id('multiselect'),
            parentOrder: 0
          })
          expect(await block('second')).toMatchObject({ parentOrder: 1 })
          f.receipt(await f.historyAction('redo', saved.historyId!))
          expect(await block('multiselect')).toMatchObject(normalized)
          expect((await block('first')).deletedAt).toBeInstanceOf(Date)
        }
      )

      it.each([undefined, '#123456'])(
        'restores structural color history from %s while preserving later settings and rejecting a conflicting color',
        async (color) => {
          const originalSettings = {
            unmounted: true,
            ...(color === undefined ? {} : { color })
          }
          await f.journeys.block.update({
            where: { id: f.id('heading') },
            data: { settings: originalSettings }
          })
          const saved = await f.save([
            {
              type: 'step_add',
              key: 'new_step',
              cardKey: 'new_card',
              placement: end
            },
            {
              type: 'typography_set',
              blockId: f.id('heading'),
              color: '#abcdef'
            }
          ])
          await f.journeys.block.update({
            where: { id: f.id('heading') },
            data: {
              settings: {
                ...originalSettings,
                color: '#abcdef',
                human: 'later'
              }
            }
          })
          f.receipt(await f.historyAction('undo', saved.historyId!))
          expect((await block('heading')).settings).toEqual({
            ...originalSettings,
            human: 'later'
          })
          expect(
            (
              await f.journeys.block.findUniqueOrThrow({
                where: { id: saved.idMap.new_step }
              })
            ).deletedAt
          ).toBeInstanceOf(Date)
          f.receipt(await f.historyAction('redo', saved.historyId!))
          expect((await block('heading')).settings).toEqual({
            unmounted: true,
            color: '#abcdef',
            human: 'later'
          })
          expect(
            (
              await f.journeys.block.findUniqueOrThrow({
                where: { id: saved.idMap.new_step }
              })
            ).deletedAt
          ).toBeNull()

          await f.journeys.block.update({
            where: { id: f.id('heading') },
            data: {
              settings: { unmounted: true, color: '#654321', human: 'later' }
            }
          })
          const humanState = await f.snapshot()
          const rejected = await f.historyAction('undo', saved.historyId!)
          expect(rejected.text).toContain('HISTORY_CONFLICT')
          expect(await f.snapshot()).toEqual(humanState)
        }
      )

      it('commits combined delete-and-specific-route repair as one batch and refuses conflicting undo', async () => {
        const untouched = await action('no')
        const saved = await f.save([
          { type: 'step_remove', step: ref(f.id('b')) },
          defaults('c'),
          {
            type: 'action_set',
            block: ref(f.id('yes')),
            action: { kind: 'none' }
          }
        ])
        expect((await block('b')).deletedAt).toBeInstanceOf(Date)
        expect(await block('a')).toMatchObject({ nextBlockId: f.id('c') })
        expect(await action('yes')).toBeNull()
        expect(await action('no')).toEqual(untouched)
        expect(await f.counts()).toEqual({
          operations: 1,
          history: 1,
          effects: 1
        })
        await f.journeys.block.update({
          where: { id: f.id('a') },
          data: { nextBlockId: f.id('a') }
        })
        const afterHuman = await f.snapshot()
        const result = await f.historyAction('undo', saved.historyId!)
        expect(result.text).toContain('HISTORY_CONFLICT')
        expect(await f.snapshot()).toEqual(afterHuman)
      })

      it('undoes and redoes exactly the requested combined deletion and repair changes', async () => {
        const before = {
          step: await block('a'),
          yes: await action('yes'),
          no: await action('no')
        }
        const saved = await f.save([
          { type: 'step_remove', step: ref(f.id('b')) },
          defaults('c')
        ])
        f.receipt(await f.historyAction('undo', saved.historyId!))
        expect(await block('b')).toMatchObject({ deletedAt: null })
        expect((await block('a')).nextBlockId).toBe(before.step.nextBlockId)
        expect(await action('yes')).toEqual(before.yes)
        expect(await action('no')).toEqual(before.no)
        f.receipt(await f.historyAction('redo', saved.historyId!))
        expect((await block('b')).deletedAt).toBeInstanceOf(Date)
        expect((await block('a')).nextBlockId).toBe(f.id('c'))
      })

      it.each([
        'after_accept',
        'after_content',
        'after_revision',
        'after_history',
        'after_receipt',
        'after_outbox',
        'before_commit'
      ] as const)(
        'rolls back both halves and every receipt/history/effect on combined-operation interruption at %s',
        async (point) => {
          const before = await f.snapshot()
          const request = await f.input([
            { type: 'step_remove', step: ref(f.id('b')) },
            defaults('c'),
            route('yes', 'c')
          ])
          f.checkpoint = async (current) => {
            if (current === point)
              throw new Error('controlled-combined-failure')
          }
          const failed = await f.edit(request)
          expect(failed.json.result?.isError, failed.text).toBe(true)
          expect(failed.text).not.toContain('controlled-combined-failure')
          expect(await f.snapshot()).toEqual(before)
          f.checkpoint = undefined
          const saved = f.receipt(await f.edit(request))
          expect(f.receipt(await f.edit(request))).toEqual(saved)
          expect(await f.counts()).toEqual({
            operations: 1,
            history: 1,
            effects: 1
          })
        }
      )

      it('recovers the same allocated IDs and combined result after losing a committed response', async () => {
        const request = await f.input([
          {
            type: 'step_add',
            key: 'new_step',
            cardKey: 'new_card',
            placement: end
          },
          { type: 'step_remove', step: ref(f.id('b')) },
          {
            type: 'step_default_set',
            step: ref(f.id('a')),
            destination: local('new_step')
          }
        ])
        f.loseNextResponse()
        expect((await f.edit(request)).json.result?.isError).toBe(true)
        const recovered = f.receipt(await f.edit(request))
        expect(f.receipt(await f.edit(request))).toEqual(recovered)
        expect(
          (await steps()).filter(({ id }) => id === recovered.idMap.new_step)
        ).toHaveLength(1)
        expect(await f.counts()).toEqual({
          operations: 1,
          history: 1,
          effects: 1
        })
      })

      it('removes ordinary content with all owned children, then restores identical IDs', async () => {
        const saved = await f.save([
          { type: 'block_remove', block: ref(f.id('button')) }
        ])
        for (const name of ['button', 'start', 'end'])
          expect((await block(name)).deletedAt).toBeInstanceOf(Date)
        f.receipt(await f.historyAction('undo', saved.historyId!))
        for (const name of ['button', 'start', 'end'])
          expect((await block(name)).deletedAt).toBeNull()
        expect(await block('button')).toMatchObject({
          startIconId: f.id('start'),
          endIconId: f.id('end'),
          submitEnabled: true
        })
      })

      it('deliberately replaces an earlier human route after reading and rejects intervening human changes as stale', async () => {
        await f.journeys.action.update({
          where: { parentBlockId: f.id('yes') },
          data: { blockId: f.id('a') }
        })
        const read = await f.call('journey_read', {
          journeyId: f.journeyId,
          view: 'steps'
        })
        expect(read.text).toContain(f.id('a'))
        await f.save([route('yes', 'c')])
        expect(await action('yes')).toMatchObject({ blockId: f.id('c') })
        const stale = await f.input([route('yes', 'b')])
        await f.journeys.action.update({
          where: { parentBlockId: f.id('yes') },
          data: { blockId: f.id('a') }
        })
        const afterHuman = await f.snapshot()
        expect((await f.edit(stale)).text).toContain('REVISION_CONFLICT')
        expect(await f.snapshot()).toEqual(afterHuman)
      })

      it.each(['wrong-type', 'deleted', 'foreign'] as const)(
        'rejects a %s route target and the entire mixed batch',
        async (kind) => {
          let target = f.id('heading')
          if (kind === 'deleted') {
            await f.journeys.block.update({
              where: { id: f.id('c') },
              data: { deletedAt: new Date() }
            })
            target = f.id('c')
          } else if (kind === 'foreign') {
            const foreign = await f.journeys.journey.create({
              data: {
                title: 'Foreign synthetic journey',
                slug: `${f.journeyId}-foreign`,
                languageId: '529',
                teamId: 'structure-team-alice',
                status: 'draft'
              }
            })
            const step = await f.journeys.block.create({
              data: {
                journeyId: foreign.id,
                typename: 'StepBlock',
                parentOrder: 0
              }
            })
            target = step.id
          }
          await assertRejected([
            {
              type: 'typography_set',
              blockId: f.id('heading'),
              content: 'Must not commit'
            },
            {
              type: 'action_set',
              block: ref(f.id('yes')),
              action: { kind: 'step', destination: ref(target) }
            }
          ])
          await assertRejected([
            {
              type: 'step_default_set',
              step: ref(f.id('a')),
              destination: ref(target)
            }
          ])
        }
      )

      it.each([
        'wrong-parent-type',
        'deleted-parent',
        'foreign-parent',
        'foreign-anchor'
      ] as const)(
        'rejects a %s for complete creation without orphan descendants',
        async (kind) => {
          let cardId = f.id('a')
          let placement: unknown = end
          if (kind === 'deleted-parent') {
            await f.journeys.block.update({
              where: { id: f.id('ac') },
              data: { deletedAt: new Date() }
            })
            cardId = f.id('ac')
          } else if (kind === 'foreign-parent') {
            const foreign = await f.journeys.journey.create({
              data: {
                title: 'Foreign',
                slug: `${f.journeyId}-foreign`,
                languageId: '529',
                teamId: 'structure-team-alice',
                status: 'draft'
              }
            })
            const step = await f.journeys.block.create({
              data: {
                journeyId: foreign.id,
                typename: 'StepBlock',
                parentOrder: 0
              }
            })
            const card = await f.journeys.block.create({
              data: {
                journeyId: foreign.id,
                typename: 'CardBlock',
                parentBlockId: step.id,
                parentOrder: 0
              }
            })
            cardId = card.id
          } else if (kind === 'foreign-anchor') {
            cardId = f.id('ac')
            placement = { position: 'before', anchor: ref(f.id('btext')) }
          }
          await assertRejected([
            {
              type: 'block_add',
              key: 'invalid',
              card: ref(cardId),
              placement,
              content: { kind: 'button' }
            }
          ])
        }
      )

      it.each([
        {
          commands: [
            { type: 'step_remove', step: 'b' },
            { type: 'step_remove', step: 'b' }
          ]
        },
        {
          commands: [
            { type: 'step_remove', step: 'b' },
            { type: 'block_remove', block: 'button' }
          ]
        }
      ])('rejects overlapping destructive gestures', async ({ commands }) => {
        await assertRejected(
          commands.map((command) => ({
            ...command,
            ...('step' in command
              ? { step: ref(f.id(command.step!)) }
              : { block: ref(f.id(command.block)) })
          }))
        )
      })

      it('rejects duplicate field/route writes even when an assignment is a no-op', async () => {
        await assertRejected([defaults('b'), defaults('c')])
        await assertRejected([route('yes', 'b'), route('yes', 'c')])
        await assertRejected([
          {
            type: 'typography_set',
            blockId: f.id('heading'),
            content: 'Human heading'
          },
          {
            type: 'typography_set',
            blockId: f.id('heading'),
            content: 'Conflicting heading'
          }
        ])
      })

      it('rejects wrong-type structural and action sources without changing eligible earlier content', async () => {
        for (const command of [
          {
            type: 'step_duplicate',
            source: ref(f.id('bc')),
            key: 'copy',
            placement: end
          },
          { type: 'step_remove', step: ref(f.id('bc')) },
          { type: 'block_remove', block: ref(f.id('start')) },
          {
            type: 'block_duplicate',
            source: ref(f.id('poster')),
            key: 'copy',
            placement: end
          },
          {
            type: 'action_set',
            block: ref(f.id('heading')),
            action: { kind: 'none' }
          }
        ])
          await assertRejected([
            {
              type: 'typography_set',
              blockId: f.id('heading'),
              content: 'Must not commit'
            },
            command
          ])
      })

      it.each(['step_duplicate', 'step_remove'] as const)(
        'counts complete existing subtree expansion before %s writes',
        async (type) => {
          await f.journeys.block.createMany({
            data: Array.from({ length: 201 }, (_, index) => ({
              id: f.id('bulk') + '-' + index,
              journeyId: f.journeyId,
              typename: 'TypographyBlock',
              parentBlockId: f.id('bc'),
              parentOrder: 3 + index,
              content: 'Synthetic expansion fixture'
            }))
          })
          const rejected = await assertRejected([
            type === 'step_remove'
              ? { type, step: ref(f.id('b')) }
              : { type, source: ref(f.id('b')), key: 'copy', placement: end }
          ])
          expect(rejected.text).toContain('LIMIT_EXCEEDED')
        }
      )

      it('rejects duplicate local keys, missing locals and caller-controlled descendants', async () => {
        await assertRejected([
          { type: 'step_add', key: 'same', cardKey: 'same', placement: end }
        ])
        await assertRejected([
          {
            type: 'step_default_set',
            step: ref(f.id('a')),
            destination: local('missing')
          }
        ])
        await assertRejected([
          {
            type: 'step_add',
            key: 'step',
            cardKey: 'card',
            placement: end,
            content: [
              {
                key: 'button',
                content: { kind: 'button', startIconId: f.id('start') }
              }
            ]
          }
        ])
      })

      it('bounds expanded object counts and new Steps before any mutation', async () => {
        const expanded = await assertRejected([
          {
            type: 'step_add',
            key: 'step',
            cardKey: 'card',
            placement: end,
            content: Array.from({ length: 70 }, (_, index) => ({
              key: `button_${index}`,
              content: { kind: 'button' }
            }))
          }
        ])
        expect(expanded.text).toContain('LIMIT_EXCEEDED')
        const steps = await assertRejected(
          Array.from({ length: 21 }, (_, index) => ({
            type: 'step_add',
            key: `step_${index}`,
            cardKey: `card_${index}`,
            placement: end
          }))
        )
        expect(steps.text).toContain('LIMIT_EXCEEDED')
      })

      it.each(['read-only', 'revoked', 'published', 'lost-rights'] as const)(
        'rejects structural writes for %s authority/state',
        async (kind) => {
          const request = await f.input([
            { type: 'step_remove', step: ref(f.id('b')) }
          ])
          let token: string | undefined
          if (kind === 'read-only') token = await f.consent('view')
          if (kind === 'revoked')
            await f.auth.agentConnection.updateMany({
              where: { userId: 'alice' },
              data: { revokedAt: new Date() }
            })
          if (kind === 'published')
            await f.journeys.journey.update({
              where: { id: f.journeyId },
              data: {
                status: 'published',
                publishedAt: new Date(),
                firstPublishedAt: new Date()
              }
            })
          if (kind === 'lost-rights')
            await f.journeys.userTeam.deleteMany({
              where: { teamId: 'structure-team-alice', userId: 'alice' }
            })
          const before = await f.snapshot()
          const result = await f.edit(request, token)
          expect(
            result.json.result?.isError ?? Boolean(result.json.error),
            result.text
          ).toBe(true)
          expect(await f.snapshot()).toEqual(before)
          if (kind === 'lost-rights')
            await f.journeys.userTeam.create({
              data: {
                teamId: 'structure-team-alice',
                userId: 'alice',
                role: 'manager'
              }
            })
        }
      )

      it('rejects hidden Host changes, arbitrary content trees and unsafe action URLs', async () => {
        for (const command of [
          {
            type: 'step_add',
            key: 'step',
            cardKey: 'card',
            placement: end,
            hostId: 'hidden-host'
          },
          {
            type: 'step_add',
            key: 'step',
            cardKey: 'card',
            placement: end,
            card: { hostId: 'hidden-host' }
          },
          {
            type: 'block_add',
            key: 'content',
            card: ref(f.id('ac')),
            placement: end,
            content: {
              kind: 'typography',
              content: 'Hidden',
              children: [{ typename: 'Host' }]
            }
          },
          {
            type: 'action_set',
            block: ref(f.id('yes')),
            action: { kind: 'link', url: 'javascript:alert(1)' }
          }
        ])
          await assertRejected([command])
      })

      it('returns one retained structural history entry and protects history after grant withdrawal', async () => {
        const saved = await f.save([
          { type: 'step_add', key: 'step', cardKey: 'card', placement: end }
        ])
        const read = await f.call('journey_history', { journeyId: f.journeyId })
        const history = historyResult.parse(read.json.result?.structuredContent)
        expect(history.entries).toHaveLength(1)
        expect(history.undoEntryId).toBe(saved.historyId)
        await f.auth.agentConnection.updateMany({
          where: { userId: 'alice' },
          data: { revokedAt: new Date() }
        })
        const denied = await f.call('journey_history', {
          journeyId: f.journeyId
        })
        expect(denied.text).not.toContain(saved.historyId!)
        expect(denied.text).not.toContain(saved.idMap.step)
      })
    }
  )
})
