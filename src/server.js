const express = require('express');
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const port = 9000;

// 初始化目标压力值
let targetPressure1 = 20.0; // 默认值
let targetPressure2 = 30.0; // 默认值
let targetPressure3 = 40.0; // 新增默认值

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

// 定义 sendToMega2560 函数
function sendToMega2560(target, value) {
  console.log(`Sending to Mega2560: ${target} = ${value}`);
  serialPort.write(`${target}:${value}\n`);
}

// 监听 Mega250 发送的数据
parser.on('data', (data) => {
  const pressureValue = data.trim();
  console.log('Received pressure from server从服务器收到的压力:', pressureValue);
  io.emit('pressureData', pressureValue);
  console.log('发送到前端的压力数据:', pressureValue);
});

// 监听网页上的用户输入
io.on('connection', (socket) => {
  // 监听用户设置的新压力值
  socket.on('newPressure', ({ target, value }) => {
    console.log(`New target pressure for新的压力值:${target}: ${value}`);
    // 更新后端保存的压力值
    if (target === "targetPressure1") {
      targetPressure1 = value;
    } else if (target === "targetPressure2") {
      targetPressure2 = value;
    } else if (target === "targetPressure3") {
      targetPressure3 = value;
    }

    // 将更新的压力值同步到 Mega2560
    sendToMega2560(target, value);

    // 向前端发送更新后的压力值
    io.emit('pressureUpdate', {
      targetPressure1: targetPressure1,
      targetPressure2: targetPressure2,
      targetPressure3: targetPressure3
    });
  });

  // 监听静音模式切换
  socket.on('muteStatus', (status) => {
    muteMode = status;
    console.log('Mute mode changed:', muteMode ? 'ON' : 'OFF');
  });

  // 监听 Reset 按钮点击
  socket.on("resetPressure", () => {
    // 写死的默认压力值
    targetPressure1 = 20.0;
    targetPressure2 = 30.0;
    targetPressure3 = 40.0;

    // 发送默认值到 Mega2560
    sendToMega2560("targetPressure1", targetPressure1);
    sendToMega2560("targetPressure2", targetPressure2);
    sendToMega2560("targetPressure3", targetPressure3);

    // 发送更新后的默认值给所有前端
    io.emit("pressureUpdate", {
      targetPressure1: targetPressure1,
      targetPressure2: targetPressure2,
      targetPressure3: targetPressure3
    });

    console.log("Reset pressures:", targetPressure1, targetPressure2, targetPressure3);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});