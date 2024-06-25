import { transformReferrers } from './transformReferrers'

describe('transformReferrers', () => {
  it('should handle more than 3 referrers', () => {
    const referrers = [
      {
        __typename: 'PlausibleStatsResponse' as const,
        property: 'Facebook',
        visitors: 10
      },
      {
        __typename: 'PlausibleStatsResponse' as const,
        property: 'Direct / None',
        visitors: 2
      },
      {
        __typename: 'PlausibleStatsResponse' as const,
        property: 'Google',
        visitors: 5
      },
      {
        __typename: 'PlausibleStatsResponse' as const,
        property: 'Instagram',
        visitors: 1
      }
    ]

    expect(transformReferrers(referrers)).toEqual({
      nodes: [
        {
          id: 'Facebook',
          type: 'Referrer',
          data: referrers[0],
          position: { x: -600, y: -18 },
          draggable: false
        },
        {
          id: 'Google',
          type: 'Referrer',
          data: referrers[2],
          position: { x: -600, y: 24 },
          draggable: false
        },
        {
          id: 'Other sources',
          type: 'Referrer',
          data: {
            property: 'Other sources',
            referrers: [referrers[1], referrers[3]]
          },
          position: { x: -600, y: 66 },
          draggable: false
        }
      ],
      edges: [
        {
          id: 'Facebook->SocialPreview',
          source: 'Facebook',
          target: 'SocialPreview',
          type: 'Referrer'
        },
        {
          id: 'Google->SocialPreview',
          source: 'Google',
          target: 'SocialPreview',
          type: 'Referrer'
        },
        {
          id: 'Other sources->SocialPreview',
          source: 'Other sources',
          target: 'SocialPreview',
          type: 'Referrer'
        }
      ]
    })
  })

  it('should handle 3 referrers', () => {
    const referrers = [
      {
        __typename: 'PlausibleStatsResponse' as const,
        property: 'Facebook',
        visitors: 10
      },
      {
        __typename: 'PlausibleStatsResponse' as const,
        property: 'Direct / None',
        visitors: 2
      },
      {
        __typename: 'PlausibleStatsResponse' as const,
        property: 'Google',
        visitors: 5
      }
    ]

    expect(transformReferrers(referrers)).toEqual({
      nodes: [
        {
          id: 'Facebook',
          type: 'Referrer',
          data: referrers[0],
          position: { x: -600, y: -18 },
          draggable: false
        },
        {
          id: 'Google',
          type: 'Referrer',
          data: referrers[2],
          position: { x: -600, y: 24 },
          draggable: false
        },
        {
          id: 'Direct / None',
          type: 'Referrer',
          data: referrers[1],
          position: { x: -600, y: 66 },
          draggable: false
        }
      ],
      edges: [
        {
          id: 'Facebook->SocialPreview',
          source: 'Facebook',
          target: 'SocialPreview',
          type: 'Referrer'
        },
        {
          id: 'Google->SocialPreview',
          source: 'Google',
          target: 'SocialPreview',
          type: 'Referrer'
        },
        {
          id: 'Direct / None->SocialPreview',
          source: 'Direct / None',
          target: 'SocialPreview',
          type: 'Referrer'
        }
      ]
    })
  })

  it('should handle 2 referrers', () => {
    const referrers = [
      {
        __typename: 'PlausibleStatsResponse' as const,
        property: 'Facebook',
        visitors: 10
      },
      {
        __typename: 'PlausibleStatsResponse' as const,
        property: 'Direct / None',
        visitors: 2
      }
    ]

    expect(transformReferrers(referrers)).toEqual({
      nodes: [
        {
          id: 'Facebook',
          type: 'Referrer',
          data: referrers[0],
          position: { x: -600, y: -4 },
          draggable: false
        },
        {
          id: 'Direct / None',
          type: 'Referrer',
          data: referrers[1],
          position: { x: -600, y: 52 },
          draggable: false
        }
      ],
      edges: [
        {
          id: 'Facebook->SocialPreview',
          source: 'Facebook',
          target: 'SocialPreview',
          type: 'Referrer'
        },
        {
          id: 'Direct / None->SocialPreview',
          source: 'Direct / None',
          target: 'SocialPreview',
          type: 'Referrer'
        }
      ]
    })
  })

  it('should handle one referrer', () => {
    const referrers = [
      {
        __typename: 'PlausibleStatsResponse' as const,
        property: 'Direct / None',
        visitors: 2
      }
    ]

    expect(transformReferrers(referrers)).toEqual({
      nodes: [
        {
          id: 'Direct / None',
          type: 'Referrer',
          data: referrers[0],
          position: { x: -600, y: 24 },
          draggable: false
        }
      ],
      edges: [
        {
          id: 'Direct / None->SocialPreview',
          source: 'Direct / None',
          target: 'SocialPreview',
          type: 'Referrer'
        }
      ]
    })
  })
})
