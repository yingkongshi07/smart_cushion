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
  const pressureValueElement = document.getElementById("pressureValue");
  if (pressureValueElement) {
    pressureValueElement.innerText = `targetPressure1: ${data.targetPressure1} kPa, targetPressure2: ${data.targetPressure2} kPa`;
  } else {
    console.error('Element with ID "pressureValue" not found');
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

  if (newPressure1 !== "") {
    socket.emit('newPressure', { target: "targetPressure1", value: newPressure1 });
  }
  if (newPressure2 !== "") {
    socket.emit('newPressure', { target: "targetPressure2", value: newPressure2 });
  }

  console.log("User updated pressures更新的压力值:", newPressure1, newPressure2);
});