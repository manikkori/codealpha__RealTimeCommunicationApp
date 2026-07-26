import { useRef, useEffect, useState } from "react";
import { Eraser, Trash2 } from "lucide-react";

const Whiteboard = ({ socket, roomId }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState("#3b82f6");
  const [lineWidth, setLineWidth] = useState(3);
  const prevPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");

    canvas.width = canvas.parentElement.clientWidth || 800;
    canvas.height = canvas.parentElement.clientHeight || 500;
    context.lineCap = "round";
    context.lineJoin = "round";

    const handleResize = () => {
      const imgData = context.getImageData(0, 0, canvas.width, canvas.height);
      canvas.width = canvas.parentElement.clientWidth || 800;
      canvas.height = canvas.parentElement.clientHeight || 500;
      context.putImageData(imgData, 0, 0);
    };

    window.addEventListener("resize", handleResize);

    if (socket) {
      const handleRemoteDraw = ({
        x0,
        y0,
        x1,
        y1,
        strokeColor,
        strokeWidth,
      }) => {
        context.beginPath();
        context.moveTo(x0, y0);
        context.lineTo(x1, y1);
        context.strokeStyle = strokeColor;
        context.lineWidth = strokeWidth;
        context.stroke();
        context.closePath();
      };

      socket.on("whiteboard-draw", handleRemoteDraw);
      return () => {
        socket.off("whiteboard-draw", handleRemoteDraw);
        window.removeEventListener("resize", handleResize);
      };
    }
  }, [socket]);

  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const startDrawing = (e) => {
    setIsDrawing(true);
    prevPos.current = getCoordinates(e);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    const currentPos = getCoordinates(e);

    context.beginPath();
    context.moveTo(prevPos.current.x, prevPos.current.y);
    context.lineTo(currentPos.x, currentPos.y);
    context.strokeStyle = color;
    context.lineWidth = lineWidth;
    context.stroke();
    context.closePath();

    if (socket) {
      socket.emit("whiteboard-draw", {
        roomId,
        drawData: {
          x0: prevPos.current.x,
          y0: prevPos.current.y,
          x1: currentPos.x,
          y1: currentPos.y,
          strokeColor: color,
          strokeWidth: lineWidth,
        },
      });
    }

    prevPos.current = currentPos;
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height);
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-900 border border-slate-800 rounded-sm overflow-hidden">
      <div className="bg-slate-950 border-b border-slate-800 p-3 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          {[
            "#ffffff",
            "#3b82f6",
            "#10b981",
            "#ef4444",
            "#eab308",
            "#a855f7",
          ].map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              style={{ backgroundColor: c }}
              className={`w-6 h-6 rounded-sm border transition ${
                color === c
                  ? "border-white scale-110 shadow-sm"
                  : "border-transparent opacity-70 hover:opacity-100"
              }`}
            />
          ))}
          <button
            onClick={() => setColor("#0f172a")}
            className={`p-1.5 bg-slate-900 border rounded-sm text-slate-300 hover:text-white transition ${
              color === "#0f172a"
                ? "border-blue-500 text-blue-400 font-bold"
                : "border-slate-800"
            }`}
            title="Eraser"
          >
            <Eraser className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center space-x-3">
          <span className="font-mono text-xs text-slate-400 uppercase">
            Size:
          </span>
          <input
            type="range"
            min="1"
            max="20"
            value={lineWidth}
            onChange={(e) => setLineWidth(Number(e.target.value))}
            className="w-24 accent-blue-600 bg-slate-800 cursor-pointer"
          />
          <button
            onClick={clearCanvas}
            className="flex items-center space-x-1.5 px-3 py-1 bg-rose-500/10 hover:bg-rose-500 border border-rose-500/20 text-rose-400 hover:text-white font-mono text-xs uppercase tracking-wider rounded-sm transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      <div className="flex-1 relative bg-slate-950 overflow-hidden cursor-crosshair">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="absolute inset-0 w-full h-full block"
        />
      </div>
    </div>
  );
};

export default Whiteboard;
