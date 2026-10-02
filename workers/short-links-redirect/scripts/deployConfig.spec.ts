import {
  type LiveBinding,
  bindingsToCarryOver,
  renderDeployConfig
} from './deployConfig'

const live: LiveBinding[] = [
  { name: 'SHORT_LINKS_KV', type: 'kv_namespace', namespace_id: 'global-id' },
  { name: 'KV_JESUS_FILM', type: 'kv_namespace', namespace_id: 'film-id' },
  { name: 'KV_JESUS_MOVIE', type: 'kv_namespace', namespace_id: 'movie-id' },
  { name: 'SHORT_LINKS_EVENTS', type: 'queue' },
  { name: 'CLICKHOUSE_PASSWORD', type: 'secret_text' }
]

describe('deploy config', () => {
  describe('bindingsToCarryOver', () => {
    it('carries over the live KV_ bindings the config does not declare', () => {
      expect(bindingsToCarryOver(['SHORT_LINKS_KV'], live)).toEqual([
        { binding: 'KV_JESUS_FILM', id: 'film-id' },
        { binding: 'KV_JESUS_MOVIE', id: 'movie-id' }
      ])
    })

    it('leaves a binding the config already declares to the config', () => {
      expect(
        bindingsToCarryOver(['SHORT_LINKS_KV', 'KV_JESUS_FILM'], live)
      ).toEqual([{ binding: 'KV_JESUS_MOVIE', id: 'movie-id' }])
    })

    it('never carries a binding wrangler.toml owns', () => {
      expect(
        bindingsToCarryOver(
          [],
          [
            { name: 'SHORT_LINKS_KV', type: 'kv_namespace', namespace_id: 'x' },
            { name: 'OTHER_KV', type: 'kv_namespace', namespace_id: 'y' },
            { name: 'KV_SECRET', type: 'secret_text' }
          ]
        )
      ).toEqual([])
    })

    it('carries nothing for a Worker that was never deployed', () => {
      expect(bindingsToCarryOver(['SHORT_LINKS_KV'], [])).toEqual([])
    })
  })

  describe('renderDeployConfig', () => {
    const toml =
      'name = "short-links-redirect-dev"\n\n[env.stage]\nname = "short-links-redirect-stage"\n'

    it('appends one kv_namespaces block per carried binding to the environment', () => {
      const rendered = renderDeployConfig(toml, 'stage', [
        { binding: 'KV_JESUS_FILM', id: 'film-id' },
        { binding: 'KV_JESUS_MOVIE', id: 'movie-id' }
      ])

      expect(rendered.startsWith(toml.trimEnd())).toBe(true)
      expect(rendered).toContain(
        '[[env.stage.kv_namespaces]]\nbinding = "KV_JESUS_FILM"\nid = "film-id"\n'
      )
      expect(rendered).toContain(
        '[[env.stage.kv_namespaces]]\nbinding = "KV_JESUS_MOVIE"\nid = "movie-id"\n'
      )
    })

    it('returns wrangler.toml untouched when there is nothing to carry', () => {
      expect(renderDeployConfig(toml, 'prod', [])).toBe(toml)
    })

    it('leaves the dev-only top-level namespaces out of the deployed config', () => {
      const withDevBindings = [
        'name = "short-links-redirect-dev"',
        '',
        '[[kv_namespaces]]',
        'binding = "SHORT_LINKS_KV"',
        'id = "short-links-dev"',
        '',
        '# dev only',
        '[[kv_namespaces]]',
        'binding = "KV_NXSTP_IS"',
        'id = "short-links-dev-nxstp-is"',
        '',
        '[[queues.producers]]',
        'binding = "SHORT_LINKS_EVENTS"',
        '',
        '[[env.stage.kv_namespaces]]',
        'binding = "SHORT_LINKS_KV"',
        'id = "stage-global"',
        ''
      ].join('\n')

      const rendered = renderDeployConfig(
        withDevBindings,
        'stage',
        [],
        ['KV_NXSTP_IS']
      )

      expect(rendered).not.toContain('KV_NXSTP_IS')
      expect(rendered).toContain(
        '[[kv_namespaces]]\nbinding = "SHORT_LINKS_KV"\nid = "short-links-dev"'
      )
      expect(rendered).toContain(
        '[[queues.producers]]\nbinding = "SHORT_LINKS_EVENTS"'
      )
      expect(rendered).toContain(
        '[[env.stage.kv_namespaces]]\nbinding = "SHORT_LINKS_KV"\nid = "stage-global"'
      )
    })
  })
})
