import { nua1 } from './seeds/nua1'
import { nua2 } from './seeds/nua2'
import { nua8 } from './seeds/nua8'

async function main(): Promise<void> {
  await nua1(),
  await nua2(),
  await nua8()
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
