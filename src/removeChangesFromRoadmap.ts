import { existsSync, readFileSync, writeFileSync } from "fs";
import escapeRegExpChars from "./escapeRegExpChars";

import getFSPath from "./getFSPath";

export default function removeChangesFromRoadmap(
    changes: string[], done: boolean = false
) {
    const path = getFSPath("ROADMAP.md");
    if (!path || !existsSync(path)) {
        return;
    }
    const content = readFileSync(path).toString();
    const lines = content.match(new RegExp(
        `^\\s*\\[[ x]\\]\\s*(?:${
            changes.map(escapeRegExpChars).join("|")
        })\\s*$`,
        "gm"
    ));
    if (!lines) {
        return;
    }
    writeFileSync(path, content.replace(new RegExp(
        `\\r?\\n(?:${lines.map(escapeRegExpChars).join("|")})`, "g"
    ), ""));
}