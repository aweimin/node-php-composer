#!/usr/bin/env node
/**
 * 一键发布：升级版本 -> 提交 -> 打 tag -> 推送，由 GitHub Actions 自动发布到 npm。
 *
 * 用法：
 *   pnpm release patch          # 2.0.3 -> 2.0.4
 *   pnpm release minor          # 2.0.3 -> 2.1.0
 *   pnpm release major          # 2.0.3 -> 3.0.0
 *   pnpm release 2.1.0          # 指定版本
 *   pnpm release patch --wait   # 推送后等待 npm registry 上线确认
 *   pnpm release patch --dry-run
 */

import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const pkgPath = resolve(root, 'package.json');
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const wait = args.includes('--wait');
const bump = args.find((a) => !a.startsWith('--'));

const fail = (message) => {
	console.error(`[release] ${message}`);
	process.exit(1);
};

const run = (command, commandArgs) => {
	if (dryRun) {
		console.log(`[dry-run] ${command} ${commandArgs.join(' ')}`);
		return;
	}
	const result = spawnSync(command, commandArgs, { cwd: root, stdio: 'inherit' });
	if (result.error || result.status !== 0) {
		fail(`命令失败: ${command} ${commandArgs.join(' ')}`);
	}
};

const capture = (command, commandArgs) => {
	const result = spawnSync(command, commandArgs, { cwd: root, encoding: 'utf8' });
	if (result.error || result.status !== 0) {
		fail(`命令失败: ${command} ${commandArgs.join(' ')}\n${result.stderr || ''}`);
	}
	return result.stdout.trim();
};

if (!bump || (!['patch', 'minor', 'major'].includes(bump) && !/^\d+\.\d+\.\d+$/.test(bump))) {
	fail('用法: pnpm release <patch|minor|major|x.y.z> [--wait] [--dry-run]');
}

// ---- 前置检查 ----
if (capture('git', ['status', '--porcelain'])) {
	fail('工作区不干净，请先提交或 stash 所有改动');
}

const branch = capture('git', ['branch', '--show-current']);
if (branch !== 'main') {
	fail(`当前分支为 ${branch}，请切换到 main`);
}

const local = capture('git', ['rev-parse', 'HEAD']);
const remote = capture('git', ['rev-parse', 'origin/main']);
if (local !== remote) {
	fail('本地 main 与 origin/main 不同步，请先 git pull');
}

const pkgRaw = readFileSync(pkgPath, 'utf8');
const pkg = JSON.parse(pkgRaw);
const current = pkg.version;

const [major, minor, patch] = current.split('.').map(Number);
let next;
if (bump === 'patch') next = `${major}.${minor}.${patch + 1}`;
else if (bump === 'minor') next = `${major}.${minor + 1}.0`;
else if (bump === 'major') next = `${major + 1}.0.0`;
else next = bump;

if (next === current) {
	fail(`目标版本与当前版本相同: ${current}`);
}

const tag = `v${next}`;
if (capture('git', ['tag', '--list', tag])) {
	fail(`tag ${tag} 已存在`);
}

console.log(`[release] ${pkg.name}: ${current} -> ${next}`);

// ---- 更新版本 ----
const updated = pkgRaw.replace(/("version"\s*:\s*)"[^"]+"/, `$1"${next}"`);
if (updated === pkgRaw) {
	fail('未能更新 package.json 中的版本号');
}
if (!dryRun) {
	writeFileSync(pkgPath, updated);
}

// ---- 提交 / 打 tag / 推送 ----
run('git', ['add', 'package.json']);
run('git', ['commit', '-m', `chore: 升级版本至 ${next}`]);
run('git', ['tag', tag]);
run('git', ['push', 'origin', 'main']);
run('git', ['push', 'origin', tag]);

if (dryRun) {
	console.log('[dry-run] 以上为预览，未做任何改动');
	process.exit(0);
}

console.log(`[release] 已推送 ${tag}，GitHub Actions 发布任务已触发`);
console.log(`[release] 发布进度: https://github.com/aweimin/node-php-composer/actions`);

if (wait) {
	console.log('[release] 等待 npm registry 上线...');
	const deadline = Date.now() + 5 * 60 * 1000;
	while (Date.now() < deadline) {
		await new Promise((r) => setTimeout(r, 15_000));
		const online = spawnSync('npm', ['view', `${pkg.name}@${next}`, 'version'], { encoding: 'utf8' });
		if (online.status === 0 && online.stdout.trim() === next) {
			console.log(`[release] ✅ ${pkg.name}@${next} 已上线`);
			process.exit(0);
		}
	}
	fail('等待超时，请到 GitHub Actions 检查发布状态');
}
