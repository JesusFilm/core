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
          position: { x: -600, y: -46 },
          draggable: false
        },
        {
          id: 'Google',
          type: 'Referrer',
          data: referrers[2],
          position: { x: -600, y: 19 },
          draggable: false
        },
        {
          id: 'other sources',
          type: 'Referrer',
          data: {
            property: 'other sources',
            referrers: [referrers[1], referrers[3]]
          },
          position: { x: -600, y: 84 },
          draggable: false
        }
      ],
      edges: [
        {
          id: 'Facebook->SocialPreview',
          source: 'Facebook',
          target: 'SocialPreview',
          type: 'Referrer',
          updatable: false
        },
        {
          id: 'Google->SocialPreview',
          source: 'Google',
          target: 'SocialPreview',
          type: 'Referrer',
          updatable: false
        },
        {
          id: 'other sources->SocialPreview',
          source: 'other sources',
          target: 'SocialPreview',
          type: 'Referrer',
          updatable: false
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
          position: { x: -600, y: -46 },
          draggable: false
        },
        {
          id: 'Google',
          type: 'Referrer',
          data: referrers[2],
          position: { x: -600, y: 19 },
          draggable: false
        },
        {
          id: 'Direct / None',
          type: 'Referrer',
          data: referrers[1],
          position: { x: -600, y: 84 },
          draggable: false
        }
      ],
      edges: [
        {
          id: 'Facebook->SocialPreview',
          source: 'Facebook',
          target: 'SocialPreview',
          type: 'Referrer',
          updatable: false
        },
        {
          id: 'Google->SocialPreview',
          source: 'Google',
          target: 'SocialPreview',
          type: 'Referrer',
          updatable: false
        },
        {
          id: 'Direct / None->SocialPreview',
          source: 'Direct / None',
          target: 'SocialPreview',
          type: 'Referrer',
          updatable: false
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
          position: { x: -600, y: -9 },
          draggable: false
        },
        {
          id: 'Direct / None',
          type: 'Referrer',
          data: referrers[1],
          position: { x: -600, y: 47 },
          draggable: false
        }
      ],
      edges: [
        {
          id: 'Facebook->SocialPreview',
          source: 'Facebook',
          target: 'SocialPreview',
          type: 'Referrer',
          updatable: false
        },
        {
          id: 'Direct / None->SocialPreview',
          source: 'Direct / None',
          target: 'SocialPreview',
          type: 'Referrer',
          updatable: false
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
          position: { x: -600, y: 19 },
          draggable: false
        }
      ],
      edges: [
        {
          id: 'Direct / None->SocialPreview',
          source: 'Direct / None',
          target: 'SocialPreview',
          type: 'Referrer',
          updatable: false
        }
      ]
    })
  })
})
