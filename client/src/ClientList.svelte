<script lang="ts">
  export let clients: string[];
</script>

<ul>
  {#each clients as client}
    <li>{client}</li>
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
