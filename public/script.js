const socket = io();
const muteSwitch = document.getElementById("muteSwitch");

function toggleMute() {
  const muteStatus = muteSwitch.checked;
  console.log('Mute mode changed:', muteStatus ? 'ON' : 'OFF');
  socket.emit('muteStatus', muteStatus);
}

window.onload = function() {
  muteSwitch.checked = false;
  socket.emit('muteStatus', false);
};

socket.on('pressureUpdate', (data) => {
  if (data.targetPressure1 !== undefined) {
    document.getElementById("pressureInput1").value = data.targetPressure1;
  }
  if (data.targetPressure2 !== undefined) {
    document.getElementById("pressureInput2").value = data.targetPressure2;
  }
  if (data.targetPressure3 !== undefined) {
    document.getElementById("pressureInput3").value = data.targetPressure3;
  }
  console.log('监听后端发送的压力值:', data);
});

document.addEventListener("DOMContentLoaded", function() {
  const resetButton = document.getElementById("resetButton");
  if (resetButton) {
    resetButton.addEventListener("click", resetPressure);
  } else {
    console.error("resetButton not found!");
  }
});

function resetPressure() {
  socket.emit('resetPressure');
  console.log("Reset pressure command sent.");
}

document.getElementById("updateButton").addEventListener("click", function() {
  console.log("进入updateButton测试");
  const newPressure1 = document.getElementById("pressureInput1").value;
  const newPressure2 = document.getElementById("pressureInput2").value;
  const newPressure3 = document.getElementById("pressureInput3").value;

  if (newPressure1 !== "") {
    socket.emit('newPressure', { target: "targetPressure1", value: newPressure1 });
  }
  if (newPressure2 !== "") {
    socket.emit('newPressure', { target: "targetPressure2", value: newPressure2 });
  }
  if (newPressure3 !== "") {
    socket.emit('newPressure', { target: "targetPressure3", value: newPressure3 });
  }

  console.log("User updated pressures更新的压力值:", newPressure1, newPressure2, newPressure3);
});