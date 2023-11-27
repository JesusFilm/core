export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { default: tracer } = await import(
      /* webpackChunkName: "dd-trace" */
      'dd-trace'
    )

    tracer.init({ logInjection: true })
    tracer.use('next')
  }
}
