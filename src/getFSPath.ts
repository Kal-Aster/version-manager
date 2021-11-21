import { join } from "path";

import * as vscode from "vscode";

export default function getFSPath(path: string) {
    const root = vscode.workspace.workspaceFolders?.[0]?.uri;
    if (!root) {
        return null;
    }
    return join(root.fsPath, path);
}