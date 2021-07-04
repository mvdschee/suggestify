const path = require('path');

module.exports = {
	build: {
		lib: {
			entry: path.resolve(__dirname, 'src/suggestify.ts'),
			formats: ['esm', 'umd'],
			name: 'suggestify',
		},
	},
};
