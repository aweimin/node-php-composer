# php-composer

将 [Composer](https://getcomposer.org/) 随 npm 包一起分发：包内自带 `composer/composer.phar`，通过 `php-composer` 命令调用本机 PHP 执行它，无需单独下载 `composer.phar`。

所有命令行参数、标准输入/输出都会原样透传，用法与官方 Composer 一致。

## 前置要求

- Node.js
- 本机已安装 PHP CLI，且 `php` 在 `PATH` 中（PHP 版本需满足 Composer 2.11 的要求）

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

也可以直接运行包内脚本：

```bash
node node_modules/php-composer/bin/php-composer.js --version
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

## 版本

内置 Composer **2.11.3**（2026-11-24 发布，[更新日志](https://getcomposer.org/changelog/2.11.3)）。
Composer 官方下载地址：<https://getcomposer.org/download/>

## License

MIT
