import React, { useEffect, useCallback, useState, useRef } from "react";
import { useSocket } from "../context/SocketProvider";
import "../styles/Room.css";
import peer from "../services/peer";

function RoomPage() {
    const socket = useSocket();
    const [remoteSocketId, setRemoteSocketId] = useState(null);
    const [myStream, setMyStream] = useState();
    const videoRef = useRef(null);

    const handleUserJoined = useCallback(({ email, id }) => {
        console.log(`Email ${email} joined room`);
        setRemoteSocketId(id);
    }, []);

    const handleCallUser = useCallback(async () => {
        // get camera and mic
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: true,
        });

        const offer = await peer.getOffer();
        socket.emit("user:call", { to: remoteSocketId, offer });

        setMyStream(stream); // store the stream
    }, [remoteSocketId, socket]);

    const handleIncomingCall = useCallback(async ({ from, offer }) => {
        setRemoteSocketId(from)
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: true,
        });
        setMyStream(stream);
        console.log("Incoming call", from, offer);
        const ans = await peer.getAnswer(offer);
        socket.emit('call:accepted', { to: from, ans })
    }, [socket]);

    const handleCallAccepted = useCallback(({ from, ans }) => {
        peer.setLocalDescription(ans)
        console.log('Call Accepted !')
    }, [])

    // Attach stream to video element whenever it changes
    useEffect(() => {
        if (videoRef.current && myStream) {
            videoRef.current.srcObject = myStream;
        }
    }, [myStream]);

    useEffect(() => {
        socket.on("user:joined", handleUserJoined);
        socket.on("incoming:call", handleIncomingCall);
        socket.on("call:accepted", handleCallAccepted)
        return () => {
            socket.off("user:joined", handleUserJoined);
            socket.off("incoming:call", handleIncomingCall);
            socket.off("call:accepted", handleCallAccepted)
        };
    }, [socket, handleUserJoined, handleIncomingCall]);

    return (
        <div className="room-container">
            <div className="room-card">
                <h1>Room Page</h1>
                <h4>{remoteSocketId ? "Connected" : "No one in room"}</h4>
                {remoteSocketId && (
                    <button className="call-btn" onClick={handleCallUser}>
                        CALL
                    </button>
                )}
                {myStream && (
                    <>
                        <h1>My Stream</h1>
                        <video
                            ref={videoRef}
                            autoPlay
                            muted
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
