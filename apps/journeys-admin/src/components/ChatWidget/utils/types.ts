export enum Platform {
  default = 'default',
  website = 'website',
  mail = 'mail',
  facebook = 'facebook',
  whatsApp = 'whatsApp',
  telegram = 'telegram',
  line = 'line',
  viber = 'viber',
  vk = 'vk',
  weChat = 'weChat',
  snapchat = 'snapchat',
  instagram = 'instagram'
}

export interface ChatButton {
  id: string
  chatLink: string
  chatIcon: Platform
}
