import { TeamInviteJob } from './prisma.types'

describe('TeamInviteJob Interface', () => {
  it('should have the correct structure with all required fields', () => {
    // This test validates that the interface has the expected structure
    const mockTeamInviteJob: TeamInviteJob = {
      team: {
        id: 'team-123',
        title: 'Test Team',
        createdAt: new Date(),
        updatedAt: new Date()
      } as any, // Using 'as any' for test purposes since we don't need full Team type
      email: 'test@example.com',
      sender: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        imageUrl: 'https://example.com/avatar.jpg'
      },
      senderId: 'user-123'
    }

    expect(mockTeamInviteJob).toHaveProperty('team')
    expect(mockTeamInviteJob).toHaveProperty('email')
    expect(mockTeamInviteJob).toHaveProperty('sender')
    expect(mockTeamInviteJob).toHaveProperty('senderId')

    expect(typeof mockTeamInviteJob.team).toBe('object')
    expect(typeof mockTeamInviteJob.email).toBe('string')
    expect(typeof mockTeamInviteJob.sender).toBe('object')
    expect(typeof mockTeamInviteJob.senderId).toBe('string')
  })

  it('should require senderId field to be a string', () => {
    // This test ensures TypeScript compilation would fail if senderId is missing
    const mockTeamInviteJob: TeamInviteJob = {
      team: {} as any,
      email: 'test@example.com',
      sender: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        imageUrl: 'https://example.com/avatar.jpg'
      },
      senderId: 'user-123'
    }

    expect(mockTeamInviteJob.senderId).toBe('user-123')
  })

  it('should maintain backward compatibility with existing fields', () => {
    const mockTeamInviteJob: TeamInviteJob = {
      team: {} as any,
      email: 'test@example.com',
      sender: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        imageUrl: 'https://example.com/avatar.jpg'
      },
      senderId: 'user-123'
    }

    // Verify existing fields are still present and functional
    expect(mockTeamInviteJob.team).toBeDefined()
    expect(mockTeamInviteJob.email).toBe('test@example.com')
    expect(mockTeamInviteJob.sender.firstName).toBe('John')
    expect(mockTeamInviteJob.sender.email).toBe('john@example.com')
  })
})
