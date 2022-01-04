import { readFileSync, writeFileSync } from "fs";

import escapeRegExpChars from "./escapeRegExpChars";
import getChangeLogPath from "./getChangeLogPath";

export default function setChange(
    description: string, done: boolean = false
) {
    const path = getChangeLogPath(true);
    if (!path) {
        return;
    }
    const content = readFileSync(path).toString();
    
    const unreleasedEndIndex = (
        content.match(/\r?\n##\s+\[(\d+).(\d+).(\d+)\]/)?.index ||
        content.length - 1
    );
    const unreleasedMatch = content.match(/^\s*##\s+\[unreleased\]/im);
    const unreleasedStartIndex = (
        unreleasedMatch?.index! ?? unreleasedEndIndex
    );

    const line = `[${ done ? "x" : " "}] ${description}`;

    let replaced = false;
    const unreleasedContent = content.substring(
        unreleasedStartIndex,
        unreleasedEndIndex
    ).replace(new RegExp(
        `\\n[^\\S\\n]*\\[[ x]\\]\\s+${escapeRegExpChars(description)}(\\r?)\\n`
    ), (...match) => {
        replaced = true;
        return `\n${line}${match[1]}\n`;
    });

    console.log("Setting change", {
        description, done,
        unreleasedStartIndex,
        unreleasedEndIndex,
        unreleasedContent
    });

    writeFileSync(path, `${
        content.substring(0, unreleasedStartIndex)
    }${
        unreleasedStartIndex === unreleasedEndIndex ? "\n## [Unreleased]" : ""
    }${
        replaced ? unreleasedContent : unreleasedContent.replace(
            /(\r?\n)*$/,
            match => `\n${line}${match}`
        )
    }${
        unreleasedStartIndex === unreleasedEndIndex ? "\n" : ""
    }${
        content.substring(unreleasedEndIndex)
    }`);
}