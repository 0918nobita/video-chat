<script context="module" lang="ts">
  let counter = 0;
</script>

<script lang="ts">
  export let input: string;
  export let label: string;

  const elementId = `input-${counter++}`;
</script>

<label for={elementId}>{label}</label>
<textarea id={elementId} bind:value={input} />

<style>
  textarea {
    max-width: 100%;
    width: 100%;
    height: 10em;
    resize: none;
  }
</style>
