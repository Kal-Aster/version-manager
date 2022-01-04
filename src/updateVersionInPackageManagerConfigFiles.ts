import { existsSync, readFileSync, writeFileSync } from "fs";

import getFSPath from "./getFSPath";
import getPackageManagersConfigFileNames from "./getPackageManagersConfigFileNames";
import IVersion from "./IVersion";

export default function updateVersionInPackageManagerConfigFiles(version: IVersion) {
    const stringVersion = `${
        version.major
    }.${
        version.minor
    }.${
        version.patch
    }`;

    getPackageManagersConfigFileNames().forEach(([fileName, configLockFileName]) => {
        const configFilePath = getFSPath(fileName);
        if (!configFilePath || !existsSync(configFilePath)) {
            return;
        }

        const configJSON = JSON.parse(readFileSync(configFilePath).toString());
        if (typeof configJSON.version !== "string") {
            return;
        }
        configJSON.version = stringVersion;
        writeFileSync(configFilePath, JSON.stringify(configJSON, null, 2));
        
        if (configLockFileName == null) {
            return;
        }

        const configLockFilePath = getFSPath(configLockFileName);
        if (!configLockFilePath || !existsSync(configLockFilePath)) {
            return;
        }
        const configLockJSON = JSON.parse(readFileSync(configLockFilePath).toString());
        configLockJSON.version = stringVersion;
        writeFileSync(configLockFilePath, JSON.stringify(configLockJSON, null, 2));
    })
}