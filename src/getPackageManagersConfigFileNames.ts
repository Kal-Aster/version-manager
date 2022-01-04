export default function getPackageManagersConfigFileNames() {
    return [
        ["package.json", "package-lock.json"],
        ["composer.json", null]
    ] as [string, string | null][];
}