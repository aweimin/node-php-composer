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

const child = spawn(php, [composer, ...process.argv.slice(2)], { stdio: 'inherit' });

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
