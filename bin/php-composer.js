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

// Windows 下 npm 安装的 php 是 php.cmd shim，需要 shell 才能按 PATHEXT 解析。
// 注意：Node 对 `spawn(cmd, argsArray, { shell: true })` 会发 DEP0190 弃用警告
// （shell 模式下参数数组只做字符串拼接、未转义）。这里改为把整条命令预拼成单个
// 字符串传入、不传 args 数组，即可消除警告；参数按 Windows 规则加引号处理。
const args = [composer, ...process.argv.slice(2)];
let command;
let child;
if (process.platform === 'win32') {
	const quote = (a) => (/\s/.test(a) ? `"${a}"` : a);
	command = [php, ...args].map(quote).join(' ');
	child = spawn(command, { stdio: 'inherit', shell: true });
} else {
	child = spawn(php, args, { stdio: 'inherit' });
}

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
