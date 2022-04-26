import { signaling } from "./signaling";

const myVideo = document.getElementById("my-video") as HTMLVideoElement;
const otherVideo = document.getElementById("other-video") as HTMLVideoElement;

const offerSDP = document.getElementById("offer-sdp") as HTMLButtonElement;
const receiveSDP = document.getElementById("receive-sdp") as HTMLButtonElement;
const receiveICE = document.getElementById("receive-ice") as HTMLButtonElement;

const sdpOutput = document.getElementById("sdp-output") as HTMLTextAreaElement;
const sdpInput = document.getElementById("sdp-input") as HTMLTextAreaElement;

const iceOutput = document.getElementById("ice-output") as HTMLTextAreaElement;
const iceInput = document.getElementById("ice-input") as HTMLTextAreaElement;

const iceCandidates: RTCIceCandidate[] = [];

const peer = new RTCPeerConnection({
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
  iceOutput.value = JSON.stringify(iceCandidates, null, 2);
});

peer.addEventListener("track", (event) => {
  otherVideo.srcObject = event.streams[0]!;
});

offerSDP.addEventListener("click", async () => {
  const sessionDesc = await peer.createOffer({
    offerToReceiveVideo: true,
  });
  await peer.setLocalDescription(sessionDesc);
  sdpOutput.value = JSON.stringify(sessionDesc, null, 2);
});

receiveSDP.addEventListener("click", async () => {
  const sessionDesc = JSON.parse(sdpInput.value);
  await peer.setRemoteDescription(sessionDesc);
  if (sessionDesc.type === "offer") {
    const newSessionDesc = await peer.createAnswer();
    await peer.setLocalDescription(newSessionDesc);
    sdpOutput.value = JSON.stringify(newSessionDesc, null, 2);
  }
});

receiveICE.addEventListener("click", async () => {
  const candidates: RTCIceCandidateInit[] = JSON.parse(iceInput.value);
  for (const candidate of candidates) {
    await peer.addIceCandidate(candidate);
  }
});

(async () => {
  signaling();

  const mediaStream = await navigator.mediaDevices.getUserMedia({
    video: true,
  });

  myVideo.srcObject = mediaStream;

  mediaStream.getTracks().forEach((track) => peer.addTrack(track, mediaStream));
})();
