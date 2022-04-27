<script context="module" lang="ts">
  let counter = 0;
</script>

<script lang="ts">
  export let output: string;
  export let label: string;

  const elementId = `output-${counter++}`;
</script>

<label for={elementId}>{label}</label>
<textarea id={elementId} bind:value={output} readonly />

<style>
  textarea {
    max-width: 100%;
    width: 100%;
    height: 10em;
    resize: none;
  }
</style>
