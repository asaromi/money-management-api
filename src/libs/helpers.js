exports.generateSlug = (text) => text.toString().toLowerCase()
	.replace('&', 'and')
	.replace(/\s+/g, '-')
	.replace(/[^\w-]+/g, '')