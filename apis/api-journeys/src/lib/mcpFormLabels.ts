import amharicLabels from '@core/locales/am-ET/apps-journeys-admin.json'
import arabicLabels from '@core/locales/ar-SA/apps-journeys-admin.json'
import bengaliLabels from '@core/locales/bn-BD/apps-journeys-admin.json'
import germanLabels from '@core/locales/de-DE/apps-journeys-admin.json'
import englishLabels from '@core/locales/en/apps-journeys-admin.json'
import spanishLabels from '@core/locales/es-ES/apps-journeys-admin.json'
import frenchLabels from '@core/locales/fr-FR/apps-journeys-admin.json'
import hindiLabels from '@core/locales/hi-IN/apps-journeys-admin.json'
import indonesianLabels from '@core/locales/id-ID/apps-journeys-admin.json'
import japaneseLabels from '@core/locales/ja-JP/apps-journeys-admin.json'
import koreanLabels from '@core/locales/ko-KR/apps-journeys-admin.json'
import mongolianLabels from '@core/locales/mn-MN/apps-journeys-admin.json'
import malayLabels from '@core/locales/ms-MY/apps-journeys-admin.json'
import burmeseLabels from '@core/locales/my-MM/apps-journeys-admin.json'
import nepaliLabels from '@core/locales/ne-NP/apps-journeys-admin.json'
import portugueseLabels from '@core/locales/pt-BR/apps-journeys-admin.json'
import russianLabels from '@core/locales/ru-RU/apps-journeys-admin.json'
import thaiLabels from '@core/locales/th-TH/apps-journeys-admin.json'
import filipinoLabels from '@core/locales/tl-PH/apps-journeys-admin.json'
import turkishLabels from '@core/locales/tr-TR/apps-journeys-admin.json'
import urduLabels from '@core/locales/ur-PK/apps-journeys-admin.json'
import vietnameseLabels from '@core/locales/vi-VN/apps-journeys-admin.json'
import simplifiedChineseLabels from '@core/locales/zh-Hans-CN/apps-journeys-admin.json'
import traditionalChineseLabels from '@core/locales/zh-Hant-TW/apps-journeys-admin.json'

const labels = {
  'am-ET': amharicLabels,
  'ar-SA': arabicLabels,
  'bn-BD': bengaliLabels,
  'de-DE': germanLabels,
  en: englishLabels,
  'es-ES': spanishLabels,
  'fr-FR': frenchLabels,
  'hi-IN': hindiLabels,
  'id-ID': indonesianLabels,
  'ja-JP': japaneseLabels,
  'ko-KR': koreanLabels,
  'mn-MN': mongolianLabels,
  'ms-MY': malayLabels,
  'my-MM': burmeseLabels,
  'ne-NP': nepaliLabels,
  'pt-BR': portugueseLabels,
  'ru-RU': russianLabels,
  'th-TH': thaiLabels,
  'tl-PH': filipinoLabels,
  'tr-TR': turkishLabels,
  'ur-PK': urduLabels,
  'vi-VN': vietnameseLabels,
  'zh-Hans-CN': simplifiedChineseLabels,
  'zh-Hant-TW': traditionalChineseLabels
}

export function formLabel(
  key: 'Email' | 'Name' | 'Phone' | 'Label' | 'Submit',
  locale: keyof typeof labels = 'en'
): string {
  return labels[locale][key] || labels.en[key] || key
}
