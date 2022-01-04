import { existsSync, readFileSync } from "fs";

import getFSPath from "./getFSPath";
import getPackageManagersConfigFileNames from "./getPackageManagersConfigFileNames";
import IVersion from "./IVersion";

const defaultVersion: IVersion = {
    major: 0,
    minor: 0,
    patch: 0
};

function getVersionFromPackageManagerConfigFile() {
    let version: IVersion;
    if (getPackageManagersConfigFileNames().some(([fileName]) => {
        const configFilePath = getFSPath(fileName);
        if (!configFilePath || !existsSync(configFilePath)) {
            return false;
        }

        let configJSON;
        try {
            configJSON = JSON.parse(readFileSync(configFilePath).toString());
        } catch (e) {
            return false;
        }
        if (typeof configJSON.version !== "string") {
            return false;
        }

        const [major, minor, patch] = (
            (configJSON.version as string).split(".").map(n => parseInt(n, 10))
        );
        version = { major, minor, patch };

        return true;
    })) {
        return version!;
    }
    return { ...defaultVersion };
}

export default function getVersion(): IVersion {
    const changelogPath = getFSPath("CHANGELOG.md");
    if (!changelogPath || !existsSync(changelogPath)) {
        return getVersionFromPackageManagerConfigFile();
    }
    const content = readFileSync(changelogPath).toString();
    const [major, minor, patch] = (
        content.match(/\r?\n##\s+\[(\d+).(\d+).(\d+)\]/)?.slice(1).map(n => parseInt(n, 10))
    ) || [];
    if (major === undefined) {
        return getVersionFromPackageManagerConfigFile();
    }
    return { major, minor, patch };
}