import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import { readFileSync } from 'node:fs';

const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'));
const tsconfig = JSON.parse(readFileSync('./tsconfig.json', 'utf-8'));

const input = 'src/index.ts';

const external = [...Object.keys(pkg.dependencies || {}), ...Object.keys(pkg.peerDependencies || {})];

const commonPlugins = [resolve(), commonjs()];

export default [
	// CommonJS
	{
		input,
		output: {
			file: './lib/index.cjs',
			format: 'cjs',
			exports: 'auto',
			sourcemap: false,
		},
		plugins: [
			...commonPlugins,
			typescript({
				...tsconfig.compilerOptions,
				declaration: false,
				rootDir: 'src',
				outDir: 'lib',
			}),
		],
		external,
	},

	// ES Module + TypeScript declarations
	{
		input,
		output: {
			file: './es/index.js',
			format: 'esm',
			sourcemap: false,
		},
		plugins: [
			...commonPlugins,
			typescript({
				...tsconfig.compilerOptions,
				declaration: true,
				declarationDir: 'es',
				rootDir: 'src',
				outDir: 'es',
			}),
		],
		external,
	},
];
