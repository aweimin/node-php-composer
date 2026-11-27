# php-composer

[![npm version](https://img.shields.io/npm/v/php-composer.svg)](https://www.npmjs.com/package/php-composer)
[![license](https://img.shields.io/npm/l/php-composer.svg)](https://github.com/aweimin/node-php-composer/blob/main/LICENSE)

将 [Composer](https://getcomposer.org/) 随 npm 包一起分发：包内自带 `composer/composer.phar`，通过 `php-composer` 命令调用本机 PHP 执行它，无需单独下载 `composer.phar`。

所有命令行参数、标准输入/输出都会原样透传，用法与官方 Composer 一致。

## 特性

- 内置 Composer 2.11.3，安装即用，无需联网下载 Composer 本体
- 参数与 stdio 原样透传，支持交互式命令
- 支持通过 `PHP_BINARY` 指定 PHP 可执行文件，兼容 Windows 的 `php.cmd` shim
- 同时提供 ESM / CommonJS 入口与 TypeScript 类型声明

## 前置要求

- Node.js 18 或更高
- PHP CLI >= 7.2.5（Composer 2.11 的最低要求），且 `php` 在 `PATH` 中

## 安装

```bash
npm install php-composer
# 或
pnpm add php-composer
```

全局安装后可直接在任意目录使用 `php-composer` 命令：

```bash
npm install -g php-composer
```

## 命令行用法

安装后会自动注册 `php-composer` 命令，其后的参数全部传给 Composer：

```bash
php-composer --version
php-composer install
php-composer require monolog/monolog
php-composer update --no-dev
```

未安装时也可以直接通过 `npx` 运行：

```bash
npx php-composer --version
```

也可以直接运行包内脚本：

```bash
node node_modules/php-composer/bin/php-composer.js --version
```

在 `package.json` 的 scripts 中使用：

```json
{
	"scripts": {
		"composer:install": "php-composer install",
		"composer:update": "php-composer update"
	}
}
```

### 指定 PHP 可执行文件

默认调用 `PATH` 中的 `php`。若 PHP 不在 `PATH` 中，或需要指定版本，可设置 `PHP_BINARY` 环境变量：

```bash
PHP_BINARY=/usr/bin/php8.3 php-composer install
```

Windows PowerShell：

```powershell
$env:PHP_BINARY = 'C:\php\php.exe'
php-composer install
```

## 编程式使用

包默认导出一个函数，返回内置的 Composer 版本号：

```js
// ESM
import version from 'php-composer';
console.log(version()); // 2.11.3
```

```js
// CommonJS
const version = require('php-composer');
console.log(version()); // 2.11.3
```

## 故障排查

- **`php-composer: command not found`**：全局安装后确认 npm 全局 bin 目录已加入 `PATH`；临时使用可改用 `npx php-composer ...`
- **`找不到 PHP`**：安装 PHP CLI 并确保 `php` 可执行，或用 `PHP_BINARY` 指定绝对路径
- **Xdebug 连接超时提示**：来自本机 `php.ini` 的远程调试配置，与 php-composer 无关

## 版本说明

- npm 包版本：见 [npm 页面](https://www.npmjs.com/package/php-composer) 或项目 `package.json`
- 内置 Composer：**2.11.3**（2026-11-24 发布，[更新日志](https://getcomposer.org/changelog/2.11.3)）
- Composer 官方下载地址：<https://getcomposer.org/download/>

## 发布（维护者）

版本升级与发布由一键脚本完成：更新 `package.json` 版本、提交、打 `vX.Y.Z` tag 并推送，随后 GitHub Actions 自动发布到 npm。

```bash
pnpm release patch          # 2.0.3 -> 2.0.4
pnpm release minor          # 2.0.3 -> 2.1.0
pnpm release major          # 2.0.3 -> 3.0.0
pnpm release 2.1.0          # 指定版本
pnpm release patch --wait   # 推送后等待 npm 上线确认
pnpm release patch --dry-run
```

执行前需保证工作区干净、`main` 分支且与 `origin/main` 同步。发布使用 npm Trusted Publishing（OIDC），无需本地 token。

## License

MIT
