import React, { useEffect, useCallback, useState, useRef } from "react";
import { useSocket } from "../context/SocketProvider";
import "../styles/Room.css";
import peer from "../services/peer";

function RoomPage() {
    const socket = useSocket();
    const [remoteSocketId, setRemoteSocketId] = useState(null);
    const [myStream, setMyStream] = useState();
    const [remoteStream, setRemoteStream] = useState();

    // Refs for video elements
    const myVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);

    // When another user joins, store their socket id
    const handleUserJoined = useCallback(({ email, id }) => {
        console.log(`Email ${email} joined room`);
        setRemoteSocketId(id);
    }, []);

    // Initiates call to the other user
    const handleCallUser = useCallback(async () => {
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: true,
        });
        setMyStream(stream);

        const offer = await peer.getOffer();
        socket.emit("user:call", { to: remoteSocketId, offer });
    }, [remoteSocketId, socket]);

    // Handles incoming call from peer
    const handleIncomingCall = useCallback(async ({ from, offer }) => {
        setRemoteSocketId(from);
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: true,
        });
        setMyStream(stream);

        console.log("Incoming call", from, offer);
        const ans = await peer.getAnswer(offer);
        socket.emit("call:accepted", { to: from, ans });
    }, [socket]);

    // Send my local media tracks to peer
    const sendStreams = useCallback(() => {
        if (!myStream) return;
        for (const track of myStream.getTracks()) {
            peer.peer.addTrack(track, myStream);
        }
    }, [myStream]);

    // When call is accepted, attach local tracks
    const handleCallAccepted = useCallback(({ from, ans }) => {
        peer.setLocalDescription(ans);
        console.log("Call Accepted!");
        sendStreams();
    }, [sendStreams]);

    // Attach local stream to my video player
    useEffect(() => {
        if (myVideoRef.current && myStream) {
            myVideoRef.current.srcObject = myStream;
        }
    }, [myStream]);

    // Attach remote stream to remote video player
    useEffect(() => {
        if (remoteVideoRef.current && remoteStream) {
            remoteVideoRef.current.srcObject = remoteStream;
        }
    }, [remoteStream]);

    // Negotiation logic
    const handleNegoNeeded = useCallback(async () => {
        const offer = await peer.getOffer();
        socket.emit("peer:nego:needed", { offer, to: remoteSocketId });
    }, [socket, remoteSocketId]);

    useEffect(() => {
        peer.peer.addEventListener("negotiationneeded", handleNegoNeeded);
        return () => {
            peer.peer.removeEventListener("negotiationneeded", handleNegoNeeded);
        };
    }, [handleNegoNeeded]);

    const handleNegoNeedIncomming = useCallback(async ({ from, offer }) => {
        const ans = await peer.getAnswer(offer);
        socket.emit("peer:nego:done", { to: from, ans });
    }, [socket]);

    const handleNegoNeedFinal = useCallback(async ({ ans }) => {
        await peer.setLocalDescription(ans);
    }, []);

    // Remote stream listener
    useEffect(() => {
        peer.peer.addEventListener("track", async (ev) => {
            const remoteStream = ev.streams;
            setRemoteStream(remoteStream[0]);
        });
    }, []);

    // Socket event listeners
    useEffect(() => {
        socket.on("user:joined", handleUserJoined);
        socket.on("incoming:call", handleIncomingCall);
        socket.on("call:accepted", handleCallAccepted);
        socket.on("peer:nego:needed", handleNegoNeedIncomming);
        socket.on("peer:nego:final", handleNegoNeedFinal);

        return () => {
            socket.off("user:joined", handleUserJoined);
            socket.off("incoming:call", handleIncomingCall);
            socket.off("call:accepted", handleCallAccepted);
            socket.off("peer:nego:needed", handleNegoNeedIncomming);
            socket.off("peer:nego:final", handleNegoNeedFinal);
        };
    }, [socket, handleUserJoined, handleIncomingCall, handleCallAccepted, handleNegoNeedIncomming, handleNegoNeedFinal]);

    return (
        <div className="room-container">
            <div className="room-card">
                <h1>Room Page</h1>

                {/* Button to send my stream */}
                {myStream && <button onClick={sendStreams}>Send Stream</button>}

                <h4>{remoteSocketId ? "Connected" : "No one in room"}</h4>

                {/* Button to start call */}
                {remoteSocketId && (
                    <button className="call-btn" onClick={handleCallUser}>
                        CALL
                    </button>
                )}

                {/* Local video */}
                {myStream && (
                    <>
                        <h1>My Stream</h1>
                        <video
                            ref={myVideoRef}
                            autoPlay
                            muted
                            playsInline
                            width="200"
                            height="150"
                        />
                    </>
                )}

                {/* Remote video */}
                {remoteStream && (
                    <>
                        <h1>Remote Stream</h1>
                        <video
                            ref={remoteVideoRef}
                            autoPlay
                            playsInline
                            width="200"
                            height="150"
                        />
                    </>
                )}
            </div>
        </div>
    );
}

export default RoomPage;
