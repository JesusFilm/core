import { Test, TestingModule } from '@nestjs/testing'
import { GraphQLError } from 'graphql'
import clone from 'lodash/clone'
import fetch, { Response } from 'node-fetch'

import { CustomDomain } from '@core/prisma/journeys/client'

import {
  CustomDomainService,
  VercelConfigDomainResponse,
  VercelCreateDomainError,
  VercelCreateDomainResponse,
  VercelDomainResponse,
  VercelVerifyDomainError,
  VercelVerifyDomainResponse
} from './customDomain.service'

jest.mock('node-fetch', () => {
  const originalModule = jest.requireActual('node-fetch')
  return {
    __esModule: true,
    ...originalModule,
    default: jest.fn()
  }
})
const mockFetch = fetch as jest.MockedFunction<typeof fetch>

describe('customDomainService', () => {
  let service: CustomDomainService

  const customDomain = {
    name: 'example.com'
  } as unknown as CustomDomain

  class NoErrorThrownError extends Error {}

  const getError = async <TError>(call: () => unknown): Promise<TError> => {
    try {
      await call()

      throw new NoErrorThrownError()
    } catch (error: unknown) {
      return error as TError
    }
  }

  const originalEnv = clone(process.env)

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CustomDomainService]
    }).compile()

    service = module.get<CustomDomainService>(CustomDomainService)
    process.env = originalEnv
  })

  afterEach(() => {
    process.env = originalEnv
    jest.clearAllMocks()
  })

  describe('createVercelDomain', () => {
    it('should return dummy when no environment variables', async () => {
      expect(await service.createVercelDomain('name.com')).toEqual({
        name: 'name.com',
        apexName: 'name.com'
      })
    })

    describe('when environment variables set', () => {
      beforeEach(() => {
        process.env = {
          ...originalEnv,
          VERCEL_TOKEN: 'token',
          VERCEL_TEAM_ID: 'teamId',
          VERCEL_JOURNEYS_PROJECT_ID: 'journeysProjectId'
        }
      })

      it('should create a vercel domain', async () => {
        const data: VercelCreateDomainResponse = {
          name: 'name.com',
          apexName: 'name.com'
        }
        mockFetch.mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => await Promise.resolve(data)
        } as unknown as Response)
        expect(await service.createVercelDomain('name.com')).toEqual(data)
        expect(mockFetch).toHaveBeenCalledWith(
          'https://api.vercel.com/v10/projects/journeysProjectId/domains?teamId=teamId',
          {
            body: JSON.stringify({
              name: 'name.com'
            }),
            headers: { Authorization: 'Bearer token' },
            method: 'POST'
          }
        )
      })

      it('should throw an error when 400 invalid_domain', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () =>
            await Promise.resolve({
              error: {
                code: 'invalid_domain',
                domain: 'invaliddomain',
                message: 'Cannot add invalid domain name "invaliddomain".'
              }
            }),
          status: 400
        } as unknown as Response)

        const error = await getError<GraphQLError>(
          async () => await service.createVercelDomain('invaliddomain')
        )
        expect(error).not.toBeInstanceOf(NoErrorThrownError)
        expect(error.message).toBe(
          'Cannot add invalid domain name "invaliddomain".'
        )
        expect(error).toHaveProperty('extensions', {
          code: 'BAD_USER_INPUT',
          vercelCode: 'invalid_domain'
        })
      })

      it('should throw an error when 409 domain_already_in_use', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () =>
            await Promise.resolve({
              error: {
                code: 'domain_already_in_use',
                projectId: 'journeysProjectId',
                message:
                  "Cannot add name.com since it's already in use by your account."
              }
            }),
          status: 409
        } as unknown as Response)

        const error = await getError<GraphQLError>(
          async () => await service.createVercelDomain('name.com')
        )
        expect(error).not.toBeInstanceOf(NoErrorThrownError)
        expect(error.message).toBe(
          "Cannot add name.com since it's already in use by your account."
        )
        expect(error).toHaveProperty('extensions', {
          code: 'CONFLICT',
          vercelCode: 'domain_already_in_use'
        })
      })

      it('should throw an error when status not handled', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () =>
            await Promise.resolve({
              error: {
                code: 'unauthorized',
                message: 'You are not authorized.'
              }
            }),
          status: 401
        } as unknown as Response)

        const error = await getError<GraphQLError>(
          async () => await service.createVercelDomain('name.com')
        )
        expect(error).not.toBeInstanceOf(NoErrorThrownError)
        expect(error.message).toBe('vercel response not handled')
        expect(error).toHaveProperty('extensions', {
          code: 'INTERNAL_SERVER_ERROR'
        })
      })
    })
  })

  describe('deleteVercelDomain', () => {
    it('should return dummy when no environment variables', async () => {
      expect(await service.deleteVercelDomain(customDomain)).toBe(true)
    })

    describe('when environment variables set', () => {
      beforeEach(() => {
        process.env = {
          ...originalEnv,
          VERCEL_TOKEN: 'token',
          VERCEL_TEAM_ID: 'teamId',
          VERCEL_JOURNEYS_PROJECT_ID: 'journeysProjectId'
        }
      })

      it('should return true', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => await Promise.resolve({})
        } as unknown as Response)

        expect(await service.deleteVercelDomain(customDomain)).toBe(true)
        expect(mockFetch).toHaveBeenCalledWith(
          'https://api.vercel.com/v9/projects/journeysProjectId/domains/example.com?teamId=teamId',
          {
            headers: { Authorization: 'Bearer token' },
            method: 'DELETE'
          }
        )
      })

      it('should return true when 404 not_found', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () =>
            await Promise.resolve({
              error: {
                code: 'not_found',
                message:
                  'The domain "name.com" is not assigned to "project-name".'
              }
            }),
          status: 404
        } as unknown as Response)

        expect(await service.deleteVercelDomain(customDomain)).toBe(true)
        expect(mockFetch).toHaveBeenCalledWith(
          'https://api.vercel.com/v9/projects/journeysProjectId/domains/example.com?teamId=teamId',
          {
            headers: { Authorization: 'Bearer token' },
            method: 'DELETE'
          }
        )
      })

      it('should throw an error when status not handled', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => await Promise.resolve({}),
          status: 401
        } as unknown as Response)

        const error = await getError<GraphQLError>(
          async () => await service.deleteVercelDomain(customDomain)
        )
        expect(error).not.toBeInstanceOf(NoErrorThrownError)
        expect(error.message).toBe('vercel response not handled')
        expect(error).toHaveProperty('extensions', {
          code: 'INTERNAL_SERVER_ERROR'
        })
      })
    })
  })

  describe('checkVercelDomain', () => {
    function mockCheckVercelDomainFetch(
      name: string,
      configData: VercelConfigDomainResponse,
      domainData: VercelCreateDomainResponse | VercelCreateDomainError,
      verifyData: VercelVerifyDomainResponse | VercelVerifyDomainError | null
    ) {
      return async (url: string) => {
        switch (url) {
          case `https://api.vercel.com/v6/domains/${name}/config?teamId=teamId`:
            return await Promise.resolve({
              ok: true,
              status: 200,
              json: async () => await Promise.resolve(configData)
            } as unknown as Response)
          case `https://api.vercel.com/v9/projects/journeysProjectId/domains/${name}?teamId=teamId`:
            return await Promise.resolve({
              ok: true,
              status: 200,
              json: async () => await Promise.resolve(domainData)
            } as unknown as Response)
          case `https://api.vercel.com/v9/projects/journeysProjectId/domains/${name}/verify?teamId=teamId`:
            return await Promise.resolve({
              ok: true,
              status: verifyData != null && 'error' in verifyData ? 400 : 200,
              json: async () => await Promise.resolve(verifyData)
            } as unknown as Response)
          default:
            return await Promise.resolve({
              ok: true,
              status: 404,
              json: async () =>
                await Promise.resolve({ error: { code: 'not_found' } })
            } as unknown as Response)
        }
      }
    }

    it('should return dummy when no environment variables', async () => {
      expect(await service.checkVercelDomain(customDomain)).toEqual({
        configured: true,
        verified: true
      })
    })

    describe('when environment variables set', () => {
      beforeEach(() => {
        process.env = {
          ...originalEnv,
          VERCEL_TOKEN: 'token',
          VERCEL_TEAM_ID: 'teamId',
          VERCEL_JOURNEYS_PROJECT_ID: 'journeysProjectId'
        }
      })

      describe('unverified because existing_project_domain', () => {
        const domain = 'example.com'
        const configData: VercelConfigDomainResponse = {
          configuredBy: 'http',
          nameservers: ['igor.ns.cloudflare.com', 'ainsley.ns.cloudflare.com'],
          serviceType: 'external',
          cnames: [],
          aValues: ['172.67.132.66', '104.21.12.185'],
          conflicts: [],
          acceptedChallenges: ['http-01'],
          misconfigured: false
        }
        const domainData: VercelDomainResponse = {
          name: 'example.com',
          apexName: 'example.com',
          projectId: 'journeysProjectId',
          redirect: null,
          redirectStatusCode: null,
          gitBranch: null,
          updatedAt: 1712052568202,
          createdAt: 1712052568202,
          verified: false,
          verification: [
            {
              type: 'TXT',
              domain: '_vercel.example.com',
              value: 'vc-domain-verify=example.com,560d189717dfcd2b1ae0',
              reason: 'pending_domain_verification'
            }
          ]
        }
        const verifyData: VercelVerifyDomainError = {
          error: {
            code: 'existing_project_domain',
            message:
              'Domain example.com was added to a different project. Please complete verification to add it to this project instead.'
          }
        }

        beforeEach(() => {
          mockFetch.mockImplementation(
            mockCheckVercelDomainFetch(
              domain,
              configData,
              domainData,
              verifyData
            )
          )
        })

        it('should return configured and unverified', async () => {
          expect(await service.checkVercelDomain(customDomain)).toEqual({
            configured: true,
            verified: false,
            verification: [
              {
                type: 'TXT',
                domain: '_vercel.example.com',
                value: 'vc-domain-verify=example.com,560d189717dfcd2b1ae0',
                reason: 'pending_domain_verification'
              }
            ],
            verificationResponse: {
              code: 'existing_project_domain',
              message:
                'Domain example.com was added to a different project. Please complete verification to add it to this project instead.'
            }
          })
        })
      })

      describe('unverified because missing_txt_record', () => {
        const domain = 'www.example.com'
        const configData: VercelConfigDomainResponse = {
          configuredBy: null,
          nameservers: [
            'ns2.mytrafficmanagement.com',
            'ns1.mytrafficmanagement.com'
          ],
          serviceType: 'external',
          cnames: [],
          aValues: [
            '45.56.79.23',
            '72.14.185.43',
            '72.14.178.174',
            '45.33.23.183',
            '45.33.30.197',
            '45.33.18.44',
            '45.33.2.79',
            '45.79.19.196',
            '96.126.123.244',
            '198.58.118.167',
            '173.255.194.134',
            '45.33.20.235'
          ],
          conflicts: [],
          acceptedChallenges: [],
          misconfigured: true
        }
        const domainData: VercelDomainResponse = {
          name: 'www.example.com',
          apexName: 'example.com',
          projectId: 'journeysProjectId',
          redirect: null,
          redirectStatusCode: null,
          gitBranch: null,
          updatedAt: 1712008427374,
          createdAt: 1712008427374,
          verified: false,
          verification: [
            {
              type: 'TXT',
              domain: '_vercel.example.com',
              value: 'vc-domain-verify=www.example.com,e886cd36c2ae9464e6b5',
              reason: 'pending_domain_verification'
            }
          ]
        }
        const verifyData: VercelVerifyDomainError = {
          error: {
            code: 'missing_txt_record',
            message:
              'Domain _vercel.example.com is missing required TXT Record "vc-domain-verify=www.example.com,e886cd36c2ae9464e6b5"'
          }
        }

        beforeEach(() => {
          mockFetch.mockImplementation(
            mockCheckVercelDomainFetch(
              domain,
              configData,
              domainData,
              verifyData
            )
          )
        })

        it('should return misconfigured and unverified', async () => {
          expect(
            await service.checkVercelDomain({
              name: domain
            } as unknown as CustomDomain)
          ).toEqual({
            configured: false,
            verified: false,
            verification: [
              {
                type: 'TXT',
                domain: '_vercel.example.com',
                value: 'vc-domain-verify=www.example.com,e886cd36c2ae9464e6b5',
                reason: 'pending_domain_verification'
              }
            ],
            verificationResponse: {
              code: 'missing_txt_record',
              message:
                'Domain _vercel.example.com is missing required TXT Record "vc-domain-verify=www.example.com,e886cd36c2ae9464e6b5"'
            }
          })
        })
      })

      describe('unverified then verified', () => {
        const domain = 'www.example.com'
        const configData: VercelConfigDomainResponse = {
          configuredBy: null,
          nameservers: [
            'ns2.mytrafficmanagement.com',
            'ns1.mytrafficmanagement.com'
          ],
          serviceType: 'external',
          cnames: [],
          aValues: [
            '45.56.79.23',
            '72.14.185.43',
            '72.14.178.174',
            '45.33.23.183',
            '45.33.30.197',
            '45.33.18.44',
            '45.33.2.79',
            '45.79.19.196',
            '96.126.123.244',
            '198.58.118.167',
            '173.255.194.134',
            '45.33.20.235'
          ],
          conflicts: [],
          acceptedChallenges: [],
          misconfigured: true
        }
        const domainData: VercelDomainResponse = {
          name: 'www.example.com',
          apexName: 'example.com',
          projectId: 'journeysProjectId',
          redirect: null,
          redirectStatusCode: null,
          gitBranch: null,
          updatedAt: 1712008427374,
          createdAt: 1712008427374,
          verified: false,
          verification: [
            {
              type: 'TXT',
              domain: '_vercel.example.com',
              value: 'vc-domain-verify=www.example.com,e886cd36c2ae9464e6b5',
              reason: 'pending_domain_verification'
            }
          ]
        }
        const verifyData: VercelVerifyDomainResponse = {
          name: 'www.example.com',
          apexName: 'example.com',
          projectId: 'journeysProjectId',
          redirect: null,
          redirectStatusCode: null,
          gitBranch: null,
          updatedAt: 1712005704408,
          createdAt: 1712005704408,
          verified: true
        }

        beforeEach(() => {
          mockFetch.mockImplementation(
            mockCheckVercelDomainFetch(
              domain,
              configData,
              domainData,
              verifyData
            )
          )
        })

        it('should return misconfigured and verified', async () => {
          expect(
            await service.checkVercelDomain({
              name: domain
            } as unknown as CustomDomain)
          ).toEqual({
            configured: false,
            verified: true
          })
        })
      })

      describe('misconfigured', () => {
        const domain = 'www.example.com'
        const configData: VercelConfigDomainResponse = {
          configuredBy: null,
          nameservers: ['ns63.domaincontrol.com', 'ns64.domaincontrol.com'],
          serviceType: 'external',
          cnames: [],
          aValues: [],
          conflicts: [],
          acceptedChallenges: [],
          misconfigured: true
        }
        const domainData: VercelDomainResponse = {
          name: 'www.example.com',
          apexName: 'example.com',
          projectId: 'journeysProjectId',
          redirect: null,
          redirectStatusCode: null,
          gitBranch: null,
          updatedAt: 1712031870331,
          createdAt: 1711138797591,
          verified: true
        }
        const verifyData = null

        beforeEach(() => {
          mockFetch.mockImplementation(
            mockCheckVercelDomainFetch(
              domain,
              configData,
              domainData,
              verifyData
            )
          )
        })

        it('should return misconfigured and verified', async () => {
          expect(
            await service.checkVercelDomain({
              name: domain
            } as unknown as CustomDomain)
          ).toEqual({
            configured: false,
            verified: true
          })
        })
      })

      describe('configured', () => {
        const domain = 'example.com'
        const configData: VercelConfigDomainResponse = {
          configuredBy: 'http',
          nameservers: [
            'carlane.ns.cloudflare.com',
            'lochlan.ns.cloudflare.com'
          ],
          serviceType: 'external',
          cnames: [],
          aValues: ['172.67.134.126', '104.21.25.192'],
          conflicts: [],
          acceptedChallenges: ['http-01'],
          misconfigured: false
        }
        const domainData: VercelDomainResponse = {
          name: 'example.com',
          apexName: 'example.com',
          projectId: 'journeysProjectId',
          redirect: null,
          redirectStatusCode: null,
          gitBranch: null,
          updatedAt: 1711591718992,
          createdAt: 1711591718992,
          verified: true
        }
        const verifyData = null

        beforeEach(() => {
          mockFetch.mockImplementation(
            mockCheckVercelDomainFetch(
              domain,
              configData,
              domainData,
              verifyData
            )
          )
        })

        it('should return configured and verified', async () => {
          expect(
            await service.checkVercelDomain({
              name: domain
            } as unknown as CustomDomain)
          ).toEqual({
            configured: true,
            verified: true
          })
        })
      })
    })
  })

  describe('isDomainValid', () => {
    const VALID_DOMAINS = [
      'www.google.com',
      'google.com',
      'mkyong123.com',
      'mkyong-info.com',
      'sub.mkyong.com',
      'sub.mkyong-info.com',
      'mkyong.com.au',
      'g.co',
      'mkyong.t.t.co'
    ]

    VALID_DOMAINS.forEach((domain) => {
      it(`should return true for valid domain ${domain}`, () => {
        expect(service.isDomainValid(domain)).toBe(true)
      })
    })

    const INVALID_DOMAINS = [
      ['mkyong.t.t.c', 'Tld must between 2 and 6 long'],
      ['mkyong,com', 'Comma is not allow'],
      ['mkyong', 'No Tld'],
      ['mkyong.123', 'Tld not allow digit'],
      ['.com', 'Must start with [A-Za-z0-9]'],
      ['mkyong.com/users', 'No Tld'],
      ['-mkyong.com', 'Cannot begin with a hyphen -'],
      ['mkyong-.com', 'Cannot end with a hyphen -'],
      ['sub.-mkyong.com', 'Cannot begin with a hyphen -'],
      ['sub.mkyong-.com', 'Cannot end with a hyphen -']
    ]

    INVALID_DOMAINS.forEach(([domain, reason]) => {
      it(`should return false for invalid domain ${domain} because ${reason}`, () => {
        expect(service.isDomainValid(domain)).toBe(false)
      })
    })
  })
})
