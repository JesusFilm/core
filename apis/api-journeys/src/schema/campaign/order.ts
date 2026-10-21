/**
 * Renumber an ordered list contiguously from zero in the order given:
 * `write` stores one row's new `order`. Returns what each write returns, in
 * the same order.
 */
export async function renumber<Row, Result>(
  rows: readonly Row[],
  write: (row: Row, order: number) => Promise<Result>
): Promise<Result[]> {
  return await Promise.all(
    rows.map(async (row, order) => await write(row, order))
  )
}
