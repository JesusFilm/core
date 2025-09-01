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
        id: 'user-123',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        imageUrl: 'https://example.com/avatar.jpg'
      }
    }

    expect(mockTeamInviteJob).toHaveProperty('team')
    expect(mockTeamInviteJob).toHaveProperty('email')
    expect(mockTeamInviteJob).toHaveProperty('sender')
    
    expect(typeof mockTeamInviteJob.team).toBe('object')
    expect(typeof mockTeamInviteJob.email).toBe('string')
    expect(typeof mockTeamInviteJob.sender).toBe('object')
    expect(typeof mockTeamInviteJob.sender.id).toBe('string')
  })

  it('should require sender id field to be a string', () => {
    // This test ensures TypeScript compilation would fail if sender.id is missing
    const mockTeamInviteJob: TeamInviteJob = {
      team: {} as any,
      email: 'test@example.com',
      sender: {
        id: 'user-123',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        imageUrl: 'https://example.com/avatar.jpg'
      }
    }

    expect(mockTeamInviteJob.sender.id).toBe('user-123')
  })

  it('should maintain backward compatibility with existing fields', () => {
    const mockTeamInviteJob: TeamInviteJob = {
      team: {} as any,
      email: 'test@example.com',
      sender: {
        id: 'user-123',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        imageUrl: 'https://example.com/avatar.jpg'
      }
    }

    // Verify existing fields are still present and functional
    expect(mockTeamInviteJob.team).toBeDefined()
    expect(mockTeamInviteJob.email).toBe('test@example.com')
    expect(mockTeamInviteJob.sender.firstName).toBe('John')
    expect(mockTeamInviteJob.sender.email).toBe('john@example.com')
    expect(mockTeamInviteJob.sender.id).toBe('user-123')
  })
})
