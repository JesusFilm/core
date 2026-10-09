export const cache = {
  /* https://www.apollographql.com/docs/react/data/fragments/#defining-possibletypes-manually
   * The client needs to understand the polymorphic relationship between the
     interfaces and the types that implement it. To inform the client about
     these relationships, we need to pass a possibleTypes option when
     initializing InMemoryCache.
   */
  possibleTypes: {
    User: ['AuthenticatedUser', 'AnonymousUser'],
    BaseError: [
      'Error',
      'ZodError',
      'NotFoundError',
      'NotUniqueError',
      'ForeignKeyConstraintError'
    ]
  },
  typePolicies: {
    ShortLink: {
      fields: {
        tags: { merge: false },
        campaigns: { merge: false },
        destinationHistory: { merge: false }
      }
    },
    ShortLinkDomain: {
      fields: {
        services: { merge: false },
        reservedPaths: { merge: false }
      }
    },
    ShortLinkCampaign: {
      fields: {
        tags: { merge: false },
        shortLinks: { merge: false }
      }
    }
  }
}
