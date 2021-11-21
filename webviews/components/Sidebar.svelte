<script lang="ts">
    import { onMount } from "svelte";

    let changes: {
        description: string,
        done: boolean
    }[] = [];
    let loading: boolean = true;
    
    onMount(async () => {
        window.addEventListener("message", async (event) => {
            const message = event.data;
            switch (message.type) {
                case "changes": {
                    loading = false;
                    changes = message.value;
                    break;
                }
            }
        });
        vscode.postMessage({ type: "get-changes", value: undefined });
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

<div style="font-weight: bold; font-size: 11px;">VERSION MANAGER</div>

{#if loading}
    <div>Loading...</div>
{:else}
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
    <form on:submit={submitChange} style="margin: 24px 0 48px;">
        <div  style="display: flex; align-items: center;">
            <input name="done" type="checkbox">
            <input name="description" type="text">
        </div>
        <button>Add</button>
    </form>
{/if}
{#if changes.filter(change => change.done).length > 0}
    <button on:click={() => {
        vscode.postMessage({ type: "stage-new-major-version", value: "" });
    }}>New major version</button>
    <button on:click={() => {
        vscode.postMessage({ type: "stage-new-minor-version", value: "" });
    }}>New minor version</button>
    <button on:click={() => {
        vscode.postMessage({ type: "stage-new-patch-version", value: "" });
    }}>New patch version</button>
{:else}
    <div>Flag at least one change as done to create a new version</div>
{/if}