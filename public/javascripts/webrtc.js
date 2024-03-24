'use strict';

// WebRTC

// TURN and STUN servers
var pcConfig = {
  iceServers: [{   
      urls: [
        "stun:bn-turn1.xirsys.com",
        "stun:stun.l.google.com:19302",
        ]
    }, {
      username: "0kYXFmQL9xojOrUy4VFemlTnNPVFZpp7jfPjpB3AjxahuRe4QWrCs6Ll1vDc7TTjAAAAAGAG2whXZWJUdXRzUGx1cw==",   
      credential: "285ff060-5a58-11eb-b269-0242ac140004",   
      urls: [
        "turn:bn-turn1.xirsys.com:80?transport=udp",       
        "turn:bn-turn1.xirsys.com:3478?transport=udp",       
        "turn:bn-turn1.xirsys.com:80?transport=tcp",       
        "turn:bn-turn1.xirsys.com:3478?transport=tcp",       
        "turns:bn-turn1.xirsys.com:443?transport=tcp",       
        "turns:bn-turn1.xirsys.com:5349?transport=tcp",
        "turn:openrelay.metered.ca:443",
       ]
    }
  ]
};

// Room
var room = 'Drinks';

// State
var pc;
var socket;
var isChannelReady = false;
var isInitiator = false;
var isStarted = false;
var turnReady = false;
var localStream;
var remoteStream;

// Selectors
const audioInputSelect = document.querySelector('select#audioSource');
const audioOutputSelect = document.querySelector('select#audioOutput');
const videoSelect = document.querySelector('select#videoSource');
const selectors = [audioInputSelect, audioOutputSelect, videoSelect];

// Video
var localVideo = document.querySelector('#localVideo');
var remoteVideo = document.querySelector('#remoteVideo');

// Start
function startWebRTC() {
  // Connect
  socket = io.connect();

  // Join room
  if (room !== '') {
    socket.emit('create or join', room);
    //console.log('Joining: ', room);
  }

  // Socket events
  socket.on('created', function(room) {
    //console.log('Created room ' + room);
    isInitiator = true;
  });
  socket.on('full', function(room) {
    console.log('Room ' + room + ' is full');
  });
  socket.on('join', function (room){
    //console.log('Another peer made a request to join room ' + room);
    //console.log('This peer is the initiator of room ' + room);
    isChannelReady = true;
  });
  socket.on('joined', function(room) {
    //console.log('Joined: ' + room);
    isChannelReady = true;
  });
  socket.on('log', function(array) {
    //console.log.apply(console, array);
  });
  socket.on('message', function(message) {
    //console.log('Received message:', message);
    if (message === 'got user media') {
      start();
    } else if (message.type === 'offer') {
      if (!isInitiator && !isStarted) {
        start();
      }
      pc.setRemoteDescription(new RTCSessionDescription(message));
      doAnswer();
    } else if (message.type === 'answer' && isStarted) {
      pc.setRemoteDescription(new RTCSessionDescription(message));
    } else if (message.type === 'candidate' && isStarted) {
      var candidate = new RTCIceCandidate({
        sdpMLineIndex: message.label,
        candidate: message.candidate
      });
      pc.addIceCandidate(candidate);
    } else if (message === 'bye' && isStarted) {
      handleRemoteHangup();
    }
  });

  // Query devices
  audioInputSelect.onchange = startMedia;
  audioOutputSelect.onchange = changeAudioDestination;
  videoSelect.onchange = startMedia;

  // Start camera and mic
  startMedia();
}

// Click
$('.dot').on('click', (e) => {
  $('.sources').css("display", "inline-block");
  $('.dot').css("display", "none");
});

function startMedia() {
  // Open mic and camera
  if (typeof navigator.mediaDevices == 'undefined') {
    console.log("Error opening camera");
  }
  else {
    // Stop
    if (window.stream) { window.stream.getTracks().forEach(track => { track.stop(); }); }
    const audioSource = audioInputSelect.value;
    const videoSource = videoSelect.value;
    const constraints = {
      audio: {deviceId: audioSource ? {exact: audioSource} : undefined},
      video: {deviceId: videoSource ? {exact: videoSource} : undefined}
    };
    navigator.mediaDevices.getUserMedia(constraints).then(gotStream).catch(handleError);
  }
}

function gotStream(stream) {
  //console.log('Adding local stream.');
  window.stream = stream;
  localStream = stream;
  localVideo.srcObject = stream;
  sendMessage('got user media');
  if (isInitiator) start();
  navigator.mediaDevices.enumerateDevices();
}

function start() {
  //console.log('Start:', localStream);
  if (!isStarted && typeof localStream !== 'undefined' && isChannelReady) {
    //console.log('Creating peer connection');
    createPeerConnection();
    pc.addStream(localStream);
    isStarted = true;
    //console.log('isInitiator', isInitiator);
    if (isInitiator) {
      doCall();
    }
  }
}

function createPeerConnection() {
  try {
    pc = new RTCPeerConnection(pcConfig);
    //console.log(pcConfig);
    //console.log(pc);
    pc.onicecandidate = handleIceCandidate;
    pc.onaddstream = handleRemoteStreamAdded;
    pc.onremovestream = handleRemoteStreamRemoved;
    //console.log('Created RTCPeerConnnection');
  } catch (e) {
    console.log('Failed to create PeerConnection, exception: ' + e.message);
    alert('Cannot create RTCPeerConnection object.');
    return;
  }
}

function handleIceCandidate(event) {
  //console.log('Candidate event: ', event);
  if (event.candidate) {
    sendMessage({
      type: 'candidate',
      label: event.candidate.sdpMLineIndex,
      id: event.candidate.sdpMid,
      candidate: event.candidate.candidate
    });
  } else {
    //console.log('End of candidates.');
  }
}

function handleCreateOfferError(event) {
  console.log('createOffer() error: ', event);
}

function doCall() {
  //console.log('Sending offer to peer');
  pc.createOffer(setLocalAndSendMessage, handleCreateOfferError);
}

function doAnswer() {
  //console.log('Sending answer.');
  pc.createAnswer().then(
    setLocalAndSendMessage,
    onCreateSessionDescriptionError
  );
}

function setLocalAndSendMessage(sessionDescription) {
  pc.setLocalDescription(sessionDescription);
  //console.log('setLocalAndSendMessage sending message', sessionDescription);
  sendMessage(sessionDescription);
}

function onCreateSessionDescriptionError(error) {
  trace('Failed to create session description: ' + error.toString());
}

function handleRemoteStreamAdded(event) {
  //console.log('Remote stream added.');
  remoteStream = event.stream;
  remoteVideo.srcObject = remoteStream;
}

function handleRemoteStreamRemoved(event) {
  console.log('Remote stream removed. Event: ', event);
}

function sendMessage(message) {
  //console.log('Sending message:', message);
  socket.emit('message', message);
}

function hangup() {
  console.log('Hanging up.');
  stop();
}

function handleRemoteHangup() {
  console.log('Session terminated.');
  stop();
  isInitiator = false;
}

function stop() {
  isStarted = false;
  pc.close();
  pc = null;
}

window.onbeforeunload = function() {
  if (socket != null) sendMessage('bye');
};

navigator.mediaDevices.enumerateDevices().then(gotDevices).catch(handleError);

function changeAudioDestination() {
  const audioDestination = audioOutputSelect.value;
  attachSinkId(localVideo, audioDestination);
}
function attachSinkId(element, sinkId) {
  if (typeof element.sinkId !== 'undefined') {
    element.setSinkId(sinkId)
        .then(() => {
          //console.log(`Success, audio output device attached: ${sinkId}`);
        })
        .catch(error => {
          let errorMessage = error;
          if (error.name === 'SecurityError') {
            errorMessage = `You need to use HTTPS for selecting audio output device: ${error}`;
          }
          console.error(errorMessage);
          // Jump back to first output device in the list as it's the default.
          audioOutputSelect.selectedIndex = 0;
        });
  } else {
    console.warn('Browser does not support output device selection.');
  }
}
function gotDevices(deviceInfos) {
  if (selectors[0] == null) return;
  const values = selectors.map(select => select.value);
  selectors.forEach(select => {
    while (select.firstChild) {
      select.removeChild(select.firstChild);
    }
  });
  for (let i = 0; i !== deviceInfos.length; ++i) {
    const deviceInfo = deviceInfos[i];
    const option = document.createElement('option');
    option.value = deviceInfo.deviceId;
    if (deviceInfo.kind === 'audioinput') {
      option.text = deviceInfo.label || `microphone ${audioInputSelect.length + 1}`;
      audioInputSelect.appendChild(option);
    } else if (deviceInfo.kind === 'audiooutput') {
      option.text = deviceInfo.label || `speaker ${audioOutputSelect.length + 1}`;
      audioOutputSelect.appendChild(option);
    } else if (deviceInfo.kind === 'videoinput') {
      option.text = deviceInfo.label || `camera ${videoSelect.length + 1}`;
      videoSelect.appendChild(option);
    } else {
      console.log('Some other kind of source/device: ', deviceInfo);
    }
  }
  selectors.forEach((select, selectorIndex) => {
    if (Array.prototype.slice.call(select.childNodes).some(n => n.value === values[selectorIndex])) {
      select.value = values[selectorIndex];
    }
  });
}
function handleError(error) {
  console.log('navigator.MediaDevices.getUserMedia error: ', error.message, error.name);
}

