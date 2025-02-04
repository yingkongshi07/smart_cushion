// script.js

// 连接到后端的 WebSocket
const socket = io();

// 获取页面上的静音开关元素
const muteSwitch = document.getElementById("muteSwitch");

// 监听静音开关状态变化
function toggleMute() {
  const muteStatus = muteSwitch.checked;  // 获取静音开关的状态
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
  console.log('Mute mode status:', status ? 'Open' : 'Close');
});

// 监听后端发送的压力值
socket.on('pressure', (pressure) => {
  document.getElementById("pressureValue").innerText = pressure;
});

// 处理更新压力值（示例功能）
document.getElementById('updateButton').addEventListener('click', function() {
  const pressure = document.getElementById('pressureInput').value;
  if (pressure) {
    socket.emit('updatePressure', pressure);
  }
});

// 重置压力值
function resetPressure() {
  socket.emit('resetPressure');
}
