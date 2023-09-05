process.stdin.resume()
process.stdin.setEncoding('utf8')
process.stdin.on('data', (data: string) => {
  const services = data
    .split('\n')
    .filter((service) => !service.startsWith('api-'))
    .join('","')
    .replace(/\n/g, '')
  if (services === '') {
    console.log('matrix=[]')
  } else {
    console.log(`matrix=["${services}"]`)
  }
})
