import uniq from 'lodash/uniq'

import { prisma } from '../../../../lib/prisma'

export const EDITIONS = [
  '0-BrothersSubtitles',
  '0-EasterExplained',
  '0-FallingPlates',
  '0-LivingWord',
  '0-MostlyTeaSubtitles',
  '0-Pennyhouse',
  '0-PortionsSubtitles',
  '0-TrainV_1Install',
  '0-TrainV_2Find',
  '0-TrainV_3Share',
  '0-TrainV_4Download',
  '0-TrainV_5Ministry',
  '0-TumlukdenSubtitles',
  '2_andreasStoryNoSubs',
  '2_jessicastoryNoSubs',
  '2_storybehindSTNoSubs',
  '2_sweettoothNoSubs',
  '7_ncsNoSubs',
  '7_nfs01_french_subs',
  '7_nfs01_portuguese_subs',
  '7_nfs01_rus_subs',
  '7_nfs01_spa_subs',
  '7_nfs02_french_subs',
  '7_nfs02_portuguese_subs',
  '7_nfs02_rus_subs',
  '7_nfs02_spa_subs',
  '7_nfs03_french_subs',
  '7_nfs03_portuguese_subs',
  '7_nfs03_rus_subs',
  '7_nfs03_spa_subs',
  '7_nfs04_french_subs',
  '7_nfs04_portuguese_subs',
  '7_nfs04_rus_subs',
  '7_nfs04_spa_subs',
  '7_nfs05_french_subs',
  '7_nfs05_portuguese_subs',
  '7_nfs05_rus_subs',
  '7_nfs05_spa_subs',
  '7_nfs06_french_subs',
  '7_nfs06_portuguese_subs',
  '7_nfs06_rus_subs',
  '7_nfs06_spa_subs',
  '7_nfs07_french_subs',
  '7_nfs07_portuguese_subs',
  '7_nfs07_rus_subs',
  '7_nfs07_spa_subs',
  '7_nfs08_french_subs',
  '7_nfs08_portuguese_subs',
  '7_nfs08_rus_subs',
  '7_nfs08_spa_subs',
  '7_nfs09_french_subs',
  '7_nfs09_portuguese_subs',
  '7_nfs09_spa_subs',
  '7_nfs10_french_subs',
  '7_nfs10_portuguese_subs',
  '7_nfs10_spa_subs',
  '7_nur_NoSubs',
  '8_nbc_NoSubs',
  'ac',
  'base',
  'BibleReliableNoSubs',
  'burned-in',
  'ChosenWitness',
  'cl',
  'cl13',
  'ComingHomeNoSubs',
  'CrushingNoSubs',
  'CSF',
  'ec',
  'Fabio_NoSubs',
  'FileZeroNoSubs',
  'fj',
  'fji',
  'HappinessPuzzleNoSubs',
  'jl',
  'jlnoci',
  'jltib',
  'mld',
  'Oscar_NoSubs',
  'ot',
  'otwcc',
  'riv',
  'SongofReedsNoSubs',
  'ThereIsHopeAsiaSubs',
  'wjv',
  'wl',
  'wl60',
  'wl60_rpc',
  'wl7',
  'wl_rpc',
  'YoureNotHopeless_NoSubs'
]

export async function seedEditions(): Promise<void> {
  const exists = await prisma.videoEdition.findFirst()

  if (exists != null) return

  const existingVVEditions = await prisma.$queryRaw<
    Array<{ edition: string }>
  >`SELECT "edition" FROM "VideoVariant" GROUP BY "edition"`

  const existingSTEditions = await prisma.$queryRaw<
    Array<{ edition: string }>
  >`SELECT "edition" FROM "VideoSubtitle" GROUP BY "edition"`

  const data = uniq([
    ...EDITIONS,
    ...existingVVEditions.map(({ edition }) => edition),
    ...existingSTEditions.map(({ edition }) => edition)
  ]).map((edition) => ({
    id: edition
  }))
  await prisma.videoEdition.createMany({
    data
  })
}
