#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const composer = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'composer', 'composer.phar');
const php = process.env.PHP_BINARY || 'php';

if (!existsSync(composer)) {
	console.error(`[php-composer] composer.phar 不存在: ${composer}`);
	process.exit(1);
}

// Windows 下 npm 安装的 php 是 php.cmd shim，spawn 默认 shell:false 只能解析 .exe，
// 找不到 .cmd 会抛 ENOENT。开启 shell 让系统按 PATHEXT 解析 php.cmd（也能解析真实 php.exe）。
const child = spawn(php, [composer, ...process.argv.slice(2)], {
	stdio: 'inherit',
	shell: process.platform === 'win32',
});

child.on('error', (error) => {
	console.error(
		error.code === 'ENOENT'
			? `[php-composer] 找不到 PHP（${php}），请安装 PHP 或设置 PHP_BINARY 环境变量。`
			: `[php-composer] 启动失败: ${error.message}`
	);
	process.exit(127);
});

child.on('close', (code) => {
	process.exitCode = code ?? 1;
});
