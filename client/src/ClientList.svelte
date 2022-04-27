<script lang="ts">
  import { createEventDispatcher } from "svelte";

  export let clients: string[];

  const dispatch = createEventDispatcher<{ clientSelected: string }>();

  const handleClick = (client: string) => () => {
    dispatch("clientSelected", client);
  };
</script>

<ul>
  {#each clients as client}
    <li on:click={handleClick(client)}>{client}</li>
  {/each}
</ul>

<style>
  ul {
    list-style: none;
    border: 1px solid #555;
    border-radius: 10px;
    margin: 10px;
    padding: 10px;
  }
  li:hover {
    background: #ccc;
  }
</style>
