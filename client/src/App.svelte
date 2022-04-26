<script lang="ts">
  import { onMount } from "svelte";
  import { setupWebSocket } from "./ws";

  let myVideo: HTMLVideoElement;
  let otherVideo: HTMLVideoElement;

  let sdpOutput = "";
  let sdpInput = "";
  let iceOutput = "";
  let iceInput = "";

  let peer: RTCPeerConnection;

  onMount(async () => {
    const iceCandidates: RTCIceCandidate[] = [];

    peer = new RTCPeerConnection({
      iceServers: [
        {
          urls: "stun:openrelay.metered.ca:80",
        },
        {
          urls: "turn:openrelay.metered.ca:443?transport=tcp",
          username: "openrelayproject",
          credential: "openrelayproject",
        },
      ],
    });

    peer.addEventListener("icecandidate", (event) => {
      if (event.candidate === null) return;
      iceCandidates.push(event.candidate);
      iceOutput = JSON.stringify(iceCandidates, null, 2);
    });

    peer.addEventListener("track", (event) => {
      if (otherVideo === null) return;
      otherVideo.srcObject = event.streams[0]!;
    });

    setupWebSocket();

    const mediaStream = await navigator.mediaDevices.getUserMedia({
      video: true,
    });

    myVideo.srcObject = mediaStream;

    mediaStream
      .getTracks()
      .forEach((track) => peer.addTrack(track, mediaStream));
  });

  async function offerSDP() {
    const sessionDesc = await peer.createOffer({
      offerToReceiveVideo: true,
    });
    await peer.setLocalDescription(sessionDesc);
    sdpOutput = JSON.stringify(sessionDesc, null, 2);
  }

  async function receiveSDP() {
    const sessionDesc = JSON.parse(sdpInput);
    await peer.setRemoteDescription(sessionDesc);
    if (sessionDesc.type === "offer") {
      const newSessionDesc = await peer.createAnswer();
      await peer.setLocalDescription(newSessionDesc);
      sdpOutput = JSON.stringify(newSessionDesc, null, 2);
    }
  }

  async function receiveICE() {
    const candidates: RTCIceCandidateInit[] = JSON.parse(iceInput);
    for (const candidate of candidates) {
      await peer.addIceCandidate(candidate);
    }
  }
</script>

<main>
  <div>
    <button id="offer-sdp" on:click={offerSDP}>Offer SDP</button>
    <button id="receive-sdp" on:click={receiveSDP}>Receive SDP</button>
    <button id="receive-ice" on:click={receiveICE}>Receive ICE</button>
  </div>
  <video id="my-video" autoplay bind:this={myVideo}>
    <track kind="captions" />
  </video>
  <video id="other-video" autoplay bind:this={otherVideo}>
    <track kind="captions" />
  </video>
  <div>
    <label for="sdp-output">SDP Output</label>
    <textarea id="sdp-output" readonly bind:value={sdpOutput} />
    <label for="sdp-input">SDP Input</label>
    <textarea id="sdp-input" bind:value={sdpInput} />
    <label for="ice-output">ICE Output</label>
    <textarea id="ice-output" readonly bind:value={iceOutput} />
    <label for="ice-input">ICE Input</label>
    <textarea id="ice-input" bind:value={iceInput} />
  </div>
</main>

<style>
  #my-video,
  #other-video {
    width: 40%;
  }

  #sdp-output,
  #sdp-input,
  #ice-output,
  #ice-input {
    max-width: 100%;
    width: 100%;
    height: 10em;
  }
</style>
