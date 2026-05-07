export const resolvedParams = <T>(value: T): Promise<T> =>
  Object.assign(Promise.resolve(value), { status: 'fulfilled' as const, value })
