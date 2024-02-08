const { monotonicFactory } = require('ulidx')

const ulid = monotonicFactory()
exports.generateId = (unixTime = Date.now()) => ulid(unixTime).toLowerCase()