const socket = io("/");
const videoGrid = document.getElementById("video-grid");
const myPeer = new Peer();

console.log(myPeer);


// Create a video object and mute client video
const myVideo = document.createElement("video");
const msg = document.getElementById("messages");

myVideo.muted = true;

// Create a list of peers
const peers = {};
const peerVids = {};

// Ask the user for permissions
navigator.mediaDevices
  .getUserMedia({ video: true, audio: true })
  .then((stream) => {
    // Add a new video stream
    addVideoStream(myVideo, stream);

    // When the call event is fired
    myPeer.on("call", (call) => {
      // Answer the call
      call.answer(stream);

      console.log("Answered Call");

      // Create a video element
      const video = document.createElement("video");

      // When the stream event is fired
      call.on("stream", (userVideoStream) => {
        //Add the stream to the user's page
        addVideoStream(video, userVideoStream);
        console.log("Stream Recieved");
      });
    });

    // When thhe user-connected event fire
    socket.on("user-connected", (userId) => {
      console.log(`User ${userId} connected`);

      // Send a message that a user has joined the call
      SendLocalMessage("A user has joined the call");

      // Connect to the new user
      connectToNewUser(userId, stream);
    });
  });

// When the user-disconnected event fires
socket.on("user-disconnected", (userId) => {
  // If the user is in the list of peers
  if (peers[userId]) {
    console.log(`User ${userId} disconnected`);

    // Send a message that a user has left the call
    SendLocalMessage("A user has left the call");

    // Remove the video
    peerVids[userId].remove();

    // Close the peers connection
    peers[userId].close();
  }
});

// When the open event fires
myPeer.on("open", (id) => {
  // Emit the join-room event to the room
  socket.emit("join-room", ROOM_ID, id);
  SendLocalMessage("You have joined the call");
});

// Connects the client with the new user
function connectToNewUser(userId, stream) {

  console.log(userId, stream);
  
  // Open a call with the new user
  const call = myPeer.call(userId, stream);

  myPeer.on("error", function(err) {
    console.log(err);
  });

  // Create a new video element
  const video = document.createElement("video");
  peerVids[userId] = video;

  // When the stream event is fired
  call.on("stream", (userVideoStream) => {
    console.log(`User ${userId} is now streaming`);

    // Add the new user's video stream to the page
    addVideoStream(video, userVideoStream);
  });

  // Add the current call to the list of peers
  peers[userId] = call;
}

// Sets up a video and adds it to the video grid
function addVideoStream(video, stream) {
  // Set the video source object
  video.srcObject = stream;

  // Add the loadedmetadata event listener to the video object
  video.addEventListener("loadedmetadata", () => {
    // Metadata is loaded, play the video
    video.play();
  });

  // Add the video to the video grid
  videoGrid.append(video);
}

function SendLocalMessage(message) {
  // Create a new date object  
  var date = new Date();

  // Create a new message item and add it to the message list
  var li = document.createElement("li");
  li.appendChild(
    document.createTextNode(
      "[" +
        date.getHours() +
        ":" +
        date.getMinutes() +
        ":" +
        date.getSeconds() + 
        "] " +
        message +
        "."
    )
  );
  msg.appendChild(li);
}
