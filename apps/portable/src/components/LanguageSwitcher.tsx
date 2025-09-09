import React from 'react'
import { useTranslation } from 'react-i18next'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'

interface LanguageSwitcherProps {
  style?: any
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  style
}) => {
  const { i18n, t } = useTranslation('common')

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' }
  ]

  const handleLanguageChange = (languageCode: string) => {
    i18n.changeLanguage(languageCode)
  }

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.title}>{t('settings.language')}</Text>
      <View style={styles.languageList}>
        {languages.map((lang) => (
          <TouchableOpacity
            key={lang.code}
            onPress={() => handleLanguageChange(lang.code)}
            style={[
              styles.languageButton,
              i18n.language === lang.code && styles.activeLanguageButton
            ]}
            accessibilityLabel={`${lang.name} language`}
            accessibilityRole="button"
            accessibilityState={{ selected: i18n.language === lang.code }}
          >
            <Text style={styles.flag}>{lang.flag}</Text>
            <Text
              style={[
                styles.languageText,
                i18n.language === lang.code && styles.activeLanguageText
              ]}
            >
              {lang.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 16
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#1f2937'
  },
  languageList: {
    gap: 8
  },
  languageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb'
  },
  activeLanguageButton: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6'
  },
  flag: {
    fontSize: 20,
    marginRight: 12
  },
  languageText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500'
  },
  activeLanguageText: {
    color: '#ffffff'
  }
})
