process.stdin.resume()
process.stdin.setEncoding('utf8')
process.stdin.on('data', (data: string) => {
  const services = data
    .split('\n')
    .filter((value) => value != null && value !== '')
    .join('","')
  if (services === '') {
    console.log('[]')
  } else {
    console.log(`["${services}"]`)
  }
})
