let selectedMustacheIndex = 0; // Default mustache index

// Array of mustache URLs
const mustacheURLs = [
  "https://i.ibb.co/89nsh5h/IDK-Glasses.png",
];

const cycleMustache = (direction) => {
  selectedMustacheIndex += direction;
  if (selectedMustacheIndex < 0) {
    selectedMustacheIndex = mustacheURLs.length - 1;
  } else if (selectedMustacheIndex >= mustacheURLs.length) {
    selectedMustacheIndex = 0;
  }
  changeMustacheType();
};

// Event listeners for cycling mustaches
$("#prevMustache").click(() => cycleMustache(-1));
$("#nextMustache").click(() => cycleMustache(1));

// Function to change mustache type based on the selected index
const changeMustacheType = () => {
  tr.visible(false); // Hide the transformer before destroying the existing mustache
  if (mustache) {
    mustache.destroy(); // Remove the existing mustache
  }
  addMustacheToCanvas(mustacheURLs[selectedMustacheIndex]); // Add the new mustache
};

$("#resetMustache").click(() => {
  selectedMustacheIndex = 1; // Reset mustache index to starting one
  changeMustacheType(); // Change mustache type to the starting one
});

let fixedCanvasWidth, maxCanvasHeight;

if (window.innerWidth <= 768) {
  fixedCanvasWidth = 350;
  maxCanvasHeight = 350;
} else {
  fixedCanvasWidth = 600;
  maxCanvasHeight = 600;
}

const stage = new Konva.Stage({
  container: "canvas-container",
  width: fixedCanvasWidth,
  height: maxCanvasHeight,
});

const layer = new Konva.Layer();
stage.add(layer);

let mustache;
let canvasBorder;
let tr;

const addMustacheToCanvas = (mustacheImageSrc) => {
  if (mustache) {
    mustache.destroy();
    tr.destroy();
  }

  canvasBorder = new Konva.Rect({
    width: stage.width(),
    height: stage.height(),
  });

  layer.add(canvasBorder);

  Konva.Image.fromURL(mustacheImageSrc, (img) => {
    mustache = img;
    const aspectRatio = img.width() / img.height();

    let newMustacheWidth, newMustacheHeight;

    if (window.innerWidth <= 768) {
      newMustacheWidth = 200;
      newMustacheHeight = 200 / aspectRatio;
    } else {
      newMustacheWidth = 500;
      newMustacheHeight = 500 / aspectRatio;
    }

    if (newMustacheHeight > maxCanvasHeight) {
      newMustacheHeight = maxCanvasHeight;
      newMustacheWidth = maxCanvasHeight * aspectRatio;
    }

    mustache.setAttrs({
      width: newMustacheWidth,
      height: newMustacheHeight,
      x: (stage.width() - newMustacheWidth) / 2,
      y: (stage.height() - newMustacheHeight) / 2,
      name: "mustache",
      draggable: true,
    });

    tr = new Konva.Transformer({
      nodes: [mustache],
      enabledAnchors: [
        "top-left",
        "top-right",
        "bottom-left",
        "bottom-right",
      ],
      keepRatio: true,
      boundBoxFunc: (oldBox, newBox) => {
        if (
          Math.abs(newBox.width) < 10 ||
          Math.abs(newBox.height) < 10
        ) {
          return oldBox;
        }
        return newBox;
      },
      padding: 10,
      rotateEnabled: true,
    });

    mustache.on("click tap", () => {
      if (window.innerWidth <= 768) {
        tr.visible(!tr.visible());
        layer.batchDraw();
      } else {
        tr.visible(!tr.visible());
        layer.batchDraw();
      }
    });

    tr.visible(mustache.draggable()); // Set transformer visibility based on mustache draggable property

    layer.add(canvasBorder);
    layer.add(mustache);
    layer.add(tr);
    tr.visible(false);

    layer.batchDraw();
  });
};

const changeCanvasBackground = (imageSrc) => {
  const background = new Image();
  background.onload = function () {
    const aspectRatio = background.width / background.height;

    let newCanvasWidth = fixedCanvasWidth;
    let newCanvasHeight = fixedCanvasWidth / aspectRatio;

    if (newCanvasHeight > maxCanvasHeight) {
      newCanvasHeight = maxCanvasHeight;
      newCanvasWidth = maxCanvasHeight * aspectRatio;
    }

    stage.width(newCanvasWidth);
    stage.height(newCanvasHeight);

    canvasBorder.width(newCanvasWidth);
    canvasBorder.height(newCanvasHeight);

    const bg = new Konva.Image({
      image: background,
      width: newCanvasWidth,
      height: newCanvasHeight,
    });

    layer.destroyChildren();
    layer.add(bg);
    addMustacheToCanvas(mustacheURLs[selectedMustacheIndex]); // Add mustache based on the selected type
    layer.batchDraw();
    $("#uploadButton").hide();
    $("#closeButton").show();
    $("#saveButton").show();
  };
  background.src = imageSrc;
};

const saveCanvasAsImage = () => {
  tr.visible(false);
  layer.batchDraw();

  const dataURL = stage.toDataURL({
    mimeType: "image/png",
    quality: 1,
    pixelRatio: 3,
  });
  const a = document.createElement("a");
  a.href = dataURL;
  a.download = "i_dont_know_bro.png";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  tr.visible(true);
  layer.batchDraw();
};

const resetCanvas = () => {
  $("#uploadButton").show();
  addMustacheToCanvas(mustacheURLs[selectedMustacheIndex]); // Add mustache based on the selected type
  $("#closeButton").hide();
  $("#saveButton").hide();
  layer.destroyChildren();
  stage.width(fixedCanvasWidth);
  stage.height(maxCanvasHeight);
  canvasBorder = new Konva.Rect({
    width: stage.width(),
    height: stage.height(),
  });
  layer.add(canvasBorder);
  layer.batchDraw();
};

$(document).ready(function () {
  $("#closeButton").hide();
  $("#saveButton").hide();
  addMustacheToCanvas(mustacheURLs[selectedMustacheIndex]); // Add mustache based on the selected type
});

$("#uploadButton").click(function () {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";

  input.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (event) {
        const imageSrc = event.target.result;
        changeCanvasBackground(imageSrc);
      };
      reader.readAsDataURL(file);
    }
  });

  input.click();
});

$("#saveButton").click(function () {
  saveCanvasAsImage();
});

$("#closeButton").click(function () {
  resetCanvas();
});
