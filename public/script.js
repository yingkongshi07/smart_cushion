// 连接到后端的 WebSocket
const socket = io();
// 获取页面上的静音开关元素
const muteSwitch = document.getElementById("muteSwitch");

// 监听静音开关状态变化
function toggleMute() {
  const muteStatus = muteSwitch.checked;  // 获取静音开关的状态
  console.log('Mute mode changed:', muteStatus ? 'ON' : 'OFF'); // ✅ 在前端也打印
  socket.emit('muteStatus', muteStatus);  // 将状态发送到后端
}

// 页面加载完成后，初始化静音开关的状态
window.onload = function() {
  // 初始化静音模式，默认是关闭的
  muteSwitch.checked = false;
  // 在页面加载时发送静音模式状态到后端
  socket.emit('muteStatus', false);  // 默认静音模式关闭
};

// 监听后端发送的静音模式状态更新
socket.on('muteStatus', (status) => {
  muteSwitch.checked = status;  // 更新静音开关的状态
  console.log('Mute mode status:', status ? 'Open' : 'Close');// ✅ 确保服务器状态同步回来
});

// 监听后端发送的压力值
socket.on('pressure', (pressure) => {
  document.getElementById("pressureValue").innerText = pressure;
  console.log('监听后端发送的压力值:',pressure);// ✅ 确保服务器状态同步回来
});

// 处理更新压力值
/* document.getElementById('updateButton').addEventListener('click', function() {
  const pressure = document.getElementById('pressureInput').value;
  if (pressure) {
    console.log('User updated pressure:', pressure); // ✅ 在前端也打印用户的输入值
    socket.emit('updatePressure', pressure);
  }
}); */

// 重置压力值
document.addEventListener("DOMContentLoaded", function() {
  console.log('打印script的重置add event listener');
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

    socket.emit('newPressure', { target: "targetPressure1", value: newPressure1 });
    socket.emit('newPressure', { target: "targetPressure2", value: newPressure2 });

    console.log("User updated pressures更新的压力值:", targetPressure1, targetPressure2);
});
