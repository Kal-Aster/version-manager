import { existsSync, readFileSync, writeFileSync } from "fs";
import escapeRegExpChars from "./escapeRegExpChars";

import getFSPath from "./getFSPath";

export default function setChange(
    description: string, done: boolean = false
) {
    const path = getFSPath("ROADMAP.md");
    if (!path) {
        return;
    }
    if (!existsSync(path)) {
        writeFileSync(path, "# ROADMAP\n\n");
    }
    const line = `[${ done ? "x" : " "}] ${description}`;

    let replaced = false;
    const content = readFileSync(path).toString().replace(new RegExp(
        `^\\s*\\[[ x]\\]\\s+${escapeRegExpChars(description)}\\s*$`,
        "m"
    ), () => {
        replaced = true;
        return line;
    });
    writeFileSync(path, content + (replaced ? "" : `\n${line}`));
}