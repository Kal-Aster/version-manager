import { readFileSync, writeFileSync } from "fs";

import getChangeLogPath from "./getChangeLogPath";

export default function moveChange(fromIndex: number, toIndex: number) {
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
    const changes = content.substr(
        unreleasedStartIndex,
        unreleasedEndIndex - unreleasedStartIndex
    ).match(/^\[[ x]\](.*)$/gm);
    if (!changes) {
        return;
    }
    const changesLength = changes.length;

    toIndex = Math.min(toIndex, changesLength - 1);
    if (
        fromIndex === toIndex ||
        fromIndex >= changesLength
    ) {
        return;
    }
    console.log(changes);
    changes.splice(toIndex, 0, changes.splice(fromIndex, 1)[0]);
    console.log(changes);

    writeFileSync(path, `${
        content.substr(0, unreleasedStartIndex)
    }${
        unreleasedMatch[0]
    }\n${
        changes.join("\n")
    }\n${
        content.substr(unreleasedEndIndex)
    }`);
}