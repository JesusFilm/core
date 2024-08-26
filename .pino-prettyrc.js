/** @type {import('pino-pretty').PrettyOptions}  */
module.exports = {
  ignore: 'pid,service,hostname',
  singleLine: true,
  colorize: true,
  customPrettifiers: {
    time: () => ''
  }
}
