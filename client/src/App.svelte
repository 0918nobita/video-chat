<script lang="ts">
  import { onMount } from "svelte";

  import ClientList from "./ClientList.svelte";
  import InputTextArea from "./InputTextArea.svelte";
  import { initWebRTC, offerSDP, receiveSDP, receiveICE } from "./webrtc";
  import OutputTextArea from "./OutputTextArea.svelte";
  import { setupWebSocket } from "./ws";

  let myVideo: HTMLVideoElement;
  let otherVideo: HTMLVideoElement;

  let sdpOutput = "";
  let sdpInput = "";
  let iceOutput = "";
  let iceInput = "";

  let peer: RTCPeerConnection | null = null;

  const iceCandidates: RTCIceCandidate[] = [];

  const handleICECandidate = (event: RTCPeerConnectionIceEvent): void => {
    if (event.candidate === null) return;
    iceCandidates.push(event.candidate);
    iceOutput = JSON.stringify(iceCandidates, null, 2);
  };

  const handleTrack = (event: RTCTrackEvent): void => {
    if (otherVideo === null) return;
    otherVideo.srcObject = event.streams[0]!;
  };

  onMount(async () => {
    peer = initWebRTC();
    peer.addEventListener("icecandidate", handleICECandidate);
    peer.addEventListener("track", handleTrack);

    setupWebSocket();

    const mediaStream = await navigator.mediaDevices.getUserMedia({
      video: true,
    });

    myVideo.srcObject = mediaStream;

    for (const track of mediaStream.getTracks()) {
      peer.addTrack(track, mediaStream);
    }
  });

  const noop = () => {};

  const setSdpOutput = (output: string) => {
    sdpOutput = output;
  };

  $: handleOfferSDP = peer ? offerSDP(peer, setSdpOutput) : noop;

  $: handleReceiveSDP = peer
    ? receiveSDP(peer, {
        sdpOutput: setSdpOutput,
        sdpInput: () => sdpInput,
      })
    : noop;

  $: handleReceiveICE = peer ? receiveICE(peer, () => iceInput) : noop;
</script>

<main>
  <ClientList
    clients={["aaa", "bbb", "ccc"]}
    on:clientSelected={(ev) => console.log("Client selected:", ev.detail)}
  />
  <div>
    <button on:click={handleOfferSDP}>Offer SDP</button>
    <button on:click={handleReceiveSDP}>Receive SDP</button>
    <button on:click={handleReceiveICE}>Receive ICE</button>
  </div>
  <video autoplay bind:this={myVideo}>
    <track kind="captions" />
  </video>
  <video autoplay bind:this={otherVideo}>
    <track kind="captions" />
  </video>
  <div>
    <OutputTextArea bind:output={sdpOutput} label="SDP Output" />
    <InputTextArea bind:input={sdpInput} label="SDP Input" />
    <OutputTextArea bind:output={iceOutput} label="ICE Output" />
    <InputTextArea bind:input={iceInput} label="ICE Input" />
  </div>
</main>

<style>
  video {
    width: 40%;
  }
</style>
