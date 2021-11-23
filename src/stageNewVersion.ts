import * as vscode from "vscode";

import { GitExtension } from "./git";

import addChangelogEntry from "./addChangelogEntry";
import getChanges from "./getChanges";
import getVersion from "./getVersion";
import NEW_VERSION_TYPE from "./NEW_VERSION_TYPE";
import removeChangesFromRoadmap from "./removeChangesFromRoadmap";
import updateVersionInPackageJSON from "./updateVersionInPackageJSON";

export default function stageNewVersion(type: NEW_VERSION_TYPE) {
    const version = getVersion();
    switch (type) {
        case NEW_VERSION_TYPE.MAJOR: {
            version.major++;
            version.minor = 0;
            version.patch = 0;
            break;
          }
          case NEW_VERSION_TYPE.MINOR: {
            version.minor++;
            version.patch = 0;
            break;
        }
        case NEW_VERSION_TYPE.PATCH: {
            version.patch++;
            break;
        }
        default: return;
    }
    
    const changes = getChanges(true).map(({ description }) => description);
    removeChangesFromRoadmap(changes);
    addChangelogEntry(version, changes);

    updateVersionInPackageJSON(version);

    const gitExtension = vscode.extensions.getExtension<GitExtension>('vscode.git')?.exports;
    if (!gitExtension) {
      return;
    }
    const git = gitExtension.getAPI(1);
    const repo = git.repositories[0];
    if (!repo) {
      return;
    }
    repo.inputBox.value = `${
      version.major
    }.${
      version.minor
    }.${
      version.patch
    }\n\n${
      changes.map(change => {
        return `- ${change}`;
      }).join("\n")
    }`;
}