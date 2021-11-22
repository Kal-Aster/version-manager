import { existsSync, readFileSync, writeFileSync } from "fs";
import escapeRegExpChars from "./escapeRegExpChars";
import getChangeLogPath from "./getChangeLogPath";

import getFSPath from "./getFSPath";

export default function removeChangesFromRoadmap(
    changes: string[], done: boolean = false
) {
    const path = getChangeLogPath();
    if (!path) {
        return;
    }
    const content = readFileSync(path).toString();
    const unreleasedMatch = content.match(/^\s*##\s+\[unreleased\]/im);
    if (!unreleasedMatch) {
        return;
    }
    const unreleasedStartIndex = unreleasedMatch.index!;
    const unreleasedEndIndex = (
        content.match(/\r?\n##\s+\[(\d+).(\d+).(\d+)\]/)?.index ||
        content.length - 1
    );

    writeFileSync(path, `${
        content.substr(0, unreleasedStartIndex)
    }${
        unreleasedMatch[0]
    }\n${
        content.substr(unreleasedEndIndex)
    }`);
}