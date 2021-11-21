import { existsSync, readFileSync } from "fs";
import getFSPath from "./getFSPath";

const allRegex = /^\[[ x]\](.*)$/gm;
const doneRegex = /^\[[x]\](.*)$/gm;

export default function getChanges(done: boolean = false) {
    const path = getFSPath("ROADMAP.md");
    if (!path || !existsSync(path)) {
        return [];
    }
    const content = readFileSync(path).toString();
    const match = content.match(done ? doneRegex : allRegex);
    if (!match) {
        return [];
    }
    return match.map(change => ({
        description: change.substr(3).trim(),
        done: change.substr(0, 3) === "[x]"
    }));
}