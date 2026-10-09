import { readShortLinksEnv } from '../lib/env'

/**
 * Minimal ClickHouse HTTP client for the redirect analytics database. Every
 * query is parameterised with ClickHouse `{name:Type}` placeholders whose
 * values travel as `param_<name>` query-string parameters — user input is
 * never interpolated into SQL.
 */

export interface ClickHouseConfig {
  url: string
  database: string
  user: string | null
  password: string | null
}

export type ClickHouseParams = Record<string, string | number>

/** Null when `SHORT_LINKS_CLICKHOUSE_URL` is unset (stats return zeros). */
export function getClickHouseConfig(): ClickHouseConfig | null {
  const env = readShortLinksEnv()
  const url = env.SHORT_LINKS_CLICKHOUSE_URL
  if (url == null) return null
  return {
    url: url.replace(/\/+$/, ''),
    database: env.SHORT_LINKS_CLICKHOUSE_DATABASE,
    user: env.SHORT_LINKS_CLICKHOUSE_USER ?? null,
    password: env.SHORT_LINKS_CLICKHOUSE_PASSWORD ?? null
  }
}

interface ClickHouseJsonResponse<Row> {
  data: Row[]
}

export async function clickHouseQuery<Row>(
  config: ClickHouseConfig,
  sql: string,
  params: ClickHouseParams
): Promise<Row[]> {
  const search = new URLSearchParams({ database: config.database })
  for (const [name, value] of Object.entries(params))
    search.set(`param_${name}`, String(value))

  const headers: Record<string, string> = {
    'Content-Type': 'text/plain'
  }
  if (config.user != null)
    headers.Authorization = `Basic ${Buffer.from(
      `${config.user}:${config.password ?? ''}`
    ).toString('base64')}`

  const response = await fetch(`${config.url}/?${search.toString()}`, {
    method: 'POST',
    headers,
    body: `${sql} FORMAT JSON`
  })
  if (!response.ok)
    throw new Error(
      `ClickHouse query failed (${response.status}): ${await response.text()}`
    )

  const body = (await response.json()) as ClickHouseJsonResponse<Row>
  return body.data
}
