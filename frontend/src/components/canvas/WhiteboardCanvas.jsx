import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  Pen,
  Square,
  Diamond,
  Circle,
  ArrowRight,
  Database,
  Table as TableIcon,
  Zap,
  Server,
  Cloud,
  Network,
  StickyNote,
  Type,
  Eraser,
  Trash2,
  Download,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  Minimize2,
  Hand,
  CheckCircle2,
  Sparkles,
  Undo2,
  Redo2,
  Tag,
  ShieldAlert,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { api } from '../../services/api';
import { socketService } from '../../services/socketService';

export function WhiteboardCanvas() {
  const { currentOrg, currentUser } = useApp();
  const { theme } = useTheme();
  const toast = useToast();

  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const [isClearDialogOpen, setIsClearDialogOpen] = useState(false);

  // Tools:
  // 'pen' | 'rect' | 'diamond' | 'circle' | 'arrow' | 'cylinder' | 'table' | 'cache' | 'lb' | 'server' | 'cloud' | 'sticky' | 'text' | 'eraser' | 'pan'
  const [tool, setTool] = useState('pen');
  const [color, setColor] = useState('#0052cc');
  const [lineWidth, setLineWidth] = useState(2.5);
  const [fillMode, setFillMode] = useState('tinted'); // 'none' | 'tinted' | 'solid'
  const [fontSize, setFontSize] = useState(14); // 12 | 14 | 18 | 24

  // Canvas Viewport Transforms
  const [zoom, setZoom] = useState(1.0);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Drawing state
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [savedSnapshot, setSavedSnapshot] = useState(null);
  const [lastSavedTime, setLastSavedTime] = useState('Just now');
  const lastPointRef = useRef(null);

  // Text tool
  const [textInput, setTextInput] = useState('');
  const [textPos, setTextPos] = useState(null);

  // Undo / Redo history
  const [historyStack, setHistoryStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);

  const currentOrgIdStr = (currentOrg?.id || currentOrg?._id || 'default').toString();
  const canvasBackground = theme === 'dark' ? '#0f172a' : '#ffffff';
  const canvasStorageKey = `canvas_${theme === 'dark' ? 'dark' : 'light'}_${currentOrgIdStr}`;

  const colors = [
    { name: 'Royal Blue', hex: '#0052cc' },
    { name: 'Neon Cyan', hex: '#06b6d4' },
    { name: 'Emerald', hex: '#10b981' },
    { name: 'Amber Gold', hex: '#f59e0b' },
    { name: 'Crimson', hex: '#ef4444' },
    { name: 'Purple Pulse', hex: '#8b5cf6' },
    { name: 'Slate Dark', hex: '#1e293b' },
  ];

  // Initialize Canvas
  const setupCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const container = containerRef.current;
    canvas.width = container ? container.clientWidth : 1200;
    canvas.height = 700;

    // Fill background
    ctx.fillStyle = canvasBackground;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Subtle grid lines
    ctx.strokeStyle = theme === 'dark' ? 'rgba(148, 163, 184, 0.08)' : 'rgba(0, 82, 204, 0.06)';
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 32) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 32) {
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
  }, [canvasBackground, canvasStorageKey, theme]);

  useEffect(() => {
    setupCanvas();
  }, [setupCanvas]);

  // Join canvas socket room & listen for live drawing events from collaborators
  useEffect(() => {
    if (currentOrgIdStr) {
      socketService.joinCanvas(currentOrgIdStr);
    }

    const handleRemoteStroke = (data) => {
      if (!data) return;
      if (data.orgId && data.orgId.toString() !== currentOrgIdStr) return;

      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');

      if (data.type === 'draw_step' && data.from && data.to) {
        ctx.save();
        ctx.strokeStyle = data.color;
        ctx.lineWidth = data.lineWidth;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(data.from.x, data.from.y);
        ctx.lineTo(data.to.x, data.to.y);
        ctx.stroke();
        ctx.restore();
      } else if (data.type === 'full_snapshot' && data.snapshot) {
        const img = new Image();
        img.onload = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);
          try {
            localStorage.setItem(canvasStorageKey, data.snapshot);
          } catch (_) {}
        };
        img.src = data.snapshot;
      }
    };

    const handleRemoteClear = (data) => {
      if (data?.orgId && data.orgId.toString() !== currentOrgIdStr) return;

      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = canvasBackground;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      try {
        localStorage.removeItem(canvasStorageKey);
      } catch (_) {}
    };

    socketService.on('canvas:remote_stroke', handleRemoteStroke);
    socketService.on('canvas:remote_clear', handleRemoteClear);

    return () => {
      socketService.off('canvas:remote_stroke', handleRemoteStroke);
      socketService.off('canvas:remote_clear', handleRemoteClear);
    };
  }, [currentOrgIdStr, canvasBackground, canvasStorageKey]);

  // Sync canvas snapshot from backend database on mount
  useEffect(() => {
    if (!currentOrgIdStr || currentOrgIdStr === 'default') return;
    api.getCanvas(currentOrgIdStr).then((res) => {
      if (res?.canvas?.snapshotData && canvasRef.current) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, 0, 0);
          try {
            localStorage.setItem(canvasStorageKey, res.canvas.snapshotData);
          } catch (_) {}
        };
        img.src = res.canvas.snapshotData;
      }
    }).catch(() => {});
  }, [currentOrgIdStr, canvasStorageKey]);

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const drawDefaultArchitecture = (ctx) => {
    const isDark = theme === 'dark';

    // 1. Client App Node
    drawServerBox(ctx, 80, 260, 160, 90, 'React Client App', 'WebSockets :443', '#0052cc', isDark);

    // Arrow to Load Balancer
    drawConnectorArrow(ctx, 240, 305, 330, 305, '#0052cc');

    // 2. Load Balancer Node
    drawLoadBalancerNode(ctx, 330, 255, 140, 100, 'Cloud Gateway', 'Envoy / ALB', '#06b6d4', isDark);

    // Arrow to Microservice
    drawConnectorArrow(ctx, 470, 305, 560, 305, '#06b6d4');

    // 3. Node.js Microservice
    drawServerBox(ctx, 560, 260, 170, 90, 'API Microservice', 'Express & JWT', '#8b5cf6', isDark);

    // Arrow up to Cache
    drawConnectorArrow(ctx, 645, 260, 645, 180, '#f59e0b');

    // 4. Redis Cache
    drawCacheNode(ctx, 570, 110, 150, 70, 'Redis Cache', 'TTL: 3600s', '#f59e0b', isDark);

    // Arrow right to Database
    drawConnectorArrow(ctx, 730, 305, 820, 305, '#10b981');

    // 5. Database Cylinder
    drawDatabaseCylinder(ctx, 820, 250, 160, 110, 'MongoDB Atlas', 'Sharded Cluster', '#10b981', isDark);

    // Title label
    ctx.fillStyle = isDark ? '#f8fafc' : '#0f172a';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText('⚡ Production System Design & Multi-Tenant Architecture', 80, 70);

    ctx.fillStyle = isDark ? '#94a3b8' : '#64748b';
    ctx.font = '12px sans-serif';
    ctx.fillText('Real-Time Collaboration Mesh • Sub-50ms Latency', 80, 95);
  };

  // Helper Drawing Functions for Dedicated System Shapes
  const drawServerBox = (ctx, x, y, w, h, title, sub, strokeColor, isDark) => {
    ctx.save();
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 2.5;
    ctx.fillStyle = isDark ? 'rgba(30, 41, 59, 0.85)' : 'rgba(239, 246, 255, 0.85)';
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 12);
    ctx.fill();
    ctx.stroke();

    // Server LED indicators
    ctx.fillStyle = strokeColor;
    ctx.beginPath();
    ctx.arc(x + 16, y + 18, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.arc(x + 28, y + 18, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = strokeColor;
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText(title, x + 16, y + 46);

    ctx.fillStyle = isDark ? '#94a3b8' : '#64748b';
    ctx.font = '11px monospace';
    ctx.fillText(sub, x + 16, y + 68);
    ctx.restore();
  };

  const drawLoadBalancerNode = (ctx, x, y, w, h, title, sub, strokeColor, isDark) => {
    ctx.save();
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 2.5;
    ctx.fillStyle = isDark ? 'rgba(6, 182, 212, 0.12)' : 'rgba(236, 254, 255, 0.9)';
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 14);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = strokeColor;
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText(title, x + 16, y + 42);

    ctx.fillStyle = isDark ? '#94a3b8' : '#64748b';
    ctx.font = '11px sans-serif';
    ctx.fillText(sub, x + 16, y + 64);
    ctx.restore();
  };

  const drawCacheNode = (ctx, x, y, w, h, title, sub, strokeColor, isDark) => {
    ctx.save();
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 2.5;
    ctx.fillStyle = isDark ? 'rgba(245, 158, 11, 0.12)' : 'rgba(254, 243, 199, 0.9)';
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 20);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = strokeColor;
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText(`⚡ ${title}`, x + 16, y + 34);

    ctx.fillStyle = isDark ? '#cbd5e1' : '#78350f';
    ctx.font = '11px monospace';
    ctx.fillText(sub, x + 20, y + 54);
    ctx.restore();
  };

  const drawDatabaseCylinder = (ctx, x, y, w, h, title, sub, strokeColor, isDark) => {
    ctx.save();
    const rx = w / 2;
    const ry = 14;
    const cx = x + rx;

    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 2.5;
    ctx.fillStyle = isDark ? 'rgba(16, 185, 129, 0.12)' : 'rgba(240, 253, 244, 0.9)';

    // Body
    ctx.beginPath();
    ctx.ellipse(cx, y + ry, rx, ry, 0, 0, Math.PI * 2);
    ctx.ellipse(cx, y + h - ry, rx, ry, 0, 0, Math.PI);
    ctx.moveTo(x, y + ry);
    ctx.lineTo(x, y + h - ry);
    ctx.moveTo(x + w, y + ry);
    ctx.lineTo(x + w, y + h - ry);
    ctx.fill();
    ctx.stroke();

    // Top cap
    ctx.beginPath();
    ctx.ellipse(cx, y + ry, rx, ry, 0, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = strokeColor;
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText(title, x + 20, y + 56);

    ctx.fillStyle = isDark ? '#94a3b8' : '#047857';
    ctx.font = '11px sans-serif';
    ctx.fillText(sub, x + 20, y + 78);
    ctx.restore();
  };

  const drawSchemaTable = (ctx, x, y, w, h, tableName, fields, strokeColor, isDark) => {
    ctx.save();
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 2;
    ctx.fillStyle = isDark ? '#1e293b' : '#ffffff';
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 10);
    ctx.fill();
    ctx.stroke();

    // Header row
    ctx.fillStyle = strokeColor;
    ctx.beginPath();
    ctx.roundRect(x, y, w, 32, [10, 10, 0, 0]);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText(`TABLE: ${tableName}`, x + 12, y + 21);

    // Fields
    ctx.fillStyle = isDark ? '#e2e8f0' : '#1e293b';
    ctx.font = '11px monospace';
    fields.forEach((field, i) => {
      ctx.fillText(field, x + 12, y + 52 + i * 22);
    });
    ctx.restore();
  };

  const drawConnectorArrow = (ctx, fromX, fromY, toX, toY, arrowColor) => {
    ctx.save();
    ctx.strokeStyle = arrowColor;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.stroke();

    const angle = Math.atan2(toY - fromY, toX - fromX);
    ctx.fillStyle = arrowColor;
    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(toX - 12 * Math.cos(angle - Math.PI / 6), toY - 12 * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(toX - 12 * Math.cos(angle + Math.PI / 6), toY - 12 * Math.sin(angle + Math.PI / 6));
    ctx.fill();
    ctx.restore();
  };

  const drawStickyNote = (ctx, x, y, text, noteColor) => {
    ctx.save();
    const w = 140;
    const h = 110;
    ctx.fillStyle = noteColor || '#fef08a'; // yellow sticky
    ctx.shadowColor = 'rgba(0,0,0,0.15)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 4;
    ctx.fillRect(x, y, w, h);

    // Folded corner
    ctx.fillStyle = '#fde047';
    ctx.beginPath();
    ctx.moveTo(x + w - 16, y);
    ctx.lineTo(x + w, y + 16);
    ctx.lineTo(x + w - 16, y + 16);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#713f12';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText(text || 'Sprint Note', x + 12, y + 36);
    ctx.restore();
  };

  const drawStampBadge = (ctx, x, y, label, badgeColor) => {
    ctx.save();
    ctx.strokeStyle = badgeColor;
    ctx.lineWidth = 2;
    ctx.fillStyle = `${badgeColor}22`; // 15% opacity tint
    ctx.beginPath();
    ctx.roundRect(x, y, 120, 34, 8);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = badgeColor;
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText(label, x + 16, y + 22);
    ctx.restore();
  };

  // Canvas State & History Management
  const pushHistory = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL();
    setHistoryStack((prev) => [...prev.slice(-15), dataUrl]);
    setRedoStack([]);
  };

  const autoSaveCanvas = (broadcast = false) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL();
    localStorage.setItem(canvasStorageKey, dataUrl);
    setLastSavedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    api.saveCanvasSnapshot(currentOrgIdStr, dataUrl).catch(() => {});

    if (broadcast && currentOrgIdStr) {
      socketService.emitCanvasStroke({
        orgId: currentOrgIdStr,
        type: 'full_snapshot',
        snapshot: dataUrl,
      });
    }
  };

  const handleUndo = () => {
    if (historyStack.length === 0) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const currentData = canvas.toDataURL();
    setRedoStack((prev) => [...prev, currentData]);

    const previousData = historyStack[historyStack.length - 1];
    setHistoryStack((prev) => prev.slice(0, -1));

    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      autoSaveCanvas(true);
    };
    img.src = previousData;
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const nextData = redoStack[redoStack.length - 1];
    setRedoStack((prev) => prev.slice(0, -1));
    setHistoryStack((prev) => [...prev, canvas.toDataURL()]);

    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      autoSaveCanvas(true);
    };
    img.src = nextData;
  };

  // Mouse event handlers
  const getCanvasCoords = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const rawX = (e.clientX - rect.left) / zoom;
    const rawY = (e.clientY - rect.top) / zoom;
    return { x: rawX, y: rawY };
  };

  const startDrawing = (e) => {
    if (tool === 'pan') {
      setIsPanning(true);
      setPanStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
      return;
    }

    const { x, y } = getCanvasCoords(e);
    lastPointRef.current = { x, y };

    if (tool === 'text') {
      setTextPos({ x, y });
      return;
    }

    pushHistory();
    const canvas = canvasRef.current;
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
    if (isPanning && tool === 'pan') {
      setPanOffset({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
      return;
    }

    if (!isDrawing) return;
    const { x, y } = getCanvasCoords(e);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const isDark = theme === 'dark';

    if (tool === 'pen') {
      const from = lastPointRef.current || { x, y };
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(x, y);
      ctx.stroke();

      socketService.emitCanvasStroke({
        orgId: currentOrgIdStr,
        type: 'draw_step',
        tool: 'pen',
        from,
        to: { x, y },
        color,
        lineWidth,
      });
      lastPointRef.current = { x, y };
    } else if (tool === 'eraser') {
      const from = lastPointRef.current || { x, y };
      const eraserWidth = lineWidth * 7;
      ctx.strokeStyle = canvasBackground;
      ctx.lineWidth = eraserWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(x, y);
      ctx.stroke();

      socketService.emitCanvasStroke({
        orgId: currentOrgIdStr,
        type: 'draw_step',
        tool: 'eraser',
        from,
        to: { x, y },
        color: canvasBackground,
        lineWidth: eraserWidth,
      });
      lastPointRef.current = { x, y };
    } else if (savedSnapshot) {
      ctx.putImageData(savedSnapshot, 0, 0);
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;

      if (tool === 'rect') {
        const w = x - startPos.x;
        const h = y - startPos.y;
        if (fillMode === 'solid') {
          ctx.fillStyle = color;
          ctx.fillRect(startPos.x, startPos.y, w, h);
        } else if (fillMode === 'tinted') {
          ctx.fillStyle = isDark ? `${color}25` : `${color}15`;
          ctx.fillRect(startPos.x, startPos.y, w, h);
        }
        ctx.strokeRect(startPos.x, startPos.y, w, h);
      } else if (tool === 'circle') {
        const radius = Math.sqrt(Math.pow(x - startPos.x, 2) + Math.pow(y - startPos.y, 2));
        ctx.beginPath();
        ctx.arc(startPos.x, startPos.y, radius, 0, Math.PI * 2);
        if (fillMode === 'tinted') {
          ctx.fillStyle = isDark ? `${color}25` : `${color}15`;
          ctx.fill();
        } else if (fillMode === 'solid') {
          ctx.fillStyle = color;
          ctx.fill();
        }
        ctx.stroke();
      } else if (tool === 'diamond') {
        const midX = (startPos.x + x) / 2;
        const midY = (startPos.y + y) / 2;
        ctx.beginPath();
        ctx.moveTo(midX, startPos.y);
        ctx.lineTo(x, midY);
        ctx.lineTo(midX, y);
        ctx.lineTo(startPos.x, midY);
        ctx.closePath();
        if (fillMode === 'tinted') {
          ctx.fillStyle = isDark ? `${color}25` : `${color}15`;
          ctx.fill();
        } else if (fillMode === 'solid') {
          ctx.fillStyle = color;
          ctx.fill();
        }
        ctx.stroke();
      } else if (tool === 'arrow') {
        drawConnectorArrow(ctx, startPos.x, startPos.y, x, y, color);
      } else if (tool === 'cylinder') {
        drawDatabaseCylinder(ctx, startPos.x, startPos.y, Math.max(140, Math.abs(x - startPos.x)), Math.max(90, Math.abs(y - startPos.y)), 'Database Cluster', 'MongoDB / Postgres', color, isDark);
      } else if (tool === 'table') {
        drawSchemaTable(ctx, startPos.x, startPos.y, Math.max(180, Math.abs(x - startPos.x)), Math.max(120, Math.abs(y - startPos.y)), 'Entity_Model', ['id: UUID (PK)', 'user_id: FK', 'payload: JSONB', 'status: VARCHAR'], color, isDark);
      } else if (tool === 'cache') {
        drawCacheNode(ctx, startPos.x, startPos.y, Math.max(140, Math.abs(x - startPos.x)), Math.max(70, Math.abs(y - startPos.y)), 'Redis In-Memory', 'Cluster Node :6379', color, isDark);
      } else if (tool === 'lb') {
        drawLoadBalancerNode(ctx, startPos.x, startPos.y, Math.max(140, Math.abs(x - startPos.x)), Math.max(90, Math.abs(y - startPos.y)), 'Load Balancer', 'Round-Robin Hash', color, isDark);
      } else if (tool === 'server') {
        drawServerBox(ctx, startPos.x, startPos.y, Math.max(150, Math.abs(x - startPos.x)), Math.max(80, Math.abs(y - startPos.y)), 'Service Worker', 'gRPC & HTTPS', color, isDark);
      } else if (tool === 'cloud') {
        drawLoadBalancerNode(ctx, startPos.x, startPos.y, Math.max(160, Math.abs(x - startPos.x)), Math.max(80, Math.abs(y - startPos.y)), '☁️ API Cloud Gateway', 'Edge Proxy :443', color, isDark);
      } else if (tool === 'sticky') {
        drawStickyNote(ctx, startPos.x, startPos.y, 'Sprint Task', '#fef08a');
      }
    }
  };

  const stopDrawing = () => {
    if (isPanning) {
      setIsPanning(false);
    }
    if (isDrawing) {
      setIsDrawing(false);
      lastPointRef.current = null;
      autoSaveCanvas(true);
    }
  };

  const handlePlaceText = (e) => {
    e.preventDefault();
    if (!textInput.trim() || !textPos) return;
    pushHistory();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = color;
    ctx.font = `bold ${fontSize}px sans-serif`;
    ctx.fillText(textInput.trim(), textPos.x, textPos.y);

    setTextInput('');
    setTextPos(null);
    autoSaveCanvas(true);
  };

  const handleQuickStamp = (label, stampColor) => {
    pushHistory();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    drawStampBadge(ctx, 100, 140, label, stampColor);
    autoSaveCanvas(true);
  };

  const handleClearCanvas = () => {
    setIsClearDialogOpen(true);
  };

  const handleConfirmClear = () => {
    pushHistory();
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = canvasBackground;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      autoSaveCanvas();
      socketService.emitCanvasClear({ orgId: currentOrgIdStr });
      toast.success('Whiteboard cleared', 'All drawings and stencils have been reset.');
    }
    setIsClearDialogOpen(false);
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `${currentOrg.slug || 'architecture'}_whiteboard.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    toast.success('Whiteboard exported', 'Saved architecture diagram as PNG.');
  };

  // Zoom Controls
  const handleZoomIn = () => setZoom((prev) => Math.min(2.5, Number((prev + 0.15).toFixed(2))));
  const handleZoomOut = () => setZoom((prev) => Math.max(0.5, Number((prev - 0.15).toFixed(2))));
  const handleResetZoom = () => {
    setZoom(1.0);
    setPanOffset({ x: 0, y: 0 });
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <div
      ref={containerRef}
      className={`mx-auto font-sans space-y-3 ${
        isFullscreen ? 'fixed inset-0 z-50 bg-slate-900 p-4 overflow-hidden' : 'max-w-7xl px-4 sm:px-6 py-4'
      }`}
    >
      {/* Top Toolbar Header */}
      <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-xs">
        
        {/* Left: Tools Palette */}
        <div className="flex items-center gap-1.5 flex-wrap">
          
          {/* Pan / Hand Tool */}
          <button
            onClick={() => setTool('pan')}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              tool === 'pan'
                ? 'bg-blue-50 dark:bg-blue-950/60 border-[#0052cc] text-[#0052cc] dark:text-blue-400'
                : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
            title="Hand Tool (Pan / Navigate canvas)"
          >
            <Hand className="w-4 h-4" />
          </button>

          {/* Pen */}
          <button
            onClick={() => setTool('pen')}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              tool === 'pen'
                ? 'bg-blue-50 dark:bg-blue-950/60 border-[#0052cc] text-[#0052cc] dark:text-blue-400'
                : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
            title="Freehand Pen"
          >
            <Pen className="w-4 h-4" />
          </button>

          {/* Basic Shapes */}
          <button
            onClick={() => setTool('rect')}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              tool === 'rect'
                ? 'bg-blue-50 dark:bg-blue-950/60 border-[#0052cc] text-[#0052cc] dark:text-blue-400'
                : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
            title="Rectangle Container"
          >
            <Square className="w-4 h-4" />
          </button>

          <button
            onClick={() => setTool('circle')}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              tool === 'circle'
                ? 'bg-blue-50 dark:bg-blue-950/60 border-[#0052cc] text-[#0052cc] dark:text-blue-400'
                : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
            title="Circle / Endpoint"
          >
            <Circle className="w-4 h-4" />
          </button>

          <button
            onClick={() => setTool('diamond')}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              tool === 'diamond'
                ? 'bg-blue-50 dark:bg-blue-950/60 border-[#0052cc] text-[#0052cc] dark:text-blue-400'
                : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
            title="Decision Rhombus"
          >
            <Diamond className="w-4 h-4" />
          </button>

          <button
            onClick={() => setTool('arrow')}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              tool === 'arrow'
                ? 'bg-blue-50 dark:bg-blue-950/60 border-[#0052cc] text-[#0052cc] dark:text-blue-400'
                : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
            title="Connector Arrow"
          >
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-1" />

          {/* Architecture & Infrastructure Shapes */}
          <button
            onClick={() => setTool('cylinder')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border transition-all text-xs font-bold cursor-pointer ${
              tool === 'cylinder'
                ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-700 dark:text-emerald-300'
                : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
            title="Database Cylinder Stencil"
          >
            <Database className="w-3.5 h-3.5 text-emerald-500" />
            <span className="hidden sm:inline">Database</span>
          </button>

          <button
            onClick={() => setTool('table')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border transition-all text-xs font-bold cursor-pointer ${
              tool === 'table'
                ? 'bg-blue-50 dark:bg-blue-950/60 border-[#0052cc] text-[#0052cc] dark:text-blue-400'
                : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
            title="Data Model / Schema Table"
          >
            <TableIcon className="w-3.5 h-3.5 text-[#0052cc]" />
            <span className="hidden sm:inline">Schema</span>
          </button>

          <button
            onClick={() => setTool('cache')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border transition-all text-xs font-bold cursor-pointer ${
              tool === 'cache'
                ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-500 text-amber-700 dark:text-amber-300'
                : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
            title="Redis Cache Stencil"
          >
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden sm:inline">Cache</span>
          </button>

          <button
            onClick={() => setTool('lb')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border transition-all text-xs font-bold cursor-pointer ${
              tool === 'lb'
                ? 'bg-cyan-50 dark:bg-cyan-950/60 border-cyan-500 text-cyan-700 dark:text-cyan-300'
                : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
            title="Load Balancer Stencil"
          >
            <Network className="w-3.5 h-3.5 text-cyan-500" />
            <span className="hidden sm:inline">Load Balancer</span>
          </button>

          <button
            onClick={() => setTool('server')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border transition-all text-xs font-bold cursor-pointer ${
              tool === 'server'
                ? 'bg-purple-50 dark:bg-purple-950/60 border-purple-500 text-purple-700 dark:text-purple-300'
                : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
            title="Microservice / Server Box"
          >
            <Server className="w-3.5 h-3.5 text-purple-500" />
            <span className="hidden sm:inline">Server</span>
          </button>

          <button
            onClick={() => setTool('cloud')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border transition-all text-xs font-bold cursor-pointer ${
              tool === 'cloud'
                ? 'bg-sky-50 dark:bg-sky-950/60 border-sky-500 text-sky-700 dark:text-sky-300'
                : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
            title="Cloud API Gateway"
          >
            <Cloud className="w-3.5 h-3.5 text-sky-500" />
            <span className="hidden sm:inline">Gateway</span>
          </button>

          <button
            onClick={() => setTool('sticky')}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              tool === 'sticky'
                ? 'bg-yellow-50 dark:bg-yellow-950/60 border-yellow-500 text-yellow-700 dark:text-yellow-300'
                : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
            title="Sticky Note"
          >
            <StickyNote className="w-4 h-4 text-amber-500" />
          </button>

          <button
            onClick={() => setTool('text')}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              tool === 'text'
                ? 'bg-blue-50 dark:bg-blue-950/60 border-[#0052cc] text-[#0052cc] dark:text-blue-400'
                : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
            title="Text Tool"
          >
            <Type className="w-4 h-4" />
          </button>

          <button
            onClick={() => setTool('eraser')}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              tool === 'eraser'
                ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-500 text-rose-700 dark:text-rose-300'
                : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
            title="Eraser"
          >
            <Eraser className="w-4 h-4" />
          </button>
        </div>

        {/* Right: Colors, Fills, Zoom, Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Color palette */}
          <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            {colors.map((c) => (
              <button
                key={c.hex}
                onClick={() => setColor(c.hex)}
                className={`w-5 h-5 rounded-full transition-transform cursor-pointer ${
                  color === c.hex ? 'scale-125 ring-2 ring-offset-1 ring-[#0052cc]' : 'hover:scale-110'
                }`}
                style={{ backgroundColor: c.hex }}
                title={c.name}
              />
            ))}
          </div>

          {/* Stroke Width Selector */}
          <select
            value={lineWidth}
            onChange={(e) => setLineWidth(Number(e.target.value))}
            className="px-2 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 cursor-pointer"
          >
            <option value="1.5">Thin (1.5px)</option>
            <option value="2.5">Normal (2.5px)</option>
            <option value="4">Thick (4px)</option>
          </select>

          {/* Fill Mode */}
          <select
            value={fillMode}
            onChange={(e) => setFillMode(e.target.value)}
            className="px-2 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 cursor-pointer"
          >
            <option value="none">Fill: None</option>
            <option value="tinted">Fill: Tinted</option>
            <option value="solid">Fill: Solid</option>
          </select>

          {/* Quick Stamps Dropdown / Buttons */}
          <div className="hidden lg:flex items-center gap-1">
            <button
              onClick={() => handleQuickStamp('APPROVED', '#10b981')}
              className="px-2 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 text-[10px] font-bold cursor-pointer"
            >
              Approved
            </button>
            <button
              onClick={() => handleQuickStamp('REVIEW', '#f59e0b')}
              className="px-2 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800 text-[10px] font-bold cursor-pointer"
            >
              Review
            </button>
            <button
              onClick={() => handleQuickStamp('URGENT', '#ef4444')}
              className="px-2 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800 text-[10px] font-bold cursor-pointer"
            >
              Urgent
            </button>
          </div>

          <div className="h-6 w-px bg-slate-200 dark:bg-slate-800" />

          {/* Undo & Redo */}
          <button
            onClick={handleUndo}
            disabled={historyStack.length === 0}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 cursor-pointer"
            title="Undo"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            onClick={handleRedo}
            disabled={redoStack.length === 0}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 cursor-pointer"
            title="Redo"
          >
            <Redo2 className="w-4 h-4" />
          </button>

          {/* Zoom In, Out, Reset */}
          <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={handleZoomOut}
              className="p-1 rounded text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleResetZoom}
              className="px-1 text-[11px] font-bold text-slate-700 dark:text-slate-300 cursor-pointer"
              title="Reset Zoom"
            >
              {Math.round(zoom * 100)}%
            </button>
            <button
              onClick={handleZoomIn}
              className="p-1 rounded text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Export PNG */}
          <button
            onClick={handleDownload}
            className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-[#0052cc] dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/60 cursor-pointer"
            title="Export Architecture Diagram (PNG)"
          >
            <Download className="w-4 h-4" />
          </button>

          {/* Clear */}
          <button
            onClick={handleClearCanvas}
            className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
            title="Clear Whiteboard"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Floating Text Placement Box */}
      {textPos && (
        <form
          onSubmit={handlePlaceText}
          className="p-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl shadow-2xl flex items-center gap-2 z-50 animate-in fade-in"
          style={{ position: 'relative' }}
        >
          <input
            type="text"
            autoFocus
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="Type architecture label..."
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#0052cc]"
          />
          <select
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
            className="px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-700 dark:text-slate-200 cursor-pointer"
          >
            <option value="12">12px</option>
            <option value="14">14px</option>
            <option value="18">18px</option>
            <option value="24">24px</option>
          </select>
          <button
            type="submit"
            className="px-3 py-1.5 bg-[#0052cc] text-white rounded-lg text-xs font-bold cursor-pointer"
          >
            Add Note
          </button>
          <button
            type="button"
            onClick={() => setTextPos(null)}
            className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </form>
      )}

      {/* Canvas Viewport Container */}
      <div className="relative w-full rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm bg-slate-100 dark:bg-slate-950 flex items-center justify-center">
        <div
          style={{
            transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoom})`,
            transformOrigin: 'top left',
            transition: isPanning ? 'none' : 'transform 0.1s ease-out',
          }}
        >
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            className={`block rounded-xl shadow-xs ${tool === 'pan' ? (isPanning ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-crosshair'}`}
          />
        </div>

        {/* Live sync badge */}
        <div className="absolute bottom-3 right-3 flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-xs border border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-600 dark:text-slate-400 shadow-sm pointer-events-none">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Real-Time Mesh Synced • {lastSavedTime}</span>
        </div>
      </div>

      {/* Clear Canvas Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isClearDialogOpen}
        onClose={() => setIsClearDialogOpen(false)}
        onConfirm={handleConfirmClear}
        title="Clear Whiteboard Canvas"
        description="Are you sure you want to clear the entire canvas? All system architecture shapes, lines, notes, and stamps will be erased. This action cannot be undone."
        confirmText="Clear Canvas"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
}
