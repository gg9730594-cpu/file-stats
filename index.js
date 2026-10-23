#!/usr/bin/env node

const { Command } = require('commander');
const fs = require('fs');
const path = require('path');

const program = new Command();

program
  .name('file-stats')
  .description('Shows file stats in a directory')
  .version('1.0.0')
  .argument('<dir>', 'path to directory')
  .option('-l, --limit <number>', 'The number of the largest files', '5')
  .action((dir, options) => {
    const limit = parseInt(options.limit);
    if (!fs.existsSync(dir)) {
      console.error(`Error: directory "${dir}" not found.`);
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

    
    filesWithSize.sort((a, b) => b.size - a.size);

    console.log(`Stats for: ${path.resolve(dir)}`);
    console.log(`Folders: ${dirCount}`);
    console.log(`Files: ${fileCount}`);
    console.log(`Total size: ${(totalSize / 1024 / 1024).toFixed(2)} МБ`);

    console.log(`\nТоп-${limit} largest files:`);
    filesWithSize.slice(0, limit).forEach((f, i) => {
      console.log(`${i + 1}. ${f.name} — ${(f.size / 1024 / 1024).toFixed(2)} МБ`);
    });
  });

program.parse();
