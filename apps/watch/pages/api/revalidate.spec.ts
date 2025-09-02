import { NextApiRequest, NextApiResponse } from 'next'

import handler from './revalidate'

describe('Revalidate API', () => {
  const OLD_ENV = process.env

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...OLD_ENV }
    process.env.REVALIDATE_SECRET = 'test-secret'
  })

  afterEach(() => {
    process.env = OLD_ENV
  })

  it('should return 405 if method is not POST', async () => {
    const req = {
      method: 'GET',
      query: { secret: 'test-secret' }
    } as unknown as NextApiRequest

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    } as unknown as NextApiResponse

    await handler(req, res)

    expect(res.status).toHaveBeenCalledWith(405)
    expect(res.json).toHaveBeenCalledWith({ message: 'Method Not Allowed' })
  })

  it('should return 401 if secret is invalid', async () => {
    const req = {
      method: 'POST',
      query: { secret: 'wrong-secret' }
    } as unknown as NextApiRequest

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    } as unknown as NextApiResponse

    await handler(req, res)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid token' })
  })

  it('should return 400 if url is not a string', async () => {
    const req = {
      method: 'POST',
      query: { secret: 'test-secret' },
      body: { url: 123 }
    } as unknown as NextApiRequest

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    } as unknown as NextApiResponse

    await handler(req, res)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid url' })
  })

  it('should return 400 if url does not start with /', async () => {
    const req = {
      method: 'POST',
      query: { secret: 'test-secret' },
      body: { url: 'invalid-url' }
    } as unknown as NextApiRequest

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    } as unknown as NextApiResponse

    await handler(req, res)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid url' })
  })

  it('should revalidate the url and return success', async () => {
    const url = '/watch/some-video.html/english.html'
    const req = {
      method: 'POST',
      query: { secret: 'test-secret' },
      body: { url }
    } as unknown as NextApiRequest

    const revalidate = jest.fn().mockResolvedValue(undefined)
    const res = {
      revalidate,
      json: jest.fn()
    } as unknown as NextApiResponse

    await handler(req, res)

    expect(revalidate).toHaveBeenCalledWith(url)
    expect(res.json).toHaveBeenCalledWith({ revalidated: true, url })
  })

  it('should return 500 if revalidation fails', async () => {
    const errorMessage = 'Revalidation failed'
    const url = '/watch/some-video.html/english.html'
    const req = {
      method: 'POST',
      query: { secret: 'test-secret' },
      body: { url }
    } as unknown as NextApiRequest

    const revalidate = jest.fn().mockRejectedValue(new Error(errorMessage))
    const res = {
      revalidate,
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    } as unknown as NextApiResponse

    await handler(req, res)

    expect(revalidate).toHaveBeenCalledWith(url)
    expect(res.status).toHaveBeenCalledWith(500)
    expect(res.json).toHaveBeenCalledWith({
      message: 'Error revalidating',
      error: errorMessage
    })
  })

  it('should log the url being revalidated', async () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation()
    const url = '/watch/some-video.html/english.html'
    const req = {
      method: 'POST',
      query: { secret: 'test-secret' },
      body: { url }
    } as unknown as NextApiRequest

    const revalidate = jest.fn().mockResolvedValue(undefined)
    const res = {
      revalidate,
      json: jest.fn()
    } as unknown as NextApiResponse

    await handler(req, res)

    expect(consoleSpy).toHaveBeenCalledWith('url', url)
    consoleSpy.mockRestore()
  })
})
