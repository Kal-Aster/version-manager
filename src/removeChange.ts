import { readFileSync, writeFileSync } from "fs";
import escapeRegExpChars from "./escapeRegExpChars";
import getChangeLogPath from "./getChangeLogPath";

import getFSPath from "./getFSPath";

export default function removeChange(description: string) {
    const path = getChangeLogPath();
    if (!path) {
        return;
    }
    const content = readFileSync(path).toString();
    const unreleasedStartIndex = (
        content.match(/\r?\n##\s+\[unreleased\]/i)?.index! ?? -1
    );
    if (unreleasedStartIndex === -1) {
        return;
    }
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
            `\\n\\s*\\[[ x]\\]\\s+${escapeRegExpChars(description)}[^\\S\\n]\\r?\\n`
        ), () => {
            return "\n";
        })
    }${
        content.substr(unreleasedEndIndex)
    }`);
}