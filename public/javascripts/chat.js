'use strict';

var socket;

function chat() {
  // Get input
  var input = $("#message-input");
  if (!input.length) return;

  // var input1 = $("#message-input-room")
  // console.log(input1.val('').trim())

  // Focus text box on load
  //$("#message-input").focus();

  // Connect socket
  socket = io();
  socket.on("connect", () => {
      //console.log("Connected");
  });

  // Send chat line
  $('#message-form').submit(function(e) {
      // Send message
      e.preventDefault();
      const message = $('#message-input').val().trim();
      const username = $('#username').val().trim();
      if (!message) return;
      const data = {
        room: chatRoomSelect.value,
        username: username,
        message: message,
      };
      socket.emit('message', data);
      $('#message-input').val('');
      return false;
  });

  // Send chat line in 3D room
  $('#message-form-room').submit(function(e) {
    // Send message
    e.preventDefault();
    const message = $('#message-input').val().trim();
    const username = $('#username').val().trim();
    console.log('message', message)
    if (!message) return;
    const data = {
      room: chatRoomSelect.value,
      username: username,
      message: message,
    };
    socket.emit('message', data);
    $('#message-input').val('');
    return false;
  });

  // Add a message
  socket.on('message', function(data) {
    showMsg(data.username, data.message)
    addMessage(data.username, data.message);
  });

  socket.on('showmsg', function(data) {
    showMsg(data.username, data.message)
  })

  // When a new chat room is selected
  const chatRoomSelect = document.getElementById('chatRoomSelect');
  chatRoomSelect?.addEventListener('change', joinRoom);

  // When chat history is received
  socket.on('history', (history) => {
    var messageList = $('#messages');
    messageList.innerHTML = '';
    if (history != null) {
      for (const message of history) {
        addMessage(message.username, message.message)
      }
    }
  });

  // Join room
  joinRoom();
}

function joinRoom() {
  const chatRoomSelect = document.getElementById('chatRoomSelect');
  const room = chatRoomSelect?.value;
  if (room) {
    socket.emit('join', { room: room });
    //console.log("Joined " + room)
    var messageList = $('#messages');
    messageList.empty();
  }
};

function addMessage(username, message) {
  var messageList = $('#messages');
  var li = $('<li>').addClass('messenger-message');
  var innerDiv = $('<div>').addClass('messenger-message-inner');
  var message = `<b>${username}:</b> ${message}`;
  innerDiv.append($('<p>').html(message));
  li.append(innerDiv);
  messageList.append(li);

  // Scroll to bottom
  var messageContainer = $('.messenger-message-wrapper');
  messageContainer.scrollTop(messageContainer.prop("scrollHeight"));
}

function showMsg(username, message) {
  document.getElementById('message').innerText = message
}

// Example POST request with CSRF
function request(message) {
  const room = document.getElementById('chatRoomSelect').value;
  const response = $.ajax({
    url: '/request',
    method: 'POST',
    dataType: 'json',
    contentType: 'application/json',
    data: JSON.stringify({ message: message, room: room }),
    headers: { 'X-CSRF-Token': $('#csrf').val() },
  })
  .done(function (response) {
    console.log('Response:', response.response);
  })
  .fail(function (error) {
    console.error('Error:', error);
  });
}

// Run
$(function() {
  chat();
});
