import { UserJourneyRole, UserTeamRole } from '@core/prisma/journeys/client'

import { canManageQrCode } from './qrCode.acl'

describe('canManageQrCode', () => {
  const user = { id: 'userId' } as Parameters<typeof canManageQrCode>[1]

  const journeyOwner = {
    template: false,
    userJourneys: [{ userId: 'userId', role: UserJourneyRole.owner }]
  }
  const teamMember = {
    userTeams: [{ userId: 'userId', role: UserTeamRole.member }]
  }

  it('lets a team member manage a journey QR code', () => {
    expect(canManageQrCode({ team: teamMember }, user)).toBe(true)
  })

  it('lets a journey owner manage a journey QR code', () => {
    expect(canManageQrCode({ journey: journeyOwner }, user)).toBe(true)
  })

  describe('Campaign QR Code', () => {
    const campaignRegionLanguages = [{ id: 'regionLanguageId' }]

    it("does not let a member of the campaign's team manage it", () => {
      expect(
        canManageQrCode(
          { team: teamMember, journey: journeyOwner, campaignRegionLanguages },
          user
        )
      ).toBe(false)
    })

    it("does not let a manager of the campaign's team manage it", () => {
      expect(
        canManageQrCode(
          {
            team: {
              userTeams: [{ userId: 'userId', role: UserTeamRole.manager }]
            },
            campaignRegionLanguages
          },
          user
        )
      ).toBe(false)
    })

    it("does not let the linked journey's owner or editor manage it", () => {
      expect(
        canManageQrCode(
          {
            team: { userTeams: [] },
            journey: journeyOwner,
            campaignRegionLanguages
          },
          user
        )
      ).toBe(false)
      expect(
        canManageQrCode(
          {
            team: { userTeams: [] },
            journey: {
              userJourneys: [{ userId: 'userId', role: UserJourneyRole.editor }]
            },
            campaignRegionLanguages
          },
          user
        )
      ).toBe(false)
    })

    it('does not let a publisher manage it through a template journey', () => {
      expect(
        canManageQrCode(
          {
            team: { userTeams: [] },
            journey: { template: true },
            campaignRegionLanguages
          },
          { ...user, roles: ['publisher'] }
        )
      ).toBe(false)
    })
  })
})
