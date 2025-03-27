import React, { useEffect, useRef, useState } from "react";
import { fabric } from "fabric";
import {
  IoHandRightOutline,
  IoBrushOutline,
  IoShapesOutline,
  IoTextOutline,
  IoColorPaletteOutline,
  IoArrowUndoOutline,
  IoArrowRedoOutline,
  IoTrashOutline,
  IoAddCircleOutline,
  IoRemoveCircleOutline,
  IoDownloadOutline,
  IoCloseOutline,
  IoTrashBinOutline,
} from "react-icons/io5";
import { FaMicrophone } from "react-icons/fa";
import VoiceRecorder from "./VoiceRecorder";

const Whiteboard = () => {
  const canvasRef = useRef(null);
  const [canvas, setCanvas] = useState(null);
  const [mode, setMode] = useState("draw");
  const [brushColor, setBrushColor] = useState("#000000");
  const [brushSize, setBrushSize] = useState(2);
  const [zoom, setZoom] = useState(1);
  const [isListening, setIsListening] = useState(false);
  const [shapesMenu, setShapesMenu] = useState(false);
  const [textMenu, setTextMenu] = useState(false);
  const [colorMenu, setColorMenu] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Initialize canvas
  useEffect(() => {
    const initCanvas = new fabric.Canvas(canvasRef.current, {
      width: window.innerWidth,
      height: window.innerHeight - 80,
      backgroundColor: "#ffffff",
    });

    initCanvas.isDrawingMode = true;
    initCanvas.freeDrawingBrush.color = brushColor;
    initCanvas.freeDrawingBrush.width = brushSize;
    setCanvas(initCanvas);

    // Save initial state
    saveState(initCanvas);

    // Event listeners
    initCanvas.on("object:added", () => saveState(initCanvas));
    initCanvas.on("object:modified", () => saveState(initCanvas));
    initCanvas.on("object:removed", () => saveState(initCanvas));

    // Handle window resize
    const handleResize = () => {
      initCanvas.setDimensions({
        width: window.innerWidth,
        height: window.innerHeight - 80,
      });
    };
    window.addEventListener("resize", handleResize);

    return () => {
      initCanvas.dispose();
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Save canvas state to history
  const saveState = (canvas) => {
    const state = canvas.toJSON();
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(JSON.stringify(state));
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  // Undo action
  const undo = () => {
    if (historyIndex <= 0) return;
    const newIndex = historyIndex - 1;
    canvas.loadFromJSON(JSON.parse(history[newIndex]), () => {
      canvas.renderAll();
      setHistoryIndex(newIndex);
    });
  };

  // Redo action
  const redo = () => {
    if (historyIndex >= history.length - 1) return;
    const newIndex = historyIndex + 1;
    canvas.loadFromJSON(JSON.parse(history[newIndex]), () => {
      canvas.renderAll();
      setHistoryIndex(newIndex);
    });
  };

  // Update canvas when settings change
  useEffect(() => {
    if (canvas) {
      canvas.isDrawingMode = mode === "draw";
      canvas.selection = mode === "select";
      canvas.freeDrawingBrush.color = brushColor;
      canvas.freeDrawingBrush.width = brushSize;
      canvas.setZoom(zoom);
      canvas.renderAll();
    }
  }, [mode, brushColor, brushSize, zoom, canvas]);

  // Handle zoom changes
  const handleZoom = (direction) => {
    const zoomStep = 0.1;
    const minZoom = 0.5;
    const maxZoom = 3;

    if (direction === "in") {
      setZoom((prevZoom) => Math.min(prevZoom + zoomStep, maxZoom));
    } else {
      setZoom((prevZoom) => Math.max(prevZoom - zoomStep, minZoom));
    }
  };

  // Add shape to canvas
  const addShape = (type) => {
    if (!canvas) return;

    let shape;
    const commonProps = {
      left: 100,
      top: 100,
      fill: "transparent",
      stroke: brushColor,
      strokeWidth: brushSize,
      selectable: true,
    };

    switch (type) {
      case "rectangle":
        shape = new fabric.Rect({
          width: 120,
          height: 80,
          ...commonProps,
        });
        break;
      case "square":
        shape = new fabric.Rect({
          width: 100,
          height: 100,
          ...commonProps,
        });
        break;
      case "triangle":
        shape = new fabric.Triangle({
          width: 100,
          height: 100,
          ...commonProps,
        });
        break;
      case "circle":
        shape = new fabric.Circle({
          radius: 50,
          ...commonProps,
        });
        break;
      case "line":
        shape = new fabric.Line([50, 100, 200, 100], {
          stroke: brushColor,
          strokeWidth: brushSize,
          selectable: true,
        });
        break;
      case "arrow":
        const line = new fabric.Line([50, 100, 150, 100], {
          stroke: brushColor,
          strokeWidth: brushSize,
          selectable: true,
        });

        const arrowHead = new fabric.Triangle({
          width: 15,
          height: 20,
          fill: brushColor,
          left: 150,
          top: 100,
          angle: 0,
          originX: "center",
          originY: "center",
        });

        shape = new fabric.Group([line, arrowHead], {
          left: 100,
          top: 100,
          selectable: true,
        });
        break;
      default:
        return;
    }

    canvas.add(shape);
    canvas.setActiveObject(shape);
    canvas.renderAll();
  };

  // Add text to canvas
  const addText = () => {
    if (!canvas) return;

    const text = new fabric.IText("Double click to edit", {
      left: 100,
      top: 100,
      fontFamily: "Arial",
      fontSize: 20,
      fill: brushColor,
      selectable: true,
    });

    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.renderAll();
  };

  // Clear canvas
  const clearCanvas = () => {
    if (canvas) {
      canvas.clear();
      canvas.backgroundColor = "#ffffff";
      saveState(canvas);
    }
  };

  // Delete selected objects
  const deleteSelected = () => {
    if (!canvas) return;
    const activeObjects = canvas.getActiveObjects();
    if (activeObjects && activeObjects.length > 0) {
      canvas.discardActiveObject();
      activeObjects.forEach((obj) => canvas.remove(obj));
      canvas.renderAll();
      saveState(canvas);
    }
  };

  // Save canvas as image
  const saveCanvas = () => {
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = "whiteboard.png";
    link.href = canvas.toDataURL({
      format: "png",
      quality: 1,
    });
    link.click();
  };

  // Execute voice commands
  const executeVoiceCommand = (command) => {
    const cmd = command.toLowerCase().trim();
    console.log("Executing command:", cmd);

    if (cmd.includes("draw")) {
      if (cmd.includes("circle")) addShape("circle");
      else if (cmd.includes("rectangle")) addShape("rectangle");
      else if (cmd.includes("square")) addShape("square");
      else if (cmd.includes("triangle")) addShape("triangle");
      else if (cmd.includes("line")) addShape("line");
      else if (cmd.includes("arrow")) addShape("arrow");
    } else if (cmd.includes("add text") || cmd.includes("text")) {
      addText();
    } else if (cmd.includes("select")) {
      setMode("select");
    } else if (cmd.includes("draw mode") || cmd.includes("draw")) {
      setMode("draw");
    } else if (cmd.includes("clear canvas") || cmd.includes("clear")) {
      clearCanvas();
    } else if (cmd.includes("undo")) {
      undo();
    } else if (cmd.includes("redo")) {
      redo();
    } else if (cmd.includes("save")) {
      saveCanvas();
    } else if (cmd.includes("zoom in")) {
      handleZoom("in");
    } else if (cmd.includes("zoom out")) {
      handleZoom("out");
    } else if (cmd.includes("delete") || cmd.includes("remove")) {
      deleteSelected();
    }
  };

  // Color palette options
  const colors = [
    "#000000",
    "#ffffff",
    "#ff0000",
    "#00ff00",
    "#0000ff",
    "#ffff00",
    "#00ffff",
    "#ff00ff",
    "#c0c0c0",
    "#808080",
  ];

  return (
    <div className="relative w-full h-screen bg-gray-100 overflow-hidden">
      {/* Top Toolbar */}
      <div className="fixed top-0 left-0 right-0 z-20 bg-white shadow-md flex items-center justify-between p-2 px-4 border-b border-gray-200">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-gray-800 hidden md:block">
            VoxBoard
          </h1>

          {/* Mode Selectors */}
          <div className="flex items-center gap-1 border-r border-gray-200 pr-4">
            <button
              onClick={() => setMode("select")}
              className={`icon-btn ${
                mode === "select" ? "bg-blue-100 text-blue-600" : ""
              }`}
              title="Select (S)"
            >
              <IoHandRightOutline />
            </button>
            <button
              onClick={() => setMode("draw")}
              className={`icon-btn ${
                mode === "draw" ? "bg-blue-100 text-blue-600" : ""
              }`}
              title="Draw (D)"
            >
              <IoBrushOutline />
            </button>
          </div>

          {/* Shapes Menu */}
          <div className="relative">
            <button
              onClick={() => {
                setShapesMenu(!shapesMenu);
                setTextMenu(false);
                setColorMenu(false);
              }}
              className={`icon-btn ${
                shapesMenu ? "bg-blue-100 text-blue-600" : ""
              }`}
              title="Shapes"
            >
              <IoShapesOutline />
            </button>
            {shapesMenu && (
              <div className="absolute top-10 left-0 mt-1 bg-white border border-gray-200 shadow-lg rounded-md z-30 w-48 p-2">
                <div className="flex justify-between items-center px-2 py-1 border-b border-gray-100">
                  <h3 className="font-medium text-gray-700">Shapes</h3>
                  <button
                    onClick={() => setShapesMenu(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <IoCloseOutline size={16} />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-1 mt-2">
                  {[
                    "rectangle",
                    "square",
                    "triangle",
                    "circle",
                    "line",
                    "arrow",
                  ].map((shape) => (
                    <button
                      key={shape}
                      onClick={() => {
                        addShape(shape);
                        setShapesMenu(false);
                      }}
                      className="flex items-center gap-2 text-left px-3 py-2 text-sm hover:bg-gray-100 rounded"
                    >
                      <div
                        className="w-4 h-4 border border-gray-400"
                        style={{
                          backgroundColor:
                            shape === "circle" ? "transparent" : "transparent",
                          borderRadius: shape === "circle" ? "50%" : "0",
                          borderWidth: "2px",
                        }}
                      ></div>
                      {shape.charAt(0).toUpperCase() + shape.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Text Tool */}
          <div className="relative">
            <button
              onClick={() => {
                setTextMenu(!textMenu);
                setShapesMenu(false);
                setColorMenu(false);
                addText();
              }}
              className={`icon-btn ${
                textMenu ? "bg-blue-100 text-blue-600" : ""
              }`}
              title="Text"
            >
              <IoTextOutline />
            </button>
          </div>

          {/* Color Picker */}
          <div className="relative">
            <button
              onClick={() => {
                setColorMenu(!colorMenu);
                setShapesMenu(false);
                setTextMenu(false);
              }}
              className={`icon-btn ${
                colorMenu ? "bg-blue-100 text-blue-600" : ""
              }`}
              title="Color"
            >
              <IoColorPaletteOutline />
            </button>
            {colorMenu && (
              <div className="absolute top-10 left-0 mt-1 bg-white border border-gray-200 shadow-lg rounded-md z-30 w-48 p-2">
                <div className="flex justify-between items-center px-2 py-1 border-b border-gray-100">
                  <h3 className="font-medium text-gray-700">Colors</h3>
                  <button
                    onClick={() => setColorMenu(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <IoCloseOutline size={16} />
                  </button>
                </div>
                <div className="grid grid-cols-5 gap-2 mt-3 p-2">
                  {colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => {
                        setBrushColor(color);
                        setColorMenu(false);
                      }}
                      className="w-6 h-6 rounded-full border border-gray-200 hover:border-gray-400"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
                <div className="mt-2 px-2">
                  <label className="block text-xs text-gray-500 mb-1">
                    Brush Size
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="20"
                    value={brushSize}
                    onChange={(e) => setBrushSize(parseInt(e.target.value))}
                    className="w-full"
                  />
                  <div className="text-xs text-gray-500 text-center">
                    {brushSize}px
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side Toolbar */}
        <div className="flex items-center gap-2">
          {/* Zoom Controls */}
          <div className="flex items-center gap-1 border-r border-gray-200 pr-3">
            <button
              onClick={() => handleZoom("out")}
              className="icon-btn"
              title="Zoom Out"
            >
              <IoRemoveCircleOutline />
            </button>
            <span className="text-sm text-gray-600 w-10 text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => handleZoom("in")}
              className="icon-btn"
              title="Zoom In"
            >
              <IoAddCircleOutline />
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={undo}
              disabled={historyIndex <= 0}
              className={`icon-btn ${
                historyIndex <= 0 ? "opacity-50 cursor-not-allowed" : ""
              }`}
              title="Undo"
            >
              <IoArrowUndoOutline />
            </button>
            <button
              onClick={redo}
              disabled={historyIndex >= history.length - 1}
              className={`icon-btn ${
                historyIndex >= history.length - 1
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
              title="Redo"
            >
              <IoArrowRedoOutline />
            </button>
            <button
              onClick={deleteSelected}
              className="icon-btn"
              title="Delete Selected"
            >
              <IoTrashOutline />
            </button>
            <button
              onClick={clearCanvas}
              className="icon-btn"
              title="Clear Canvas"
            >
              <IoTrashBinOutline />
            </button>
            <button onClick={saveCanvas} className="icon-btn" title="Save">
              <IoDownloadOutline />
            </button>
          </div>

          {/* Voice Control */}
          <VoiceRecorder
            onCommandDetected={executeVoiceCommand}
            onListeningChange={setIsListening}
          />
        </div>
      </div>

      {/* Canvas Area */}
      <div className="pt-16 h-full">
        <canvas
          ref={canvasRef}
          className="w-full h-full"
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: "0 0",
            cursor: mode === "select" ? "default" : "crosshair",
          }}
        />
      </div>

      {/* Listening Indicator */}
      {isListening && (
        <div className="fixed bottom-16 right-4 bg-white px-4 py-2 rounded-full shadow-lg text-sm flex items-center gap-2 z-50 border border-red-200 animate-pulse">
          <FaMicrophone className="text-red-500" />
          <span className="text-gray-700">Listening for commands...</span>
        </div>
      )}

      {/* Status Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-800 text-white text-xs p-1 px-3 flex justify-between items-center z-10">
        <div>
          Mode:{" "}
          <span className="font-medium">
            {mode === "select" ? "Select" : "Draw"}
          </span>{" "}
          | Color: <span className="font-medium">{brushColor}</span> | Size:{" "}
          <span className="font-medium">{brushSize}px</span> | Zoom:{" "}
          <span className="font-medium">{Math.round(zoom * 100)}%</span>
        </div>
        <div>
          <span className="hidden sm:inline">
            Say "Help" for voice commands
          </span>
        </div>
      </div>
    </div>
  );
};

export default Whiteboard;
