import { existsSync, readFileSync, writeFileSync } from "fs";
import getFSPath from "./getFSPath";
import getLegibleCurrentDate from "./getLegibleCurrentDate";
import IVersion from "./IVersion";

export default function addChangelogEntry(version: IVersion, changes: string[]) {
    const path = getFSPath("CHANGELOG.md");
    if (!path) {
        return;
    }
    if (!existsSync(path)) {
        writeFileSync(path, "# CHANGELOG\n\n");
    }
    const content = readFileSync(path).toString();
    const match = content.match(/\r?\n\r?\n##\s+\[(\d+).(\d+).(\d+)\]/);
    const offset = match?.[0].indexOf("##") ?? 0;
    const index = (match?.index ?? content.length) + offset;
    writeFileSync(path, `${content.substr(0, index)}${
        `## [${
            version.major
        }.${
            version.minor
        }.${
            version.patch
        }] - ${
            getLegibleCurrentDate()
        }\n${
            changes.map(change => {
                return `- ${change}`;
            }).join("\n")
        }\n\n`
    }${content.substr(index)}`);
}