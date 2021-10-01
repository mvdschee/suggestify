import { defineConfig } from 'vite';
import path from 'path';
import copy from 'rollup-plugin-copy';
import pkg from './package.json';

module.exports = defineConfig({
	build: {
		target: 'esnext',
		minify: 'terser',
		emptyOutDir: false,
		lib: {
			entry: path.resolve(__dirname, 'src/suggestify.ts'),
			formats: ['es', 'umd'],
			name: 'suggestify',
		},
		outDir: './lib',
		rollupOptions: {
			plugins: [
				copy({
					targets: [
						{
							src: 'src/style.scss',
							dest: 'lib',
						},
					],
					hook: 'writeBundle',
				}),
			],
			output: {
				banner: `/*!
* ${pkg.name} v${pkg.version}
* (c) 2021 ${pkg.author}
* @license MIT
*/`,
			},
		},
	},
});
