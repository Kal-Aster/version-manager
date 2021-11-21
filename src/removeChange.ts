import { existsSync, readFileSync, writeFileSync } from "fs";
import escapeRegExpChars from "./escapeRegExpChars";

import getFSPath from "./getFSPath";

export default function removeChange(description: string) {
    const path = getFSPath("ROADMAP.md");
    if (!path || !existsSync(path)) {
        return;
    }
    const content = readFileSync(path).toString();
    const line = content.match(new RegExp(
        `^\\s*\\[[ x]\\]\\s+${escapeRegExpChars(description)}\\s*$`,
        "m"
    ));
    if (!line) {
        return;
    }
    writeFileSync(path, content.replace(new RegExp(
        `\\r?\\n${escapeRegExpChars(line[0])}`, "g"
    ), ""));
}