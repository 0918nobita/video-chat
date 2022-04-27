<script lang="ts">
  import { onMount } from "svelte";
  import ClientList from "./ClientList.svelte";
  import Controls from "./Controls.svelte";
  import InputTextArea from "./InputTextArea.svelte";
  import OutputTextArea from "./OutputTextArea.svelte";
  import { initWebRTC } from "./webrtc";
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

  const offerSDP = async (): Promise<void> => {
    if (peer === null) return;
    const sessionDesc = await peer.createOffer({
      offerToReceiveVideo: true,
    });
    await peer.setLocalDescription(sessionDesc);
    sdpOutput = JSON.stringify(sessionDesc, null, 2);
  };

  const receiveSDP = async (): Promise<void> => {
    if (peer === null) return;
    const sessionDesc = JSON.parse(sdpInput);
    await peer.setRemoteDescription(sessionDesc);
    if (sessionDesc.type === "offer") {
      const newSessionDesc = await peer.createAnswer();
      await peer.setLocalDescription(newSessionDesc);
      sdpOutput = JSON.stringify(newSessionDesc, null, 2);
    }
  };

  const receiveICE = async (): Promise<void> => {
    if (peer === null) return;
    const candidates: RTCIceCandidateInit[] = JSON.parse(iceInput);
    for (const candidate of candidates) {
      await peer.addIceCandidate(candidate);
    }
  };
</script>

<main>
  <ClientList clients={["aaa", "bbb", "ccc"]} />
  <Controls {offerSDP} {receiveSDP} {receiveICE} />
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
