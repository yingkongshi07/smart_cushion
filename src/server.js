const express = require('express');
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const port = 9000;

// 初始化目标压力值
let targetPressure1 = 20.0; // 默认值
let targetPressure2 = 30.0; // 默认值
let targetPressure3 = 40.0; // 默认值

// 处理 HTTP 请求
app.use(express.static(path.join(__dirname, '../public')));

// 启动服务器
const server = app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

// WebSocket 服务器
const io = new Server(server);

// 连接 Arduino Mega2560
const serialPort = new SerialPort({
  path: '/dev/tty.usbmodem11101',
  baudRate: 9600
});

const parser = serialPort.pipe(new ReadlineParser({ delimiter: '\n' }));

// 定义 sendToMega2560 函数
function sendToMega2560(target, value) {
  serialPort.write(`${target}:${value}\n`);
}

// 监听 Mega2560 发送的数据
parser.on('data', (data) => {
  const pressureData = data.trim();
  console.log('Received pressure data from Arduino:', pressureData);

  // 验证数据格式是否正确
  const isValidFormat = pressureData.split("\t").every(part => {
    const [key, value] = part.split(":");
    return key && value && !isNaN(parseFloat(value)); // 确保 key 和 value 都存在且 value 是有效的数字
  });

  if (isValidFormat) {
    io.emit('pressureData', pressureData); // 发送压力数据到前端
  } else {
    console.log('Debug message or invalid data:', pressureData); // 打印调试信息或无效数据
  }
});

// 监听网页上的用户输入
io.on('connection', (socket) => {
  console.log('Client connected');

  // 监听用户设置的新压力值
  socket.on('newPressure', ({ target, value }) => {
    console.log(`New target pressure for ${target}: ${value}`);
    // 更新后端保存的压力值
    if (target === "targetPressure1") {
      targetPressure1 = parseFloat(value);
    } else if (target === "targetPressure2") {
      targetPressure2 = parseFloat(value);
    } else if (target === "targetPressure3") {
      targetPressure3 = parseFloat(value);
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


  // 监听停止所有泵的命令
  socket.on('stopAllPumps', () => {
    console.log('Stop All button clicked');
    sendToMega2560("stopAllPumps", "");
  });

  // 监听放气按钮点击
  socket.on("deflate", ({ chambers }) => {
    console.log(`Deflate chambers: ${chambers}`);
    chambers.forEach(chamber => {
      if (chamber === 1) {
        sendToMega2560("deflateChamber1", "start");
      } else if (chamber === 2) {
        sendToMega2560("deflateChamber2", "start");
      } else if (chamber === 3) {
        sendToMega2560("deflateChamber3", "start");
      }
    });
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});