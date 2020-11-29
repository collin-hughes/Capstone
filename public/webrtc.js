// Adapted from: https://www.dmcinfo.com/latest-thinking/blog/id/9852/multi-user-video-chat-with-webrtc

var serverConnection;
var localUser = {};
var peerConnections = {};

var peerConnectionConfig = {
  iceServers: [
    { urls: "stun:stun.stunprotocol.org:3478" },
    { urls: "stun:stun.l.google.com:19302" },
  ],
};

// If the user's browser supports get user media
if (navigator.mediaDevices.getUserMedia) {
  // Get the stream from the media devices
  navigator.mediaDevices
    .getUserMedia({
      video: true,
      audio: true,
    })
    .then((stream) => {
      // Set the local user data
      localUser = { uuid: USR_UUID, displayName: USR_NAME, stream: stream };

      CreateVidElement(
        localUser.stream,
        "localVideo",
        localUser.displayName,
        true
      );

      // Send a notification that you have joined the chat
      SendChatNotification(localUser.displayName, "You have joined the room.");
    })
    .catch(ErrorHandler)

    // Set up websocket and message all existing clients
    .then(() => {
      // Connect to the WebSocket
      serverConnection = new WebSocket(
        "wss://" + window.location.hostname + ":" + PORT
      );

      // When we recieve a message from the server, parse it
      serverConnection.onmessage = GotMessageFromServer;

      // When we open a connection, send all of our data to the server
      serverConnection.onopen = (event) => {
        serverConnection.send(
          JSON.stringify({
            roomId: ROOM_ID,
            displayName: localUser.displayName,
            uuid: localUser.uuid,
            dest: "all",
          })
        );
      };
    })
    .catch(ErrorHandler);
} else {
  alert("Your browser does not support getUserMedia API");
}

function CreateVidElement(
  stream,
  containerName,
  localDisplayName,
  muted = false
) {
  // Create the video element
  var vidElement = document.createElement("video");
  vidElement.setAttribute("autoplay", "");
  vidElement.setAttribute("muted", "");
  vidElement.srcObject = stream;
  vidElement.muted = muted;

  // Create a video container element
  var vidContainer = document.createElement("div");
  vidContainer.setAttribute("id", containerName);
  vidContainer.setAttribute("class", "videoContainer");
  vidContainer.appendChild(vidElement);
  vidContainer.appendChild(MakeLabel(localDisplayName));

  // Add the video container to the grid
  document.getElementById("video-grid").appendChild(vidContainer);
}

function GotMessageFromServer(message) {
  var signal = JSON.parse(message.data);
  var peerUuid = signal.uuid;

  // If the signal includes a source room and message data, we know it's a chat message
  if (signal.content) {
    if (signal.roomId === ROOM_ID) {
      SendChatNotification(signal.displayName, signal.content);
    }
  }

  // Ignore messages that are not for us or from ourselves
  if (
    peerUuid == localUser.uuid ||
    (signal.dest != localUser.uuid && signal.dest != "all")
  )
    return;

  // Check if we are the original peer and if they are in the same room
  if (signal.displayName && signal.dest == "all" && signal.roomId === ROOM_ID) {
    // Set up peer connection object for a new peer
    SetUpPeer(peerUuid, signal.displayName);

    // Send the local connection info to the server
    serverConnection.send(
      JSON.stringify({
        roomId: ROOM_ID,
        displayName: localUser.displayName,
        uuid: localUser.uuid,
        dest: peerUuid,
      })
    );

    // Check if we are the new peer and are in the same room
  } else if (
    signal.displayName &&
    signal.dest == localUser.uuid &&
    signal.roomId === ROOM_ID
  ) {
    // Initiate call if we are the new peer
    SetUpPeer(peerUuid, signal.displayName, true);
  } else if (signal.sdp) {
    peerConnections[peerUuid].pc
      .setRemoteDescription(new RTCSessionDescription(signal.sdp))
      .then(function () {
        // Only create answers in response to offers
        if (signal.sdp.type == "offer") {
          peerConnections[peerUuid].pc
            .createAnswer()
            .then((description) => createdDescription(description, peerUuid))
            .catch(ErrorHandler);
        }
      })
      .catch(ErrorHandler);
  } else if (signal.ice) {
    peerConnections[peerUuid].pc
      .addIceCandidate(new RTCIceCandidate(signal.ice))
      .catch(ErrorHandler);
  }
}

function SetUpPeer(peerUuid, displayName, newUser = false) {
  //Store the peer connection
  peerConnections[peerUuid] = {
    displayName: displayName,
    pc: new RTCPeerConnection(peerConnectionConfig),
    recieved: false,
  };

  // When the peer sends it's ice candidates, recieve them
  peerConnections[peerUuid].pc.onicecandidate = (event) =>
    GotIceCandidate(event, peerUuid);

  // When the peer sends it's stream, recieve it and display it
  peerConnections[peerUuid].pc.ontrack = (event) =>
    GotRemoteStream(event, peerUuid);

  // If the ICE connection status changes, check if the user has disconnected
  peerConnections[peerUuid].pc.oniceconnectionstatechange = (event) =>
    CheckPeerDisconnect(event, peerUuid);

  // Add the local stream to the peers list of streams
  peerConnections[peerUuid].pc.addStream(localUser.stream);

  // If this user is the new user, initiate a call with the user
  if (newUser) {
    peerConnections[peerUuid].pc
      .createOffer()
      .then((description) => createdDescription(description, peerUuid))
      .catch(ErrorHandler);
  }
}

function GotIceCandidate(event, peerUuid) {
  if (event.candidate != null) {
    serverConnection.send(
      JSON.stringify({
        ice: event.candidate,
        uuid: localUser.uuid,
        dest: peerUuid,
      })
    );
  }
}

function createdDescription(description, peerUuid) {
  console.log(`Got description, peer ${peerUuid}`);
  // Set the local description of the peer
  peerConnections[peerUuid].pc
    .setLocalDescription(description)
    .then(function () {
      serverConnection.send(
        JSON.stringify({
          sdp: peerConnections[peerUuid].pc.localDescription,
          uuid: localUser.uuid,
          dest: peerUuid,
        })
      );
    })
    .catch(ErrorHandler);
}

function GotRemoteStream(event, peerUuid) {
  // If we have not yet recieved a stream from this peer
  if (peerConnections[peerUuid]["recieved"] === false) {
    // Log the new peer
    console.log(`Got remote stream, peer ${peerUuid}`);

    // Create the new video element for the stream
    CreateVidElement(
      event.streams[0],
      "remoteVideo_" + peerUuid,
      peerConnections[peerUuid].displayName
    );

    SendChatNotification(
      peerConnections[peerUuid].displayName,
      "User has joined the room."
    );

    // Set the stream recieved flag to true
    peerConnections[peerUuid]["recieved"] = true;
  }
}

function CheckPeerDisconnect(event, peerUuid) {
  // Grab the peer state
  var state = peerConnections[peerUuid].pc.iceConnectionState;

  // Log the peer state
  console.log(`connection with peer ${peerUuid} ${state}`);

  // If the state is failed, closed or disconnected, remove the user
  if (state === "failed" || state === "closed" || state === "disconnected") {
    // Send a message that the user has left
    SendChatNotification(
      peerConnections[peerUuid].displayName,
      "User has left the room."
    );

    //Delete the user from the list and remove their video
    delete peerConnections[peerUuid];
    var videoGrid = document.getElementById("video-grid");
    videoGrid.removeChild(document.getElementById("remoteVideo_" + peerUuid));
  }
}

function MakeLabel(label) {
  var vidLabel = document.createElement("div");
  vidLabel.appendChild(document.createTextNode(label));
  vidLabel.setAttribute("class", "videoLabel");
  return vidLabel;
}

function ErrorHandler(error) {
  console.log(error);
  window.location.replace("conferror");
}

function SendChatNotification(displayName, message) {
  var date = new Date();

  // Create a new message item and add it to the message list
  var li = document.createElement("li");
  li.appendChild(
    document.createTextNode(
      "[" +
        ("0" + date.getHours()).slice(-2) +
        ":" +
        ("0" + date.getMinutes()).slice(-2) +
        ":" +
        ("0" + date.getSeconds()).slice(-2) +
        "] " +
        displayName +
        ": " +
        message
    )
  );

  var msg = document.getElementById("messages");
  msg.appendChild(li);
}

function EmitMessage() {
  var msg = document.getElementById("message");

  if (msg.value.length > 0) {
    fullMessage = serverConnection.send(
      JSON.stringify({
        roomId: ROOM_ID,
        displayName: USR_NAME,
        content: msg.value,
      })
    );

    msg.value = "";
  }
}
