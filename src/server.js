/*Responsible for communication between the front end (webpage) and Arduino (hardware).
*/
const express = require('express');
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const port = 9000;

// 处理 HTTP 请求
app.use(express.static(path.join(__dirname, '../public')));

// 启动服务器
const server = app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

// WebSocket 服务器
const io = socketIo(server);

// 连接 Arduino Mega2560
const serialPort = new SerialPort({
  path: '/dev/tty.usbmodem11101',
  baudRate: 9600
});

const parser = serialPort.pipe(new ReadlineParser({ delimiter: '\n' }));

// 记录静音模式状态
let muteMode = false;

// 监听 Mega2560 发送的数据
parser.on('data', (data) => {
  const pressureValue = data.trim();
  console.log('Received pressure from server从服务器收到的压力:', pressureValue);// 确保这个日志有输出
  io.emit('pressureData', pressureValue);// ✅ 发送压力数据到前端
  console.log('发送到前端的压力数据:', pressureValue);
});

// 监听网页上的用户输入
io.on('connection', (socket) => {

  // 监听用户设置的新压力值
  socket.on('newPressure', ({ target, value }) => {
    console.log(`New target pressure for新的压力值:${target}: ${value}`);
    // 更新后端保存的压力值
    if (target === "targetPressure1") {
      targetPressure1 = value;  // 更新后端的 targetPressure1
  } else if (target === "targetPressure2") {
      targetPressure2 = value;  // 更新后端的 targetPressure2
  }

    // 将更新的压力值同步到 Mega2560
  sendToMega2560(target, value);

  // 向前端发送更新后的压力值
  io.emit('pressureUpdate', { pressure: value });
  });

// 监听后端发送的压力值
socket.on('pressureUpdate', (data) => {
  document.getElementById("pressureValue").innerText = data.pressure;
  console.log('监听后端发送的压力值:', data.pressure);
});



  // 监听静音模式切换
  socket.on('muteStatus', (status) => {
    muteMode = status;  // 更新静音模式状态
    console.log('Mute mode changed:', muteMode ? 'ON' : 'OFF');
  });

  // 监听 Reset 按钮点击
  socket.on("resetPressure", () => {
    // 从 Mega2560 获取默认压力值
    getDefaultPressuresFromMega2560()
      .then(({ defaultTargetPressure1, defaultTargetPressure2 }) => {
        targetPressure1 = defaultTargetPressure1;
        targetPressure2 = defaultTargetPressure2;
  
        // 发送更新后的默认值给所有前端
        io.emit("pressureUpdate", {
          targetPressure1: defaultTargetPressure1,
          targetPressure2: defaultTargetPressure2
        });
  
        console.log("Reset pressures:", defaultTargetPressure1, defaultTargetPressure2);
      })
      .catch((err) => console.error("Error resetting pressures:", err));
  });
  

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});