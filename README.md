# MCompare
![NPM Version](https://img.shields.io/npm/v/mcompare)
![NPM License](https://img.shields.io/npm/l/mcompare)
![NPM Unpacked Size](https://img.shields.io/npm/unpacked-size/mcompare)

A small, zero-dependency package for all-purpose comparing Minecraft mods folders.

## Features
- Comparation in 3+ paths at once
- Version unintensive comparation
- Automatic mod name and version extraction from file names
- Highlights for files that are not jarfiles
- Highlights for library mods
- Support for Modrinth launcher disabled mods (`.jar.disabled`) files

## Installation
1. If you haven't already, install Node.js from its [download page](https://nodejs.org/en/download).
2. Run `npm install -g mcompare`.


## Usage
Open terminal in any directory you want and type `mcompare name` and apply to this command all paths you want to compare, separated by spaces.

For more information run `mcompare help`.

> If a path contains spaces in it, wrap it in double quotes (`"`).

## Examples
``` batch
mcompare version .minecraft\\mods "Documents\\custom instance\\mods"
mcompare name modded\\minecraft\\mods "Documents\\custom instance\\mods" C:\\Users\\User\\minecraft\\mods
mcompare help
```
