class PeerService {
  constructor() {
    this.peer = new RTCPeerConnection({
      iceServers: [
        { urls: [ "stun:stun.l.google.com:19302", "stun:global.stun.twilio.com:3478" ] }
      ]
    });
  }

  async getAnswer(offer) {
    if (this.peer) {
      await this.peer.setRemoteDescription(offer);
      const ans = await this.peer.createAnswer();
      await this.peer.setLocalDescription(ans);
      return ans;
    }
  }

  async setLocalDescription(desc) {
    if (this.peer) {
      await this.peer.setLocalDescription(desc);
    }
  }

  async setRemoteDescription(desc) {
    if (this.peer) {
      await this.peer.setRemoteDescription(desc);
    }
  }

  async getOffer() {
    if (this.peer) {
      const offer = await this.peer.createOffer();
      await this.peer.setLocalDescription(offer);
      return offer;
    }
  }
}

export default new PeerService();
