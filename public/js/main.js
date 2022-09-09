const socket = io();
const chatForm = document.getElementById("chat-form");
const chatMessage = document.querySelector(".chat-messages");

//get user, room name using query string
const {username, room} = Qs.parse(location.search, {
  ignoreQueryPrefix: true
});

//send userinfo to the server
socket.emit('joinRoom',{username, room});

//get user and room info, update UI
socket.on('roomUsers', (obj) => {
  document.getElementById("room-name").innerHTML = obj.room;
  document.getElementById("users").innerHTML = "";
  const userList = obj.users;
  userList.forEach(updateUser);
});

//function to update user UI
function updateUser(user) {
  const ul = document.getElementById("users");
  const li = document.createElement("li");
  li.appendChild(document.createTextNode(user.username));
  ul.appendChild(li);
}

//whatever message sent by server gets displayed in console and output
socket.on("message",(obj) => {
  console.log(obj);
  outputMessage(obj);

  //scroll when new messages get added
  chatMessage.scrollTop = chatMessage.scrollHeight;
});

chatForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const msg = e.target.elements.msg.value;
  //send the message to server
  socket.emit('chatMessage',msg);

  //clear the input and get the focus back
  e.target.elements.msg.value = "";
  e.target.elements.msg.focus();
});


function outputMessage(obj) {
  const div = document.createElement('div');
  div.classList.add('message');
  div.innerHTML = `
  <p> ${obj.username} <span> ${obj.time} </span> </p>
  <p>
  ${obj.text}
  </p>
  `;
  document.querySelector(".chat-messages").appendChild(div);
}
