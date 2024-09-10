const getQueryResults = jest
  .fn()
  .mockResolvedValue([['data1'], { pageToken: null }])

const job = {
  getQueryResults
}
const createQueryJob = jest.fn().mockResolvedValue([job])
export const query = jest
  .fn()
  .mockResolvedValue([[{ f0_: { value: 'timestamp' } }]])
export const BigQuery = jest.fn().mockImplementation(() => ({
  createQueryJob,
  query
}))
