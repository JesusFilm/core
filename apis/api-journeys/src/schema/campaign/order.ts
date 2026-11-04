/**
 * Renumber an ordered list contiguously from zero in the order given:
 * `write` stores one row's new `order`. The writes run one after another in
 * id order, whatever the list order, so every renumber locks its rows in the
 * same order as a Campaign Write that declares `textRows` or `targets`, and
 * cannot deadlock with it. Returns what each write returns, in the list order.
 */
export async function renumber<Row extends { id: string }, Result>(
  rows: readonly Row[],
  write: (row: Row, order: number) => Promise<Result>
): Promise<Result[]> {
  const byId = rows
    .map((row, order) => ({ row, order }))
    .sort((a, b) => (a.row.id < b.row.id ? -1 : a.row.id > b.row.id ? 1 : 0))
  const results = new Array<Result>(rows.length)
  for (const { row, order } of byId) results[order] = await write(row, order)
  return results
}
