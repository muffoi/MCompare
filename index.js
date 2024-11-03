#!/usr/bin/env node

const { log, group, groupEnd } = require("console");
const fs = require("fs");
const { commands, partials, errors } = require("./outputs");

const args = process.argv.splice(2);
const options = (() => {
    let shift = args.shift();
    if(!shift) printHelpPage();

    let match = shift.match(/^([a-z]+)(\+([a-z]+))?$/), compareVersion, allExcludes;
    if(match === null) err(errors.noArg);

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
            err(errors.noCompVersion(opt));
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
            err(errors.invalidExcludes(anyAll));
    }

    return { allExcludes, compareVersion };
})();

let details = {}, alt = {};

function err(message) {
    log("");
    log(errors.errorTemplate(message));
    process.exit(1);
}

function printHelpPage() {
    log(commands.help);
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
    group(partials.excludesHeader(matcher));

    for (const exclude of excludes) {
        log(partials.fileLine(exclude));
    }

    if(excludes.length === 0) log(partials.noneString);
    groupEnd();

    log("");
}

// log(details, alt);