module.exports = {
    commands: {
        help: `A small, zero-dependency package for all-purpose comparing Minecraft mods folders.
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
                                          but has different versions of the mod in compared paths.\n`
    },

    partials: {
        excludesHeader(matcher) {
            return `\x1B[1;93mExcludes from directory \x1B[92m"${matcher}"\x1B[93m:\x1B[0m`;
        },
        fileLine(exclude) {
            return (
                exclude.versionOnly?
                    "\x1B[36m(Version)\x1B[96m ":
                exclude.disabled? 
                    "\x1B[33m(Disabled)\x1B[36m ": 
                exclude.notjar? 
                    "\x1B[33m(Not a jarfile)\x1B[36m ":
                exclude.lib?
                    "\x1B[32m(Library)\x1B[96m ":
                "\x1B[96m"
            ) + (
                exclude.matched? `${exclude.name} \x1B[90m(${exclude.version})`: exclude.path
            ) + "\x1B[0m";
        },

        noneString: "(none)"
    },

    errors: {
        noArg: "No comparison argument provided.\nThis is a required argument.",
        noCompVersion(opt) {
            return `Invalid comparison type '${opt}' provided.\nPlease type 'version' or 'name' as the first argument.`;
        },
        invalidExcludes(anyAll) {
            return `Invalid exclude operation '${anyAll}' provided.\nPlease type 'any', 'all' or do not specify this option.`;
        },

        errorTemplate(message) {
            return `\x1B[91m${message}\n\nFor help, run 'mcompare help'.\x1B[0m`;
        }
    }
}