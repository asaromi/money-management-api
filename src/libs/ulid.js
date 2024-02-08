const { monotonicFactory } = require('ulidx')
const { debug } = require('./response')

const ulid = monotonicFactory()
exports.generateId = (unixTime = Date.now()) => ulid(unixTime).toLowerCase()