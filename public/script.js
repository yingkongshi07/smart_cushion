const socket = io();


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
  console.log('Received updated target pressures:', data);
});

socket.on('pressureData', (data) => {
  if (typeof data !== 'string') {
    console.error('Invalid data format received:', data);
    return;
  }

  const pressures = data.split("\t");
  if (pressures.length < 3) {
    console.error('Invalid pressure data format:', data);
    return;
  }

  pressures.forEach(pressure => {
    const [key, value] = pressure.split(":");
    if (!key || !value) {
      console.error('Invalid key-value pair:', pressure);
      return;
    }

    const elementId = key.trim();
    const element = document.getElementById(elementId);
    if (element) {
      element.textContent = value.trim();
    } else {
      console.error(`Element with ID ${elementId} not found.`);
    }
  });
});

document.addEventListener("DOMContentLoaded", function() {
  const resetButton = document.getElementById("resetButton");
  if (resetButton) {
    resetButton.addEventListener("click", resetPressure);
  } else {
    console.error("resetButton not found!");
  }

  const deflateButton12 = document.getElementById("deflateButton12");
  if (deflateButton12) {
    deflateButton12.addEventListener("click", () => {
      socket.emit('deflate', { chambers: [2, 3] }); // 放气气室 2 和 3
    });
  }

  const deflateButton3 = document.getElementById("deflateButton3");
  if (deflateButton3) {
    deflateButton3.addEventListener("click", () => {
      socket.emit('deflate', { chambers: [1] }); // 放气气室 1
    });
  }

  const stopAllButton = document.getElementById("stopAllButton");
  if (stopAllButton) {
    stopAllButton.addEventListener("click", () => {
      socket.emit('stopAllPumps'); // 停止所有泵
    });
  }
});

function resetPressure() {
  socket.emit('resetPressure');
  console.log("Reset pressure command sent.");
}

document.getElementById("updateButton").addEventListener("click", function() {
  console.log("Update button clicked");
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

  console.log("User updated pressures:", newPressure1, newPressure2, newPressure3);
});