import { exec } from 'child_process'

exec(
  'sh apps/api-videos/src/app/modules/importer/importerSeedDiff/importerSeedDiff.sh',
  (error, stdout, stderr) => {
    console.log(stdout)
    console.log(stderr)
    if (error != null) {
      console.log(`exec error: ${error.message}`)
    }
  }
)
