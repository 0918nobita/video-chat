<script lang="ts">
  export let offerSDP: () => Promise<void>;

  export let receiveSDP: () => Promise<void>;

  export let receiveICE: () => Promise<void>;
</script>

<div>
  <button on:click={offerSDP}>Offer SDP</button>
  <button on:click={receiveSDP}>Receive SDP</button>
  <button on:click={receiveICE}>Receive ICE</button>
</div>
