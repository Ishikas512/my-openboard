let canvas = document.querySelector("canvas");
canvas.width=window.innerWidth;
canvas.height=window.innerHeight;

let pencilColor = document.querySelectorAll(".pencil-color");
let pencilWidthElem = document.querySelector(".pencil-width");
let erasorWidthElem = document.querySelector(".erasor-width");
let download = document.querySelector(".download");
let redo = document.querySelector(".redo");
let undo = document.querySelector(".undo");

let penColor = "red";
let erasorColor = "white";
let penWidth = pencilWidthElem.value;
let erasorWidth = erasorWidthElem.value;

let undoRedoTracker = [];
let track = 0;

let mouseDown = false;

//API
let tool = canvas.getContext("2d");

tool.strokeStyle = penColor;
tool.lineWidth = penWidth;


canvas.addEventListener("mousedown", (e) => {
    mouseDown = true;
    
    let data = {
        x:e.clientX,
        y:e.clientY
    }
    socket.emit("beginPath",data);
})
canvas.addEventListener("mousemove", (e) => {
    if (mouseDown){
        let data = {
            x: e.clientX ,
            y: e.clientY ,
            color : erasorFlag ? erasorColor : penColor,
            width : erasorFlag ? erasorWidth : penWidth
        }
        socket.emit("drawStroke", data);
    } 
})
canvas.addEventListener("mouseup", (e) => {
    mouseDown = false;

    let url = canvas.toDataURL();
    undoRedoTracker.push(url);
    track = undoRedoTracker.length-1;
})

undo.addEventListener("click", (e) => {
    if(track > 0) track--;
    let data = {
        trackValue: track ,
        undoRedoTracker
    }
    socket.emit("redoUndo", data);
    
})
redo.addEventListener("click", (e) => {
    if (track < undoRedoTracker.length-1) track++;

    let data = {
        trackValue: track ,
        undoRedoTracker
    }
    socket.emit("redoUndo", data);
})

function undoRedoCanvas(trackObj) {
    track = trackObj.trackValue;
    undoRedoTracker = trackObj.undoRedoTracker;

    let url = undoRedoTracker[track];
    let img = new Image();
    img.src = url;
    img.onload = (e) => {
        tool.drawImage(img, 0, 0, canvas.width, canvas.height);
    }
}

function beginPath(strokeObj) {
    tool.beginPath();
    tool.moveTo(strokeObj.x,strokeObj.y);
}
function drawStroke(strokeObj) {
    tool.strokeStyle = strokeObj.color;
    tool.lineWidth = strokeObj.width;
    tool.lineTo(strokeObj.x,strokeObj.y);
    tool.stroke();
}

pencilColor.forEach((colorElem) => {
    colorElem.addEventListener("click", (e) => {
        let color = colorElem.classList[0];
        penColor = color;
        tool.strokeStyle = penColor;
    })
})

pencilWidthElem.addEventListener("change", (e) => {
    penWidth = pencilWidthElem.value;
    tool.lineWidth = penWidth;
})
erasorWidthElem.addEventListener("change", (e) => {
    erasorWidth = erasorWidthElem.value;
    tool.lineWidth = erasorWidth;
})
erasor.addEventListener("click", (e) => {
    if (erasorFlag){
        tool.strokeStyle = erasorColor;
        tool.lineWidth = erasorWidth;
    }
    else {
        tool.strokeStyle = penColor;
        tool.lineWidth = penWidth;
    }
})

download.addEventListener("click", (e) => {
    let url = canvas.toDataURL();

    let a = document.createElement("a");
    a.href=url;
    a.download = "board.jpg";
    a.click();
})


socket.on("beginPath", (data) => {
    beginPath(data);
})
socket.on("drawStroke", (data) => {
    drawStroke(data);
})
socket.on("redoUndo", (data) => {
    undoRedoCanvas(data);
})