const path = require('path');

module.exports = {
	build: {
		lib: {
			entry: path.resolve(__dirname, 'lib/suggestify.ts'),
			formats: ['es', 'umd'],
			name: 'suggestify',
		},
	},
};
