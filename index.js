#!/usr/bin/env node

const { log, group, groupEnd } = require("console");
const fs = require("fs");
const args = process.argv.splice(2);
const options = (() => {
    let shift = args.shift();
    if(!shift) printHelpPage();

    let match = shift.match(/^([a-z]+)(\+([a-z]+))?$/), compareVersion, allExcludes;
    if(match === null) err("No comparation argument provided.\nThis is a required argument.");

    let [, opt,, anyAll] = match;

    switch(opt) {
        case "version":
            compareVersion = true;
            break;
        case "name":
            compareVersion = false;
            break;
        case "help":
            printHelpPage();
        default:
            err(`Invalid comparation type '${opt}' provided.\nPlease type 'version' or 'name' as the first argument.`);
    }

    switch(anyAll) {
        case undefined:
            allExcludes = true;
            break;
        case "any":
            allExcludes = false;
            break;
        case "all":
            allExcludes = true;
            break;
        default:
            err(`Invalid exclude operation '${anyAll}' provided.\nPlease type 'any', 'all' or do not specify this option.`);
    }

    return { allExcludes, compareVersion };
})();
let details = {}, alt = {};

function err(message) {
    log("");
    log(`\x1B[91m${message}\n\nFor help, run 'mcompare help'.\x1B[0m`);
    process.exit(1);
}

function printHelpPage() {
    log(`A small, zero-dependency package for all-purpose comparing Minecraft mods folders.
\x1B[96mUsage: \x1B[93mmcompare\x1B[0m <type>[+<excludeType>] [arguments]
       \x1B[93mmcompare\x1B[0m

\x1B[96mType: \x1B[32m'version'\x1B[0m - Include all mods, even if the mod is present but with different version.
      \x1B[32m'name'\x1B[0m - Include only the mods that are not present at all.
      \x1B[32m'help'\x1B[0m - Show this help page. Also works if you do not specify type at all.

\x1B[96mExclude Type: \x1B[32m'any'\x1B[0m - Include mods that miss in at least 1 of specified directories.
              \x1B[32m'all'\x1B[0m - Include only mods that miss in all directories. (default)
      
\x1B[96mArguments:\x1B[0m A space separated list of directories to compare.
           If a path has a space in it, wrap the path in double quotes. (")
           
\x1B[96mExamples: \x1B[93mmcompare \x1B[33mversion\x1B[0m .minecraft\\mods \x1B[36m"Documents\\custom instance\\mods"\x1B[0m
          \x1B[93mmcompare \x1B[33mname\x1B[0m modded\\mods \x1B[36m"Documents\\custom instance\\mods"\x1B[0m C:\\Users\\User\\.minecraft\\mods
          \x1B[93mmcompare \x1B[33mversion+any\x1B[0m .minecraft\\minecraft\\mods \x1B[36m"Documents\\modded instance\\mods"\x1B[0m customMinecraft\\mods
          \x1B[93mmcompare \x1B[33mhelp\x1B[0m

\x1B[96mFlags: \x1B[33mNot a jarfile\x1B[0m - Indicates that the file is not a jarfile, possibly a folder
       \x1B[32mLibrary\x1B[0m - Indicates that the file is a library mod
                 (Checking for substring of 'lib', so false positives are possible).
       \x1B[33mDisabled\x1B[0m - Indicates that the file is disabled
                  (Modrinth launcher flags disabled mods with adding '.disabled' to the file name).
       \x1B[36mVersion\x1B[0m ('version' compare mode) - This means that the file is included,
                                          but has different versions of the mod in compared paths.
`);
    process.exit()
}

function merge(state1, state2) {
    if(options.allExcludes)
        return state1 && state2;
    else return state1 || state2;
}

log("");

for (const path of args) {
    let dir = fs.readdirSync(path), full = {}, fullAlt = {};

    for (const file of dir) {
        let match = file.match(/^([^\.]+)(-|_|\+)(.+)\.jar(\.disabled)?$/);
        let content = {
            path: file,
            arg: path,
            matched: !!match,
            name: match?.[1],
            version: match?.[3],
            disabled: match?.[4] === ".disabled",
            lib: match? match[1].match(/lib/i): false,
            notjar: !file.match(/\.jar(\.disabled)?$/)
        };

        full[file] = content;
        fullAlt[content.name || file] = content;
    }

    details[path] = full;
    alt[path] = fullAlt;
}

for (const matcher in details) {
    let excludes = [], files = details[matcher];

    for (const file in files) {
        let excluded = options.allExcludes, present = options.allExcludes;
        let content = files[file];
        
        for (const key in details) {
            if(key == content.arg) continue;

            excluded = merge(excluded, !(
                options.compareVersion? details[key].hasOwnProperty(content.path):
                alt[key].hasOwnProperty(content.name || file)
            ));
            present = merge(present, !alt[key].hasOwnProperty(content.name || file));
        }

        if(excluded) excludes.push(content);
        content.versionOnly = !present; 
        // log(content.name || "!! " + content.path);
    }
    group(`\x1B[1;93mExcludes from directory \x1B[92m"${matcher}"\x1B[93m:\x1B[0m`);
    for (const exclude of excludes) {
        log(`${
            exclude.versionOnly?
                "\x1B[36m(Version)\x1B[96m ":
            exclude.disabled? 
                "\x1B[33m(Disabled)\x1B[36m ": 
            exclude.notjar? 
                "\x1B[33m(Not a jarfile)\x1B[36m ":
            exclude.lib?
                "\x1B[32m(Library)\x1B[96m ":
            "\x1B[96m"
        }${exclude.matched? `${exclude.name} \x1B[90m(${exclude.version})`: exclude.path}\x1B[0m`);
    }

    if(excludes.length === 0) log("(none)");
    groupEnd();

    log("");
}

// log(details, alt);