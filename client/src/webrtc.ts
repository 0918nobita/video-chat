export const initWebRTC = () => new RTCPeerConnection({
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

type SdpOutput = (output: string) => void;

export const offerSDP = (peer: RTCPeerConnection, sdpOutput: SdpOutput) => async (): Promise<void> => {
  const sessionDesc = await peer.createOffer({
    offerToReceiveVideo: true,
  });
  await peer.setLocalDescription(sessionDesc);
  sdpOutput(JSON.stringify(sessionDesc, null, 2));
};

interface ReceiveSDPCallbacks {
  sdpOutput: SdpOutput;
  sdpInput: () => string;
}

export const receiveSDP = (peer: RTCPeerConnection, { sdpOutput, sdpInput }: ReceiveSDPCallbacks) => async (): Promise<void> => {
  const sessionDesc = JSON.parse(sdpInput());
  await peer.setRemoteDescription(sessionDesc);
  if (sessionDesc.type === "offer") {
    const newSessionDesc = await peer.createAnswer();
    await peer.setLocalDescription(newSessionDesc);
    sdpOutput(JSON.stringify(newSessionDesc, null, 2));
  }
};

export const receiveICE = (peer: RTCPeerConnection, iceInput: () => string) => async (): Promise<void> => {
  const candidates: RTCIceCandidateInit[] = JSON.parse(iceInput());
  for (const candidate of candidates) {
    await peer.addIceCandidate(candidate);
  }
};
