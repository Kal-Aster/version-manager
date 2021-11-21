import { existsSync, readFileSync, writeFileSync } from "fs";

import getFSPath from "./getFSPath";
import IVersion from "./IVersion";

export default function updateVersionInPackageJSON(version: IVersion) {
    const packagePath = getFSPath("package.json");
    if (!packagePath || !existsSync(packagePath)) {
        return
    }
    const stringVersion = `${
        version.major
    }.${
        version.minor
    }.${
        version.patch
    }`;
    const packageJSON = JSON.parse(readFileSync(packagePath).toString());
    packageJSON.version = stringVersion;
    writeFileSync(packagePath, JSON.stringify(packageJSON, null, 2));
    
    const packageLockPath = getFSPath("package-lock.json");
    if (!packageLockPath || !existsSync(packageLockPath)) {
        return
    }
    const packageLock = JSON.parse(readFileSync(packageLockPath).toString());
    packageLock.version = stringVersion;
    writeFileSync(packageLockPath, JSON.stringify(packageLock, null, 2));
}