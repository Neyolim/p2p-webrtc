import React, { useEffect, useCallback, useState } from "react";
import { useSocket } from "../context/SocketProvider";
import "../styles/Room.css";

function RoomPage() {
  const socket = useSocket();
  const [remoteSocketId, setRemoteSocketId] = useState(null);

  const handleUserJoined = useCallback(({ email, id }) => {
    console.log(`Email ${email} joined room`);
    setRemoteSocketId(id);
  }, []);

  useEffect(() => {
    socket.on("user:joined", handleUserJoined);

    return () => {
      socket.off("user:joined", handleUserJoined);
    };
  }, [socket, handleUserJoined]);

  return (
    <div className="room-container">
      <div className="room-card">
        <h1>Room Page</h1>
        <h4>{remoteSocketId ? "Connected" : "No one in room"}</h4>
        {remoteSocketId && <button className="call-btn">CALL</button>}
      </div>
    </div>
  );
}

export default RoomPage;
