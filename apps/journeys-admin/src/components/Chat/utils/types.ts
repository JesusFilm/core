export enum Platform {
  facebook = 'facebook',
  whatsApp = 'whatsApp',
  telegram = 'telegram',
  instagram = 'instagram',
  line = 'line',
  skype = 'skype',
  snapchat = 'snapchat',
  tikTok = 'tikTok',
  viber = 'viber',
  vk = 'vk'
}

export interface ChatButton {
  id: string
  chatLink: string
  chatIcon: Platform
}
