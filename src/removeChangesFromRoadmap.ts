import { existsSync, readFileSync, writeFileSync } from "fs";
import escapeRegExpChars from "./escapeRegExpChars";
import getChangeLogPath from "./getChangeLogPath";

import getFSPath from "./getFSPath";

export default function removeChangesFromRoadmap(changes: string[]) {
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
    const unreleasedLength = unreleasedEndIndex - unreleasedStartIndex;
    const unreleasedContent = content.substr(
        unreleasedStartIndex,
        unreleasedLength
    );

    writeFileSync(path, `${
        content.substr(0, unreleasedStartIndex)
    }${
        unreleasedContent.replace(new RegExp(
            `\\n[^\\S\\n]*\\[[ x]\\]\\s+(${
                changes.map((change) => `(${escapeRegExpChars(change)}`).join("|")
            })[^\\S\\n]*\\r?\\n`
        ), "\n")
    }\n${
        content.substr(unreleasedEndIndex)
    }`);
}