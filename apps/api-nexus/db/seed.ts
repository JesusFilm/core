import { jfNexus } from './seeds/jfNexus'

async function main(): Promise<void> {
    await jfNexus()
}
main().catch((e) => {
    console.error(e)
    process.exit(1)
})
