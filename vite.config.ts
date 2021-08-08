import path from 'path';
import pkg from './package.json';

module.exports = {
	build: {
		target: 'esnext',
		emptyOutDir: false,
		lib: {
			entry: path.resolve(__dirname, 'src/suggestify.ts'),
			formats: ['esm', 'umd'],
			name: 'suggestify',
		},
		outDir: './lib',
		rollupOptions: {
			output: {
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
