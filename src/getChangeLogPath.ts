import { existsSync, writeFileSync } from "fs";

import getFSPath from "./getFSPath";

export default function getChangeLogPath(force: boolean = false) {
    const path = getFSPath("CHANGELOG.md");
    if (!path) {
        return null;
    }
    if (!existsSync(path)) {
        if (!force) {
            return null;
        }
        writeFileSync(path, "# Change Log\n\n");
    }
    return path;
}