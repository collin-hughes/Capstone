const express = require("express");
const layouts = require("express-ejs-layouts");
const { v4: uuidV4 } = require("uuid");

const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);

// Set up EJS
//app.use(layouts);
app.set("view engine", "ejs");
app.use(express.static("public"));

// Set up routes
app.use("/", require("./routes/index"));

io.on("connection", socket =>
{
    socket.on("join-room", (roomId, userId) =>
    {
        socket.join(roomId);
        socket.to(roomId).broadcast.emit("user-connected", userId);
    
        socket.on("disconnect", () => {
        socket.to(roomId).broadcast.emit("user-disconnected", userId);    
        })
    })
})

app.get("/", (req, res) => res.render("index"));
app.get("/room", (req, res) => res.redirect(`/room=${uuidV4()}`));
app.get("/room=:room", (req, res) =>
  res.render("room", { roomId: req.params.room })
);


const port = process.env.PORT || 5000;

server.listen(port, console.log(`Server started on port ${port}`));