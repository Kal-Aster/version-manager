import { readFileSync } from "fs";
import getChangeLogPath from "./getChangeLogPath";

const allRegex = /^\[[ x]\](.*)$/gm;
const doneRegex = /^\[[x]\](.*)$/gm;

export default function getChanges(done: boolean = false) {
    const path = getChangeLogPath();
    if (!path) {
        return [];
    }
    const content = readFileSync(path).toString();
    const unreleasedStartIndex = (
        content.match(/\r?\n##\s+\[unreleased\]/i)?.index! ?? -1
    );
    if (unreleasedStartIndex === -1) {
        return [];
    }
    const unreleasedEndIndex = (
        content.match(/\r?\n##\s+\[(\d+).(\d+).(\d+)\]/)?.index ||
        content.length - 1
    );
    const match = content.substr(
        unreleasedStartIndex,
        unreleasedEndIndex - unreleasedStartIndex
    ).match(done ? doneRegex : allRegex);
    if (!match) {
        return [];
    }
    return match.map(change => ({
        description: change.substr(3).trim(),
        done: change.substr(0, 3) === "[x]"
    }));
}