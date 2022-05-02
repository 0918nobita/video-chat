import { derived, writable } from "svelte/store";

export const clientSetStore = writable(new Set<string>());

export const clientsStore = derived(clientSetStore, $clientSet => [...$clientSet]);
