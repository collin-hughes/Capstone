const WS_PORT = 5000; //make sure this matches the port for the webscokets server

var localUuid;
var localDisplayName;
var localStream;
var serverConnection;
var peerConnections = {};

var peerConnectionConfig = {
  'iceServers': [
    { 'urls': 'stun:stun.stunprotocol.org:3478' },
    { 'urls': 'stun:stun.l.google.com:19302' },
  ]
};

function start() {
  localUuid = createUUID();

  // Set the local display name for the user
  localDisplayName = USR_NAME;

  // specify no audio for user media
  var constraints = {
    video: {
      width: {max: 320},
      height: {max: 240},
      frameRate: {max: 30},
    },
    audio: true,
  };

  // set up local video stream
  if (navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia(constraints)
      .then(stream => {
        localStream = stream;
      
        var vidElement = document.createElement("video");
        vidElement.setAttribute("autoplay", "");
        vidElement.setAttribute("muted", "");
        vidElement.srcObject = stream;
        vidElement.muted = true;

        var vidContainer = document.createElement("div");
        vidContainer.setAttribute("id", "localVideo");
        vidContainer.setAttribute("class", "videoContainer");
        vidContainer.appendChild(vidElement);
        vidContainer.appendChild(makeLabel(localDisplayName));

        document.getElementById("video-grid").appendChild(vidContainer);
      
        SendChatNotification("You have joined the chat.");

      }).catch(errorHandler)

      // set up websocket and message all existing clients
      .then(() => {
        serverConnection = new WebSocket('wss://' + window.location.hostname + ':' + WS_PORT);
        serverConnection.onmessage = gotMessageFromServer;
        serverConnection.onopen = event => {
          serverConnection.send(JSON.stringify({ 'roomId': ROOM_ID, 'displayName': localDisplayName, 'uuid': localUuid, 'dest': 'all' }));
        }
      }).catch(errorHandler);

  } else {
    alert('Your browser does not support getUserMedia API');
  }
}

function gotMessageFromServer(message) {
    var signal = JSON.parse(message.data);
    var peerUuid = signal.uuid;
    
    //console.log(signal)

      if(signal.sourceRoom && signal.msgData)
      {
        if(signal.sourceRoom === ROOM_ID)
          SendChatNotification(signal.msgData);
      }

      // Ignore messages that are not for us or from ourselves
      if (
        peerUuid == localUuid ||
        (signal.dest != localUuid && signal.dest != "all")
      )
        return;

      // Check if we are the original peer and if they are in the same room
      if (signal.displayName && signal.dest == "all" && signal.roomId === ROOM_ID) {
        // Set up peer connection object for a new peer
        setUpPeer(signal.roomId, peerUuid, signal.displayName);

        serverConnection.send(
          JSON.stringify({
            roomId: signal.roomId,
            displayName: localDisplayName,
            uuid: localUuid,
            dest: peerUuid,
          })
        );

        // Check if we are the new peer and are in the same room
      } else if (signal.displayName && signal.dest == localUuid && signal.roomId === ROOM_ID) {
        // Initiate call if we are the new peer
        setUpPeer(signal.roomId, peerUuid, signal.displayName, true);
      } 

      else if (signal.sdp) {
        peerConnections[peerUuid].pc
          .setRemoteDescription(new RTCSessionDescription(signal.sdp))
          .then(function () {
            // Only create answers in response to offers
            if (signal.sdp.type == "offer") {
              peerConnections[peerUuid].pc
                .createAnswer()
                .then((description) =>
                  createdDescription(description, peerUuid)
                )
                .catch(errorHandler);
            }
          })
          .catch(errorHandler);
      } else if (signal.ice) {
        peerConnections[peerUuid].pc
          .addIceCandidate(new RTCIceCandidate(signal.ice))
          .catch(errorHandler);
      }
    }

function setUpPeer(roomId, peerUuid, displayName, initCall = false) {
  peerConnections[peerUuid] = {
    displayName: displayName,
    pc: new RTCPeerConnection(peerConnectionConfig),
    recieved: false,
  };

    peerConnections[peerUuid].pc.onicecandidate = (event) =>
      gotIceCandidate(event, peerUuid);

    peerConnections[peerUuid].pc.ontrack = (event) =>
    {  
      gotRemoteStream(event, peerUuid);
    }

    peerConnections[peerUuid].pc.oniceconnectionstatechange = (event) =>
      checkPeerDisconnect(event, peerUuid);

    peerConnections[peerUuid].pc.addStream(localStream);


  if (initCall) {
    peerConnections[peerUuid].pc
      .createOffer()
      .then((description) => createdDescription(description, peerUuid))
      .catch(errorHandler);
  }
  //}

  SendChatNotification("You are in a chat with " + displayName + ".");
}

function gotIceCandidate(event, peerUuid) {
  if (event.candidate != null) {
    serverConnection.send(JSON.stringify({ 'ice': event.candidate, 'uuid': localUuid, 'dest': peerUuid }));
  }
}

function createdDescription(description, peerUuid) {
  console.log(`got description, peer ${peerUuid}`);
  peerConnections[peerUuid].pc.setLocalDescription(description).then(function () {
    serverConnection.send(JSON.stringify({ 'sdp': peerConnections[peerUuid].pc.localDescription, 'uuid': localUuid, 'dest': peerUuid }));
  }).catch(errorHandler);
}

function gotRemoteStream(event, peerUuid) {
  if (peerConnections[peerUuid]["recieved"] === false) {
    // Log the new peer
    console.log(`got remote stream, peer ${peerUuid}`);

    //  Create a new video element for the stream
    var vidElement = document.createElement("video");
    vidElement.setAttribute("autoplay", "");
    vidElement.setAttribute("muted", "");
    vidElement.srcObject = event.streams[0];

    var vidContainer = document.createElement("div");
    vidContainer.setAttribute("id", "remoteVideo_" + peerUuid);
    vidContainer.setAttribute("class", "videoContainer");
    vidContainer.appendChild(vidElement);
    vidContainer.appendChild(makeLabel(peerConnections[peerUuid].displayName));

    document.getElementById("video-grid").appendChild(vidContainer);
    peerConnections[peerUuid]["recieved"] = true;
  }
}

function checkPeerDisconnect(event, peerUuid) {
  var state = peerConnections[peerUuid].pc.iceConnectionState;
  console.log(`connection with peer ${peerUuid} ${state}`);
  if (state === "failed" || state === "closed" || state === "disconnected") {
    SendChatNotification(
      peerConnections[peerUuid].displayName + " has left the chat."
    );
    delete peerConnections[peerUuid];
    document.getElementById('video-grid').removeChild(document.getElementById('remoteVideo_' + peerUuid));
  }
}

function makeLabel(label) {
  var vidLabel = document.createElement('div');
  vidLabel.appendChild(document.createTextNode(label));
  vidLabel.setAttribute('class', 'videoLabel');
  return vidLabel;
}

function errorHandler(error) {
  console.log(error);
}

// Taken from http://stackoverflow.com/a/105074/515584
// Strictly speaking, it's not a real UUID, but it gets the job done here
function createUUID() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
  }

  return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}

function SendChatNotification(message)
{
   var date = new Date();
   var msg = document.getElementById("messages");

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
         message
     )
   );

   msg.appendChild(li);
}

function EmitMessage()
{
  var msg = document.getElementById("message");
  
  if(msg.value.length > 0)
  {
  fullMessage = serverConnection.send(
    JSON.stringify({
      sourceRoom: ROOM_ID,
      msgData: USR_NAME + ": " + msg.value,
    })
  );

  msg.value = "";
  }
}

function SendMessage(message) {
  // Create a new date object  
  var date = new Date();
  
  //Grab the messages object
  var msg = document.getElementById("messages");

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
        message
    )
  );

  msg.appendChild(li);
}