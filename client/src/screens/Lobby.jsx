import { useCallback, useState, useEffect } from "react";
import { useSocket } from "../context/SocketProvider";
import { useNavigate } from "react-router-dom";

function LobbyScreen() {
  const [email, setEmail] = useState("");
  const [room, setRoom] = useState("");

  const socket = useSocket();
  const navigate = useNavigate();

  const handleSubmitForm = useCallback((e) => {
    e.preventDefault();
    socket.emit('room:join', { email, room })

  }, [email, room, socket])

  useEffect(() => {
    socket.on("room:join", (data) => {
      console.log(`Data from Backend ${data}`);
    })
  }, [socket]);

  const handleJoinRoom = useCallback((data) => {
    const { email, room } = data
    // console.log(email, room)
    navigate(`/room/${room}`)
  }, [navigate])

  useEffect(() => {
    socket.on("room:join", handleJoinRoom)
    return () => {
      socket.off('room:join', handleJoinRoom)
    }
  }, [socket, handleJoinRoom])

  return (
    <div>
      <h1>Lobby</h1>
      <form onSubmit={handleSubmitForm}>
        <label htmlFor="email">Email ID</label>
        <input
          type="email"
          name="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <br />
        <label htmlFor="room">Room Number</label>
        <input
          type="text"
          name="room"
          id="room"
          value={room}
          onChange={(e) => setRoom(e.target.value)}
        />
        <br />
        <button>Join</button>
      </form>
    </div>
  );
}

export default LobbyScreen;
