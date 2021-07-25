import path from 'path';
import pkg from './package.json';

module.exports = {
	build: {
		lib: {
			entry: path.resolve(__dirname, 'src/suggestify.ts'),
			formats: ['esm'],
			name: 'suggestify',
		},
		rollupOptions: {
			output: {
				entryFileNames: `suggestify.js`,
				banner: `/*!
* @project      ${pkg.name}
* @author      	${pkg.author}
* @build        ${Date.now()}
* @release      ${pkg.version}
* @copyright    Copyright (c) 2021 ${pkg.author}
*/`,
			},
		},
	},
};
