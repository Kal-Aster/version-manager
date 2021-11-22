<script lang="ts">
    import { onMount } from "svelte";

    let changes: {
        description: string,
        done: boolean
    }[] = [];
    let version: {
        major: number,
        minor: number,
        patch: number
    };
    let changesLoading: boolean = true;
    let versionLoading: boolean = true;
    
    onMount(async () => {
        window.addEventListener("message", async (event) => {
            const message = event.data;
            switch (message.type) {
                case "changes": {
                    changesLoading = false;
                    changes = message.value;
                    break;
                }
                case "version": {
                    versionLoading = false;
                    version = message.value;
                    break;
                }
            }
        });
        vscode.postMessage({ type: "get-info", value: undefined });
    });

    function setChange(description: string, done: boolean) {
        vscode.postMessage({ type: "set-change", value: {
            description,
            done
        } });
    }

    function submitChange(event: any) {
        event.preventDefault();
        const {
            description: { value: description },
            done: { checked: done }
        } = event.target.elements;
        setChange(description, done);
        event.target.elements.description.value = "";
        event.target.elements.done.checked = false;
    }

    function removeChange(value: string) {
        vscode.postMessage({ type: "rem-change", value });
    }
</script>

<style>
    input[type="checkbox"] {
        margin-left: 0;
        margin-right: 8px;
    }
</style>

{#if changesLoading || versionLoading}
    <div>Loading...</div>
{:else}
    <div style="display: flex; align-items: center;">
        <div style="margin-right: 8px;">Version:</div>
        <button on:click={() => {
            vscode.postMessage({ type: "stage-new-major-version", value: "" });
        }}>{ version.major + (
            changes.filter(change => change.done).length > 0 ? "↑" : ""
        ) }</button>
        <button on:click={() => {
            vscode.postMessage({ type: "stage-new-minor-version", value: "" });
        }}>{ version.minor + (
            changes.filter(change => change.done).length > 0 ? "↑" : ""
        ) }</button>
        <button on:click={() => {
            vscode.postMessage({ type: "stage-new-patch-version", value: "" });
        }}>{ version.patch + (
            changes.filter(change => change.done).length > 0 ? "↑" : ""
        ) }</button>
    </div>
    <form
        on:submit={submitChange}
        style="margin: 12px 0 24px; display: flex; align-items: center;"
    >
        <input name="done" type="checkbox">
        <input name="description" type="text"
            style="
                box-sizing: content-box;
                height: 1.25em;
            "
        >
        <button
            style="
                padding: var(--input-padding-vertical);
                width: auto; margin-left: 8px;
                line-height: 1.25;
            "
        >Add</button>
    </form>
    {#each changes as change}
        <div style="display: flex; align-items: center;">
            <label style="display: flex; flex-grow: 1;">
                <input
                    type="checkbox"
                    checked={change.done}
                    on:change={() => setChange(change.description, !change.done)}
                    style="vertical-align: middle;"
                >
                <span
                    style="vertical-align: middle;"
                >{change.description}</span>
            </label>
            <div
                style="cursor: pointer;"
                on:click={() => removeChange(change.description)}
            >✕</div>
        </div>
    {/each}
{/if}