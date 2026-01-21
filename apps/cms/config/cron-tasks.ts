const cronTasks = {
  'media-import': {
    task: async () => {
      strapi.log.info('Running scheduled media import...')
    },
    options: {
      pattern: '0 * * * *'
    }
  }
}

export default cronTasks
