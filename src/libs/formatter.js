exports.wrapHandler = (...handlers) => {
	const options = {}
	if (handlers.length > 1) {
		options.preHandler = []

		for (let i = 0; i < handlers.length - 1; i++) {
			options.preHandler.push(handlers[i])
		}
	}

	return [options, handlers.slice(-1)[0]]
}