import { existsSync, readFileSync } from "fs";

import getFSPath from "./getFSPath";
import IVersion from "./IVersion";

const defaultVersion: IVersion = {
    major: 0,
    minor: 0,
    patch: 0
};

function getVersionFromPackageJSON() {
    const packageJSONPath = getFSPath("package.json");
    if (!packageJSONPath || !existsSync(packageJSONPath)) {
        return { ...defaultVersion };
    }
    let pkgJSON;
    try {
        pkgJSON = JSON.parse(readFileSync(packageJSONPath).toString());
    } catch (e) {
        return { ...defaultVersion };
    }
    if (typeof pkgJSON.version !== "string") {
        return { ...defaultVersion };
    }
    const [major, minor, patch] = (
        (pkgJSON.version as string).split(".").map(n => parseInt(n, 10))
    );
    return { major, minor, patch };
}

export default function getVersion(): IVersion {
    const changelogPath = getFSPath("CHANGELOG.md");
    if (!changelogPath || !existsSync(changelogPath)) {
        return getVersionFromPackageJSON();
    }
    const content = readFileSync(changelogPath).toString();
    const [major, minor, patch] = (
        content.match(/\r?\n\r?\n##\s+\[(\d+).(\d+).(\d+)\]/)?.slice(1).map(n => parseInt(n, 10))
    ) || [];
    if (major === undefined) {
        return getVersionFromPackageJSON();
    }
    return { major, minor, patch };
}