import React, { createContext, useMemo, useContext } from 'react'
import { io } from "socket.io-client"

const SocketContext = createContext(null);

//Custom Hooks
export const useSocket = () => {
    const socket = useContext(SocketContext);
    return socket;
}


function SocketProvider(props) {
    const socket = useMemo(() => io("localhost:8000"), []);
    return (
        <SocketContext.Provider value={socket}>
            {props.children}
        </SocketContext.Provider>
    )
}

export default SocketProvider