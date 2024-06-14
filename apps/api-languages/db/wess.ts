import isEmpty from 'lodash/isEmpty'
import toInteger from 'lodash/toInteger'
import fetch from 'node-fetch'

import {
  CountryName,
  Prisma,
  PrismaClient,
  Country as PrismaCountry,
  Language as PrismaLanguage
} from '.prisma/api-languages-client'

const prismaService = new PrismaClient()

interface Language extends Omit<PrismaLanguage, 'name'> {
  name: Prisma.LanguageNameUncheckedCreateInput[]
}

interface Country extends Omit<PrismaCountry, 'name'> {
  name: Prisma.CountryNameUncheckedCreateInput[]
  languageIds: string[]
}

// 156
interface WessCountry {
  COUNTRY_NAME: string
  COUNTRY_CODE: string
  AOA_NAME: string
  COUNTRY_POPULATION: number
  LANG_COUNT: number
  GEO_NO: number
}

// 154
interface WessLanguage {
  LAN_NO: number
  LAN_NAME: string
  LAN_ALTERNATE_LAN_NO: number
  ISO_CODE: string
  LAN_GEO_NO: number
  COUNTRY_NAME: string
  COUNTRY_CODE: string
  IS_DIALECT: number
}

// 155
interface WessCountryLanguage {
  COUNTRY: string
  GEO_NO: number
  LAN_NAME: string
  LAN_NO: number
  SPEAKERS: number
}

// 157
interface WessMission865 {
  VERSION_NO: number
  CURRENT_PHASE: string
}

async function getWessQuery<T>(id: string): Promise<T> {
  return await (
    await fetch(
      `https://www.mydigitalwork.space/QueryRunner/rest/QueryAPI/GetData?QueryId=${id}`,
      {
        headers: {
          token: process.env.WESS_API_TOKEN ?? '',
          Accept: 'application/json'
        }
      }
    )
  ).json()
}

function transformCountryLanguage(
  wessCountryLanguage: WessCountryLanguage
): void {
  if (countryLanguages[wessCountryLanguage.COUNTRY] == null)
    countryLanguages[wessCountryLanguage.COUNTRY] = []
  countryLanguages[wessCountryLanguage.COUNTRY].push(
    toInteger(wessCountryLanguage.LAN_NO).toString()
  )
}

async function transformCountry(wessCountry: WessCountry): Promise<void> {
  const country = {
    id: wessCountry.COUNTRY_CODE,
    aoa:
      isEmpty(wessCountry.AOA_NAME) || wessCountry.AOA_NAME === 'NAME'
        ? null
        : wessCountry.AOA_NAME,
    population: wessCountry.COUNTRY_POPULATION
  }
  await prismaService.country.upsert({
    where: { id: country.id },
    update: country,
    create: country
  })

  if (!isEmpty(wessCountry.COUNTRY_NAME)) {
    const name = country.name.find(({ languageId }) => languageId === '529')
    if (name == null)
      country.name.push({
        countryId: wessCountry.COUNTRY_CODE,
        languageId: '529',
        primary: true,
        value: wessCountry.COUNTRY_NAME
      })
    else name.value = wessCountry.COUNTRY_NAME
  }
  country.languageIds = countryLanguages[wessCountry.COUNTRY_NAME] ?? []
}

function transformLanguage(wessLanguage: WessLanguage): void {
  const languageId = toInteger(wessLanguage.LAN_ALTERNATE_LAN_NO).toString()
  let language = languages?.find(({ id }) => id === languageId)
  let exists = true // handled this way to avoid undefined
  if (language == null) {
    language = {
      id: languageId,
      name: []
    } as unknown as Language
    exists = false
  }

  if (
    !isEmpty(wessLanguage.LAN_NAME) &&
    toInteger(wessLanguage.LAN_NO) ===
      toInteger(wessLanguage.LAN_ALTERNATE_LAN_NO)
  ) {
    const name = language.name.find(({ languageId }) => languageId === '529')
    if (name == null)
      language.name.push({
        parentLanguageId: wessLanguage.LAN_NO.toString(),
        languageId: '529',
        primary: true,
        value: wessLanguage.LAN_NAME
      })
    else name.value = wessLanguage.LAN_NAME
  }
  language.iso3 = wessLanguage.ISO_CODE
  if (!exists) languages?.push(language)
}

function handleAlternateLanguages(wessLanguage: WessLanguage): void {
  const key = toInteger(wessLanguage.LAN_ALTERNATE_LAN_NO).toString()
  const language = languages?.find(({ id }) => key === id)
  if (language == null) return

  if (
    !isEmpty(wessLanguage.LAN_NAME) &&
    toInteger(wessLanguage.LAN_NO) !==
      toInteger(wessLanguage.LAN_ALTERNATE_LAN_NO) &&
    language.alternateLanguages?.find(
      (l) => l.languageId === '529' && l.value === wessLanguage.LAN_NAME
    ) == null &&
    language.name.find(
      ({ languageId, value }) =>
        languageId === '529' && value === wessLanguage.LAN_NAME
    ) == null
  ) {
    if (language.alternateLanguages == null) language.alternateLanguages = []
    language.alternateLanguages?.push({
      languageId: '529',
      primary: false,
      value: wessLanguage.LAN_NAME
    })
  }
}

function transformMission865(wessMission865: WessMission865): void {
  const key = toInteger(wessMission865.VERSION_NO).toString()
  const mission865 = mission865s?.find(({ id }) => id === key)
  if (mission865 == null) {
    mission865s?.push({
      id: key,
      currentPhase: wessMission865.CURRENT_PHASE
    })
  } else mission865.currentPhase = wessMission865.CURRENT_PHASE
}

let wessCountries: WessCountry[],
  wessLanguages: WessLanguage[],
  wessCountryLanguages: WessCountryLanguage[],
  // countries: PrismaCountry[] | undefined,
  // languages: PrismaLanguage[] | undefined,
  wessMission865s: WessMission865[]
// mission865s: Prisma.Mission865UncheckedCreateInput[] | undefined

const countryLanguages: Record<string, string[]> = {}

async function main(): Promise<void> {
  // get data from wess
  console.log('wess: countries')
  wessCountries = await getWessQuery('156')
  console.log('wess country count:', wessCountries.length)

  console.log('wess: languages')
  wessLanguages = await getWessQuery('154')
  console.log('wess language count:', wessLanguages.length)
  console.log(
    'unique language count:',
    wessLanguages.filter(
      (lang) => toInteger(lang.LAN_NO) === toInteger(lang.LAN_ALTERNATE_LAN_NO)
    ).length
  )

  console.log('wess: country languages')
  wessCountryLanguages = await getWessQuery('155')
  console.log('wess country language count:', wessCountryLanguages.length)

  console.log('wess: Mission 865')
  wessMission865s = await getWessQuery('157')

  // get data from database
  // console.log('prisma: countries')
  // countries = await prismaService.country.findMany()
  // console.log('database country count:', countries.length)

  // console.log('prisma: languages')
  // languages = await prismaService.language.findMany()
  // console.log('database language count:', languages.length)

  // console.log('prisma: mission 865')
  // mission865s = await prismaService.mission865.findMany()

  // transform data
  console.log('mapping languages to countries')
  for (const wessCountryLanguage of wessCountryLanguages) {
    transformCountryLanguage(wessCountryLanguage)
  }
  console.log('transforming countries')
  for (const country of wessCountries) {
    transformCountry(country)
  }

  console.log('transforming languages')
  for (const language of wessLanguages) {
    transformLanguage(language)
  }

  // handle alternates after all main languages are set
  console.log('handling alternate languages')
  for (const wessLanguage of wessLanguages) {
    handleAlternateLanguages(wessLanguage)
  }

  console.log('transforming mission 865')
  for (const wessMission865 of wessMission865s) {
    transformMission865(wessMission865)
  }

  console.log('country count', countries?.length)
  console.log('language count', languages?.length)

  // save data to database
  console.log('updating countries')
  for (const country of countries ?? []) {
    console.log('country:', country.id)
    prismaService.country.upsert({
      where: { id: country.id },
      update: country,
      create: country
    })
    for (const name of country.name) {
      prismaService.countryName.upsert({
        where: {
          languageId_countryId: {
            languageId: name.languageId,
            countryId: country.id
          }
        },
        update: name,
        create: {
          ...name,
          countryId: country.id
        }
      })
    }
  }
  await db
    .collection('countries')
    .saveAll(countries, { silent: true, overwriteMode: 'update' })

  console.log('updating languages')
  await db
    .collection('languages')
    .saveAll(languages, { silent: true, overwriteMode: 'update' })

  console.log('updating mission 865')
  await db
    .collection('mission865')
    .saveAll(mission865s, { silent: true, overwriteMode: 'update' })
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
