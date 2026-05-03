export interface MockTemplate {
  id: string
  title: string
  description: string
  language: string
  languageCode: string
  imageUrl: string
}

export const MOCK_TEMPLATES: MockTemplate[] = [
  // English (7)
  {
    id: 'tmpl-1',
    title: 'Finding Hope in Difficult Times',
    description:
      'A journey exploring hope and resilience through life\u2019s challenges.',
    language: 'English',
    languageCode: 'EN',
    imageUrl:
      'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=300&fit=crop'
  },
  {
    id: 'tmpl-2',
    title: 'The Easter Story',
    description: 'Experience the powerful story of Easter and its meaning.',
    language: 'English',
    languageCode: 'EN',
    imageUrl:
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop'
  },
  {
    id: 'tmpl-3',
    title: 'Who Is Jesus?',
    description: 'Discover the life and teachings of Jesus Christ.',
    language: 'English',
    languageCode: 'EN',
    imageUrl:
      'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=400&h=300&fit=crop'
  },
  {
    id: 'tmpl-4',
    title: 'Life Questions',
    description: 'Explore the big questions about purpose and meaning.',
    language: 'English',
    languageCode: 'EN',
    imageUrl:
      'https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=400&h=300&fit=crop'
  },
  {
    id: 'tmpl-5',
    title: 'Dealing With Anxiety',
    description: 'Practical guidance for finding peace in anxious times.',
    language: 'English',
    languageCode: 'EN',
    imageUrl:
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop'
  },
  {
    id: 'tmpl-6',
    title: 'Prayer Guide',
    description: 'Learn how to develop a meaningful prayer life.',
    language: 'English',
    languageCode: 'EN',
    imageUrl:
      'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=400&h=300&fit=crop'
  },
  {
    id: 'tmpl-7',
    title: 'Marriage Foundations',
    description: 'Build a strong foundation for a lasting relationship.',
    language: 'English',
    languageCode: 'EN',
    imageUrl:
      'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=400&h=300&fit=crop'
  },
  // Russian (7)
  {
    id: 'tmpl-8',
    title: '\u041D\u0430\u0434\u0435\u0436\u0434\u0430 \u0432 \u0442\u0440\u0443\u0434\u043D\u044B\u0435 \u0432\u0440\u0435\u043C\u0435\u043D\u0430',
    description:
      '\u041F\u0443\u0442\u0435\u0448\u0435\u0441\u0442\u0432\u0438\u0435, \u0438\u0441\u0441\u043B\u0435\u0434\u0443\u044E\u0449\u0435\u0435 \u043D\u0430\u0434\u0435\u0436\u0434\u0443 \u0438 \u0443\u0441\u0442\u043E\u0439\u0447\u0438\u0432\u043E\u0441\u0442\u044C \u0432 \u0436\u0438\u0437\u043D\u0438.',
    language: 'Russian',
    languageCode: 'RU',
    imageUrl:
      'https://images.unsplash.com/photo-1534088568595-a066f410bcda?w=400&h=300&fit=crop'
  },
  {
    id: 'tmpl-9',
    title: '\u0418\u0441\u0442\u043E\u0440\u0438\u044F \u041F\u0430\u0441\u0445\u0438',
    description:
      '\u041F\u043E\u0437\u043D\u0430\u0439\u0442\u0435 \u0441\u0438\u043B\u0443 \u043F\u0430\u0441\u0445\u0430\u043B\u044C\u043D\u043E\u0439 \u0438\u0441\u0442\u043E\u0440\u0438\u0438.',
    language: 'Russian',
    languageCode: 'RU',
    imageUrl:
      'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=400&h=300&fit=crop'
  },
  {
    id: 'tmpl-10',
    title: '\u041A\u0442\u043E \u0442\u0430\u043A\u043E\u0439 \u0418\u0438\u0441\u0443\u0441?',
    description:
      '\u041E\u0442\u043A\u0440\u043E\u0439\u0442\u0435 \u0434\u043B\u044F \u0441\u0435\u0431\u044F \u0436\u0438\u0437\u043D\u044C \u0438 \u0443\u0447\u0435\u043D\u0438\u0435 \u0418\u0438\u0441\u0443\u0441\u0430 \u0425\u0440\u0438\u0441\u0442\u0430.',
    language: 'Russian',
    languageCode: 'RU',
    imageUrl:
      'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=400&h=300&fit=crop'
  },
  {
    id: 'tmpl-11',
    title: '\u0412\u043E\u043F\u0440\u043E\u0441\u044B \u0436\u0438\u0437\u043D\u0438',
    description:
      '\u0418\u0441\u0441\u043B\u0435\u0434\u0443\u0439\u0442\u0435 \u0433\u043B\u0430\u0432\u043D\u044B\u0435 \u0432\u043E\u043F\u0440\u043E\u0441\u044B \u043E \u0441\u043C\u044B\u0441\u043B\u0435 \u0436\u0438\u0437\u043D\u0438.',
    language: 'Russian',
    languageCode: 'RU',
    imageUrl:
      'https://images.unsplash.com/photo-1439853949127-fa647821eba0?w=400&h=300&fit=crop'
  },
  {
    id: 'tmpl-12',
    title: '\u041F\u0440\u0435\u043E\u0434\u043E\u043B\u0435\u043D\u0438\u0435 \u0441\u0442\u0440\u0430\u0445\u0430',
    description:
      '\u041F\u0440\u0430\u043A\u0442\u0438\u0447\u0435\u0441\u043A\u043E\u0435 \u0440\u0443\u043A\u043E\u0432\u043E\u0434\u0441\u0442\u0432\u043E \u043F\u043E \u043F\u0440\u0435\u043E\u0434\u043E\u043B\u0435\u043D\u0438\u044E \u0441\u0442\u0440\u0430\u0445\u0430.',
    language: 'Russian',
    languageCode: 'RU',
    imageUrl:
      'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=400&h=300&fit=crop'
  },
  {
    id: 'tmpl-13',
    title: '\u0420\u0443\u043A\u043E\u0432\u043E\u0434\u0441\u0442\u0432\u043E \u043F\u043E \u043C\u043E\u043B\u0438\u0442\u0432\u0435',
    description:
      '\u0423\u0437\u043D\u0430\u0439\u0442\u0435, \u043A\u0430\u043A \u0440\u0430\u0437\u0432\u0438\u0442\u044C \u043C\u043E\u043B\u0438\u0442\u0432\u0435\u043D\u043D\u0443\u044E \u0436\u0438\u0437\u043D\u044C.',
    language: 'Russian',
    languageCode: 'RU',
    imageUrl:
      'https://images.unsplash.com/photo-1490750967868-88aa4f44baee?w=400&h=300&fit=crop'
  },
  {
    id: 'tmpl-14',
    title: '\u041E\u0441\u043D\u043E\u0432\u044B \u0441\u0435\u043C\u044C\u0438',
    description:
      '\u041F\u043E\u0441\u0442\u0440\u043E\u0439\u0442\u0435 \u043A\u0440\u0435\u043F\u043A\u0438\u0439 \u0444\u0443\u043D\u0434\u0430\u043C\u0435\u043D\u0442 \u0434\u043B\u044F \u0441\u0435\u043C\u0435\u0439\u043D\u044B\u0445 \u043E\u0442\u043D\u043E\u0448\u0435\u043D\u0438\u0439.',
    language: 'Russian',
    languageCode: 'RU',
    imageUrl:
      'https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=400&h=300&fit=crop'
  },
  // Spanish (6)
  {
    id: 'tmpl-15',
    title: 'Encontrando Esperanza',
    description: 'Un viaje explorando la esperanza y la resiliencia.',
    language: 'Spanish',
    languageCode: 'ES',
    imageUrl:
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=300&fit=crop'
  },
  {
    id: 'tmpl-16',
    title: 'La Historia de Pascua',
    description: 'Experimenta la poderosa historia de la Pascua.',
    language: 'Spanish',
    languageCode: 'ES',
    imageUrl:
      'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop'
  },
  {
    id: 'tmpl-17',
    title: '\u00BFQui\u00E9n es Jes\u00FAs?',
    description:
      'Descubre la vida y las ense\u00F1anzas de Jesucristo.',
    language: 'Spanish',
    languageCode: 'ES',
    imageUrl:
      'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=400&h=300&fit=crop'
  },
  {
    id: 'tmpl-18',
    title: 'Preguntas de la Vida',
    description: 'Explora las grandes preguntas sobre el prop\u00F3sito.',
    language: 'Spanish',
    languageCode: 'ES',
    imageUrl:
      'https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=400&h=300&fit=crop'
  },
  {
    id: 'tmpl-19',
    title: 'Manejo de la Ansiedad',
    description:
      'Gu\u00EDa pr\u00E1ctica para encontrar paz en tiempos dif\u00EDciles.',
    language: 'Spanish',
    languageCode: 'ES',
    imageUrl:
      'https://images.unsplash.com/photo-1504567961542-e24d9439a724?w=400&h=300&fit=crop'
  },
  {
    id: 'tmpl-20',
    title: 'Gu\u00EDa de Oraci\u00F3n',
    description:
      'Aprende a desarrollar una vida de oraci\u00F3n significativa.',
    language: 'Spanish',
    languageCode: 'ES',
    imageUrl:
      'https://images.unsplash.com/photo-1499002238440-d264edd596ec?w=400&h=300&fit=crop'
  }
]
