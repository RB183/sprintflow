import React, { useRef, useState, useEffect } from 'react';
import {
  Pen,
  Square,
  Diamond,
  ArrowRight,
  Type,
  Eraser,
  Trash2,
  Download,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';

export function WhiteboardCanvas() {
  const { currentOrg } = useApp();
  const { theme } = useTheme();
  const canvasBackground = theme === 'dark' ? '#1e293b' : '#ffffff';
  const canvasStorageKey = `canvas_${theme === 'dark' ? 'dark' : 'light'}_${currentOrg.id}`;
  const canvasRef = useRef(null);
  const [tool, setTool] = useState('pen'); // 'pen' | 'rect' | 'diamond' | 'arrow' | 'text' | 'eraser'
  const [color, setColor] = useState('#0052cc'); // blue default
  const [lineWidth, setLineWidth] = useState(2.5);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [savedSnapshot, setSavedSnapshot] = useState(null);
  const [lastSavedTime, setLastSavedTime] = useState('Just now');
  const [textInput, setTextInput] = useState('');
  const [textPos, setTextPos] = useState(null);

  const colors = [
    { name: 'Royal Blue', hex: '#0052cc' },
    { name: 'Emerald', hex: '#10b981' },
    { name: 'Purple', hex: '#8b5cf6' },
    { name: 'Amber', hex: '#f59e0b' },
    { name: 'Crimson', hex: '#ef4444' },
    { name: 'Slate Dark', hex: '#172b4d' },
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    canvas.width = canvas.parentElement.clientWidth || 1000;
    canvas.height = 560;

    // Match the current application theme while keeping exports readable.
    ctx.fillStyle = canvasBackground;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Subtle blue grid lines
    ctx.strokeStyle = theme === 'dark' ? 'rgba(147, 197, 253, 0.10)' : 'rgba(0, 82, 204, 0.05)';
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 30) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 30) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    const saved = localStorage.getItem(canvasStorageKey);
    if (saved) {
      const img = new Image();
      img.onload = () => ctx.drawImage(img, 0, 0);
      img.src = saved;
    } else {
      drawDefaultArchitecture(ctx);
    }
  }, [canvasBackground, canvasStorageKey, currentOrg.id, theme]);

  const drawDefaultArchitecture = (ctx) => {
    // 1. Client App (Box)
    ctx.strokeStyle = '#0052cc';
    ctx.lineWidth = 2.5;
    ctx.fillStyle = theme === 'dark' ? '#172b4d' : '#eff6ff';
    ctx.strokeRect(60, 220, 160, 80);
    ctx.fillRect(60, 220, 160, 80);

    ctx.fillStyle = '#0052cc';
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText('React Client App', 85, 255);
    ctx.fillStyle = theme === 'dark' ? '#cbd5e1' : '#64748b';
    ctx.font = '11px sans-serif';
    ctx.fillText('WebSocket :443', 95, 275);

    // Arrow 1 -> API Gateway
    ctx.strokeStyle = '#0052cc';
    ctx.beginPath();
    ctx.moveTo(220, 260);
    ctx.lineTo(340, 260);
    ctx.stroke();
    ctx.fillStyle = '#0052cc';
    ctx.beginPath();
    ctx.moveTo(340, 260);
    ctx.lineTo(330, 255);
    ctx.lineTo(330, 265);
    ctx.fill();

    // 2. Decision Diamond
    ctx.strokeStyle = '#f59e0b';
    ctx.fillStyle = theme === 'dark' ? '#3b2d13' : '#fffbeb';
    ctx.beginPath();
    ctx.moveTo(420, 200);
    ctx.lineTo(500, 260);
    ctx.lineTo(420, 320);
    ctx.lineTo(340, 260);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#b45309';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('Auth Gateway', 380, 255);
    ctx.fillStyle = theme === 'dark' ? '#cbd5e1' : '#64748b';
    ctx.font = '10px sans-serif';
    ctx.fillText('JWT Verify', 390, 272);

    // Arrow 2 -> Database
    ctx.strokeStyle = '#10b981';
    ctx.beginPath();
    ctx.moveTo(500, 260);
    ctx.lineTo(620, 260);
    ctx.stroke();
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.moveTo(620, 260);
    ctx.lineTo(610, 255);
    ctx.lineTo(610, 265);
    ctx.fill();

    // 3. Database / Cache (Box)
    ctx.strokeStyle = '#10b981';
    ctx.fillStyle = theme === 'dark' ? '#153a32' : '#f0fdf4';
    ctx.strokeRect(620, 220, 180, 80);
    ctx.fillRect(620, 220, 180, 80);

    ctx.fillStyle = '#047857';
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText('MongoDB & Redis', 655, 255);
    ctx.fillStyle = theme === 'dark' ? '#cbd5e1' : '#64748b';
    ctx.font = '11px sans-serif';
    ctx.fillText('Real-Time Broadcast', 655, 275);

    // Title label
    ctx.fillStyle = theme === 'dark' ? '#e5edf8' : '#172b4d';
    ctx.font = 'bold 15px sans-serif';
    ctx.fillText('System Architecture & Data Flow Schematic', 60, 60);
  };

  const autoSaveCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL();
    localStorage.setItem(canvasStorageKey, dataUrl);
    setLastSavedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  };

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (tool === 'text') {
      setTextPos({ x, y });
      return;
    }

    const ctx = canvas.getContext('2d');
    setIsDrawing(true);
    setStartPos({ x, y });
    setSavedSnapshot(ctx.getImageData(0, 0, canvas.width, canvas.height));

    if (tool === 'pen' || tool === 'eraser') {
      ctx.beginPath();
      ctx.moveTo(x, y);
    }
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const ctx = canvas.getContext('2d');

    if (tool === 'pen') {
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.lineCap = 'round';
      ctx.lineTo(x, y);
      ctx.stroke();
    } else if (tool === 'eraser') {
      ctx.strokeStyle = canvasBackground;
      ctx.lineWidth = lineWidth * 6;
      ctx.lineCap = 'round';
      ctx.lineTo(x, y);
      ctx.stroke();
    } else if (savedSnapshot) {
      ctx.putImageData(savedSnapshot, 0, 0);
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;

      if (tool === 'rect') {
        ctx.strokeRect(startPos.x, startPos.y, x - startPos.x, y - startPos.y);
      } else if (tool === 'diamond') {
        const midX = (startPos.x + x) / 2;
        const midY = (startPos.y + y) / 2;
        ctx.beginPath();
        ctx.moveTo(midX, startPos.y);
        ctx.lineTo(x, midY);
        ctx.lineTo(midX, y);
        ctx.lineTo(startPos.x, midY);
        ctx.closePath();
        ctx.stroke();
      } else if (tool === 'arrow') {
        ctx.beginPath();
        ctx.moveTo(startPos.x, startPos.y);
        ctx.lineTo(x, y);
        ctx.stroke();

        const angle = Math.atan2(y - startPos.y, x - startPos.x);
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x - 12 * Math.cos(angle - Math.PI / 6), y - 12 * Math.sin(angle - Math.PI / 6));
        ctx.lineTo(x - 12 * Math.cos(angle + Math.PI / 6), y - 12 * Math.sin(angle + Math.PI / 6));
        ctx.fill();
      }
    }
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      autoSaveCanvas();
    }
  };

  const handlePlaceText = (e) => {
    e.preventDefault();
    if (!textInput.trim() || !textPos) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = color;
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText(textInput.trim(), textPos.x, textPos.y);

    setTextInput('');
    setTextPos(null);
    autoSaveCanvas();
  };

  const handleClearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = canvasBackground;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    autoSaveCanvas();
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    const link = document.createElement('a');
    link.download = `${currentOrg.slug}_whiteboard.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 font-sans space-y-3">
      
      {/* Canvas Controls Toolbar */}
      <div className="p-3 bg-white border border-slate-200 rounded-xl flex flex-wrap items-center justify-between gap-3 shadow-xs">
        
        {/* Tool Buttons */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setTool('pen')}
            className={`p-2 rounded-lg border transition-all cursor-pointer ${
              tool === 'pen' ? 'bg-blue-50 border-[#0052cc] text-[#0052cc]' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
            title="Freehand Pen"
          >
            <Pen className="w-4 h-4" />
          </button>

          <button
            onClick={() => setTool('rect')}
            className={`p-2 rounded-lg border transition-all cursor-pointer ${
              tool === 'rect' ? 'bg-blue-50 border-[#0052cc] text-[#0052cc]' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
            title="System Box"
          >
            <Square className="w-4 h-4" />
          </button>

          <button
            onClick={() => setTool('diamond')}
            className={`p-2 rounded-lg border transition-all cursor-pointer ${
              tool === 'diamond' ? 'bg-blue-50 border-[#0052cc] text-[#0052cc]' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
            title="Decision Node"
          >
            <Diamond className="w-4 h-4" />
          </button>

          <button
            onClick={() => setTool('arrow')}
            className={`p-2 rounded-lg border transition-all cursor-pointer ${
              tool === 'arrow' ? 'bg-blue-50 border-[#0052cc] text-[#0052cc]' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
            title="Connector Arrow"
          >
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => setTool('text')}
            className={`p-2 rounded-lg border transition-all cursor-pointer ${
              tool === 'text' ? 'bg-blue-50 border-[#0052cc] text-[#0052cc]' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
            title="Text Note"
          >
            <Type className="w-4 h-4" />
          </button>

          <button
            onClick={() => setTool('eraser')}
            className={`p-2 rounded-lg border transition-all cursor-pointer ${
              tool === 'eraser' ? 'bg-blue-50 border-[#0052cc] text-[#0052cc]' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
            title="Eraser"
          >
            <Eraser className="w-4 h-4" />
          </button>
        </div>

        {/* Color Palette */}
        <div className="flex items-center gap-2 border-x border-slate-200 px-4">
          {colors.map((c) => (
            <button
              key={c.hex}
              onClick={() => setColor(c.hex)}
              className={`w-5 h-5 rounded-full border transition-transform cursor-pointer ${
                color === c.hex ? 'scale-125 ring-2 ring-blue-400' : 'border-slate-300'
              }`}
              style={{ backgroundColor: c.hex }}
              title={c.name}
            />
          ))}
        </div>

        {/* Actions & Auto Save */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Auto-saved ({lastSavedTime})</span>
          </div>

          <button
            onClick={handleClearCanvas}
            className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
            title="Clear Canvas"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          <button
            onClick={handleDownload}
            className="px-3.5 py-1.5 rounded-lg bg-[#0052cc] hover:bg-[#0041a8] text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export PNG</span>
          </button>
        </div>

      </div>

      {/* Main Drawing Surface */}
      <div className="relative w-full bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          className="w-full h-[560px] cursor-crosshair block"
        />

        {/* Text Input Popup */}
        {textPos && (
          <form
            onSubmit={handlePlaceText}
            className="absolute z-20 bg-white border border-[#0052cc] p-2 rounded-xl shadow-xl flex gap-1.5 animate-in zoom-in-95"
            style={{ left: textPos.x, top: textPos.y }}
          >
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Enter label..."
              autoFocus
              className="px-2.5 py-1 bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#0052cc] rounded-lg"
            />
            <button
              type="submit"
              className="px-2.5 py-1 bg-[#0052cc] text-white text-xs font-bold rounded-lg"
            >
              Add
            </button>
          </form>
        )}

        {/* Teammate Presence */}
        <div className="absolute bottom-3 right-3 bg-white/90 border border-slate-200 px-3 py-1.5 rounded-full shadow-xs flex items-center gap-2 text-xs text-slate-600 pointer-events-none">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Maya Lin is viewing canvas</span>
        </div>
      </div>

    </div>
  );
}
