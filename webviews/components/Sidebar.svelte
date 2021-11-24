<script lang="ts">
    import { onMount, beforeUpdate } from "svelte";

    interface IChange {
        description: string,
        done: boolean
    }

    let changes: IChange[] = [];
    let version: {
        major: number,
        minor: number,
        patch: number
    };
    let changesLoading: boolean = true;
    let versionLoading: boolean = true;

    let changesContainerElement: HTMLElement;

    let isDragging = false;

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

    beforeUpdate(resetTransform);

    function removeChange(value: string) {
        vscode.postMessage({ type: "rem-change", value });
    }

    function resetTransform() {
        if (!changesContainerElement) {
            return;
        }
        Array.prototype.forEach.call(changesContainerElement.children, child => {
            child.style.transform = "";
        });
    }

    function setChange(description: string, done: boolean) {
        vscode.postMessage({ type: "set-change", value: {
            description,
            done
        } });
    }

    function startDrag(event: MouseEvent) {
        event.preventDefault();

        isDragging = true;

        const target = (event.currentTarget as HTMLElement).parentElement!;
        const parent = target.parentElement!;
        const fromIndex = [...parent.children].indexOf(target);

        let toIndex = fromIndex;
        const onmousemove = (event: MouseEvent) => {
            event.preventDefault();
            resetTransform();
            
            const mouseY = event.clientY;
            
            if (!Array.prototype.some.call(parent.children, (child: HTMLElement, index) => {
                const rect = child.getBoundingClientRect();
                if (
                    index === 0 &&
                    mouseY < rect.y
                ) {
                    toIndex = index;
                    return true;
                }
                if (
                    mouseY < rect.y ||
                    mouseY > rect.y + rect.height
                ) {
                    return false;
                }

                toIndex = index;
                return true;
            })) {
                toIndex = parent.children.length - 1;
            }
                
            if (toIndex === fromIndex) {
                return;
            }
            
            const draggedElementHeight = parent.children[fromIndex].getBoundingClientRect().height;
            const reverse = toIndex < fromIndex;
            let draggedElementTranslateY = 0;
            Array.prototype.slice.call(
                parent.children,
                (reverse ? toIndex   : fromIndex + 1),
                (reverse ? fromIndex : toIndex   + 1)
            ).forEach(child => {
                child.style.transform = `translateY(${
                    draggedElementHeight * (reverse ? 1 : -1)
                }px)`;
                draggedElementTranslateY += child.getBoundingClientRect().height;
            });
            (parent.children[fromIndex] as HTMLElement).style.transform = `translateY(${
                draggedElementTranslateY * (reverse ? -1 : 1)
            }px)`;
        };
        const onmouseup = (event: MouseEvent) => {
            event.preventDefault();

            window.removeEventListener("mousemove", onmousemove);
            window.removeEventListener("mouseup", onmouseup);

            if (fromIndex === toIndex) {
                return;
            }
            
            vscode.postMessage({ type: "move-change", value: { fromIndex, toIndex } });
        }
        window.addEventListener("mousemove", onmousemove);
        window.addEventListener("mouseup", onmouseup);
    }

    function startEdit(event: MouseEvent) {
        const entryLabel = (
            event.currentTarget as HTMLElement
        ).parentElement!.querySelector("label > span") as HTMLSpanElement;
        const from = entryLabel.innerText.replace(/^\s*|\s*$/g, "");

        const onblur = () => {
            removeEventListeners();
            entryLabel.contentEditable = "inherit";

            const to = entryLabel.innerText.replace(/^\s*|\s*$/g, "");
            if (to === "" || to === from) {
                entryLabel.innerText = from;
                return;
            }
            
            vscode.postMessage({ type: "edit-change", value: { from, to } });
        };
        const onbeforeinput = (event: Event) => {
            const { inputType } = event as InputEvent;
            if (inputType !== "insertParagraph") {
                return;
            }
            event.preventDefault();
            (event.currentTarget as HTMLSpanElement).blur();
        };
        const onkeydown = (event: KeyboardEvent) => {
            if (event.key !== "Escape") {
                return;
            }
            removeEventListeners();
            entryLabel.contentEditable = "inherit";
            entryLabel.innerText = from;
        };

        const removeEventListeners = () => {
            entryLabel.removeEventListener("blur", onblur);
            entryLabel.removeEventListener("beforeinput", onbeforeinput);
            entryLabel.removeEventListener("keydown", onkeydown);
        };
        entryLabel.addEventListener("blur", onblur);
        entryLabel.addEventListener("beforeinput", onbeforeinput);
        entryLabel.addEventListener("keydown", onkeydown);

        entryLabel.contentEditable = "true";
        entryLabel.focus();

        const sel = window.getSelection();

        if (sel) {
            sel.selectAllChildren(entryLabel);
            sel.collapseToEnd();
        }
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
    <button on:click={() => {
        vscode.postMessage({ type: "revert-last-version", value: "" });
    }}>revert</button>
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
    <div style="padding-bottom: 24px;" bind:this={changesContainerElement}>
        {#each changes as change}
            <div style="display: flex; align-items: center;">
                <i
                    class="codicon codicon-gripper"
                    style="
                        margin-left: -5px;
                        margin-top: 1px;
                        align-self: start;
                        cursor: pointer;
                    "
                    on:mousedown={startDrag}
                ></i>
                <label
                    style="display: flex; flex-grow: 1;"
                    on:mousedown={(event) => {
                        const span = event.currentTarget.querySelector("span");
                        if (
                            !span ||
                            event.target !== span ||
                            span.contentEditable !== "true"
                        ) {
                            return;
                        }
                        event.preventDefault();
                    }}
                >
                    <input
                        type="checkbox"
                        checked={change.done}
                        on:change={() => {
                            setChange(change.description, !change.done);
                        }}
                        style="vertical-align: middle;"
                    >
                    <span
                        style="vertical-align: middle; padding-right: 4px;"
                    >{change.description}</span>
                </label>
                <i
                    class="codicon codicon-edit"
                    style="cursor: pointer; align-self: start;"
                    on:click={startEdit}
                ></i>
                <i
                    class="codicon codicon-close"
                    style="cursor: pointer; align-self: start;"
                    on:click={() => removeChange(change.description)}
                ></i>
            </div>
        {/each}
    </div>
{/if}