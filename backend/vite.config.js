import path from 'path';
import pkg from './package.json';

module.exports = {
	build: {
		target: 'esnext',
		lib: {
			entry: path.resolve(__dirname, 'src/search.js'),
			formats: ['cjs'],
		},
		outDir: '../api',
		rollupOptions: {
			output: {
				entryFileNames: `search.js`,
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
