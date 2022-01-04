import * as vscode from "vscode";

import { readFileSync, writeFileSync } from "fs";

import escapeRegExpChars from "./escapeRegExpChars";
import getChangeLogPath from "./getChangeLogPath";
import IVersion from "./IVersion";
import updateVersionInPackageManagerConfigFiles from "./updateVersionInPackageManagerConfigFiles";

export default async function revertLastVersion() {
    if (await vscode.window.showInformationMessage(
        "Do you really want to revert to previous version?",
        "Yes", "No"
    ) === "No") {
        return;
    }
    const path = getChangeLogPath();
    if (!path) {
        return;
    }
    const content = readFileSync(path).toString();
    const [first, second] = content.matchAll(/\n##[^\S\n]+\[(\d+).(\d+).(\d+)\]/g);
    if (!first) {
        return;
    }
    if (!second) {
        vscode.window.showErrorMessage(
            "Can't determine previous version"
        );
        return;
    }
    const startIndex = first.index!;
    const endIndex = second.index! ?? content.length - 1;
    
    const changes = content.substr(
        startIndex,
        endIndex - startIndex
    ).match(/^-\s+(.*)$/gm)?.map(change => change.substr(2).trim()) ?? [];

    const unreleasedEndIndex = startIndex;
    const unreleasedMatch = content.match(/^[^\S\n]*##\s+\[unreleased\]/im);
    const unreleasedStartIndex = (
        unreleasedMatch?.index! ?? unreleasedEndIndex
    );
    
    const unreleasedLength = unreleasedEndIndex - unreleasedStartIndex;

    const unreleasedContent = content.substr(
        unreleasedStartIndex,
        unreleasedLength
    ).replace(new RegExp(
        `\\n[^\\S\\n]*\\[[ x]\\]\\s+(?:${
            changes.map(change => `(${escapeRegExpChars(change)})`).join("|")
        })(\\r?)\\n`
    ), "");
    const firstUnreleasedLine = unreleasedContent.indexOf("\n") ?? unreleasedContent.length;
    const addNewLine = firstUnreleasedLine === unreleasedContent.length

    writeFileSync(path, `${
        content.substr(0, unreleasedStartIndex)
    }${
        (unreleasedLength === 0 ?
            "## [Unreleased]" :
            unreleasedContent.substr(0, firstUnreleasedLine + 1)
        )
    }${
        addNewLine ? "\n" : ""
    }${
        changes.map(change => `[x] ${change}\n`).join("")
    }${
        unreleasedContent.substr(firstUnreleasedLine + 1)
    }${
        content.substr(endIndex)
    }`);

    const version: IVersion = {
        major: parseInt(second[1], 10),
        minor: parseInt(second[2], 10),
        patch: parseInt(second[3], 10)
    };
    updateVersionInPackageManagerConfigFiles(version);
}