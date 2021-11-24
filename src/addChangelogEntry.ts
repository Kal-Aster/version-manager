import { readFileSync, writeFileSync } from "fs";

import getChangeLogPath from "./getChangeLogPath";
import getLegibleCurrentDate from "./getLegibleCurrentDate";
import IVersion from "./IVersion";

export default function addChangelogEntry(version: IVersion, changes: string[]) {
    const path = getChangeLogPath(true);
    if (!path) {
        return;
    }
    const content = readFileSync(path).toString();
    const match = content.match(/\n##\s+\[(\d+).(\d+).(\d+)\]/);
    const offset = match?.[0].indexOf("##") ?? 0;
    const index = (match?.index ?? content.length) + offset;
    writeFileSync(path, `${
        content.substr(0, index)
    }## [${
        version.major
    }.${
        version.minor
    }.${
        version.patch
    }] - ${
        getLegibleCurrentDate()
    }\n${
        changes.map(change => `- ${change}`).join("\n")
    }\n\n${
        content.substr(index)
    }`);
}