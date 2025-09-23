const { Server } = require("socket.io");

const io = new Server(8000, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const emailToSocketIdMap = new Map();
const socketidToEmailMap = new Map();

io.on("connection", (socket) => {
  console.log(`Socket Connected`, socket.id);

socket.on("room:join", (data) => {
  const { email, room } = data;

  emailToSocketIdMap.set(email, socket.id);
  socketidToEmailMap.set(socket.id, email);

  socket.join(room); // join first

  // Notify other users in the room that someone joined
  socket.to(room).emit("user:joined", { email, id: socket.id });

  // Notify the user themselves that they joined
  io.to(socket.id).emit("room:join", data);
});
});
