/*Responsible for communication between the front end (webpage) and Arduino (hardware).
*/

//1401 for mega2560
//1102 for uno wifi re2

// server.js

// 只需要一次导入 express
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const port = 9000;

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// 设置静态文件目录，确保 public 文件夹下有静态文件
app.use(express.static(path.join(__dirname, '../public')));

// 路由配置：当访问根路径时返回 index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

// WebSocket 处理
let muteMode = false;  // 初始状态为关闭静音模式
io.on('connection', (socket) => {
  console.log('A user connected');

  // 监听来自前端的静音状态更新
  socket.on('muteStatus', (status) => {
    muteMode = status;  // 更新静音状态
    console.log('Mute mode updated:', muteMode);

    // 将更新后的静音状态广播给所有连接的客户端
    io.emit('muteStatus', muteMode);
  });

  // 启动时发送当前的静音状态到客户端
  socket.emit('muteStatus', muteMode);

  // 断开连接时的处理
  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

// 启动服务器
server.listen(9000, () => {
  console.log('Server is running on http://localhost:9000');
});
