import { readFileSync, writeFileSync } from "fs";

import escapeRegExpChars from "./escapeRegExpChars";
import getChangeLogPath from "./getChangeLogPath";

export default function editChange(from: string, to: string) {
    const path = getChangeLogPath(true);
    if (!path) {
        return;
    }
    const content = readFileSync(path).toString();
    
    const unreleasedEndIndex = (
        content.match(/\r?\n##\s+\[(\d+).(\d+).(\d+)\]/)?.index ||
        content.length - 1
    );
    const unreleasedMatch = content.match(/^\s*##\s+\[unreleased\]/im);
    const unreleasedStartIndex = (
        unreleasedMatch?.index! ?? unreleasedEndIndex
    );
    
    const unreleasedLength = unreleasedEndIndex - unreleasedStartIndex;

    let replaced = false;
    const unreleasedContent = content.substr(
        unreleasedStartIndex,
        unreleasedLength
    ).replace(new RegExp(
        `\\n[^\\S\\n]*\\[([ x])\\]\\s+${escapeRegExpChars(from)}(\\r?)\\n`
    ), (...match) => {
        replaced = true;
        return `\n[${match[1]}] ${to}${match[2]}\n`;
    });

    writeFileSync(path, `${
        content.substr(0, unreleasedStartIndex)
    }${
        replaced ? unreleasedContent : unreleasedContent.replace(
            /(\r?\n)*$/,
            match => `\n[ ] ${to}${match}`
        )
    }${
        content.substr(unreleasedEndIndex)
    }`);
}