#!/usr/bin/env node

const { Command } = require('commander');
const fs = require('fs');
const path = require('path');

const program = new Command();

program
  .name('file-stats')
  .description('Выводит статистику файлов в директории')
  .version('1.0.0')
  .argument('<dir>', 'Путь к директории')
  .option('-l, --limit <number>', 'Количество самых больших файлов', '5')
  .action((dir, options) => {
    const limit = parseInt(options.limit);
    if (!fs.existsSync(dir)) {
      console.error(`Ошибка: директория "${dir}" не найдена.`);
      process.exit(1);
    }

    let fileCount = 0;
    let dirCount = 0;
    let totalSize = 0;
    const filesWithSize = [];

    function walk(currentPath) {
      const entries = fs.readdirSync(currentPath, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(currentPath, entry.name);
        if (entry.isDirectory()) {
          dirCount++;
          walk(fullPath);
        } else if (entry.isFile()) {
          fileCount++;
          const stat = fs.statSync(fullPath);
          const size = stat.size;
          totalSize += size;
          filesWithSize.push({ name: fullPath, size });
        }
      }
    }

    walk(dir);

    // Сортируем по размеру
    filesWithSize.sort((a, b) => b.size - a.size);

    console.log(`Статистика для: ${path.resolve(dir)}`);
    console.log(`Папок: ${dirCount}`);
    console.log(`Файлов: ${fileCount}`);
    console.log(`Общий размер: ${(totalSize / 1024 / 1024).toFixed(2)} МБ`);

    console.log(`\nТоп-${limit} самых больших файлов:`);
    filesWithSize.slice(0, limit).forEach((f, i) => {
      console.log(`${i + 1}. ${f.name} — ${(f.size / 1024 / 1024).toFixed(2)} МБ`);
    });
  });

program.parse();
