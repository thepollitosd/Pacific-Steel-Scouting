import { useRef, useState, useEffect } from "react";
import { Eraser, PenTool, Plus, X, Film, Trash2, Undo, Redo } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

type Phase = "auto" | "teleop" | "endgame";
type Robot = { id: string, x: number, y: number, number: string, color: string };

type Frame = {
  id: string;
  name: string;
  canvases: Record<Phase, string>; // Data URLs
  robots: Record<Phase, Robot[]>;
  notes: Record<Phase, string>;
};

export function Whiteboard() {
  const [phase, setPhase] = useState<Phase>("auto");
  const [color, setColor] = useState("#3b82f6");
  
  // State for frames
  const [frames, setFrames] = useState<Frame[]>(() => {
    const saved = localStorage.getItem("whiteboard_frames");
    return saved ? JSON.parse(saved) : [{ 
      id: "1", 
      name: "Frame 1", 
      canvases: { auto: "", teleop: "", endgame: "" },
      robots: { auto: [], teleop: [], endgame: [] }, 
      notes: { auto: "", teleop: "", endgame: "" } 
    }];
  });
  const [currentFrameId, setCurrentFrameId] = useState<string>("1");

  // Current active states derived from current frame
  const currentFrame = frames.find(f => f.id === currentFrameId) || frames[0];
  
  const [notes, setNotes] = useState<Record<Phase, string>>(currentFrame.notes);
  const [robots, setRobots] = useState<Record<Phase, Robot[]>>(currentFrame.robots);
  
  // Undo/Redo state
  const [canvasHistory, setCanvasHistory] = useState<Record<string, string[]>>({});
  const [canvasHistoryIndex, setCanvasHistoryIndex] = useState<Record<string, number>>({});

  // Dragging state
  const [draggingRobot, setDraggingRobot] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const autoCanvasRef = useRef<HTMLCanvasElement>(null);
  const teleopCanvasRef = useRef<HTMLCanvasElement>(null);
  const endgameCanvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isDrawing, setIsDrawing] = useState(false);

  const getCanvas = () => {
    if (phase === "auto") return autoCanvasRef.current;
    if (phase === "teleop") return teleopCanvasRef.current;
    return endgameCanvasRef.current;
  };

  // Save to local storage whenever frames change
  useEffect(() => {
    localStorage.setItem("whiteboard_frames", JSON.stringify(frames));
  }, [frames]);

  // Load canvas data when switching frames or phases
  useEffect(() => {
    const canvas = getCanvas();
    const ctx = canvas?.getContext("2d");
    const dataUrl = currentFrame.canvases[phase];

    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (dataUrl) {
        const img = new Image();
        img.src = dataUrl;
        img.onload = () => {
          ctx.drawImage(img, 0, 0);
        };
      }
    }
    setRobots(currentFrame.robots);
    setNotes(currentFrame.notes);
    
    // Initialize history if not present
    const key = `${currentFrameId}_${phase}`;
    if (!canvasHistory[key]) {
      setCanvasHistory(prev => ({ ...prev, [key]: [dataUrl || ""] }));
      setCanvasHistoryIndex(prev => ({ ...prev, [key]: 0 }));
    }
  }, [currentFrameId, phase]);

  useEffect(() => {
    const resizeCanvas = () => {
      const parent = containerRef.current;
      if (!parent) return;
      
      const width = parent.clientWidth;
      const height = parent.clientHeight;
      
      [autoCanvasRef, teleopCanvasRef, endgameCanvasRef].forEach(ref => {
        const canvas = ref.current;
        if (canvas) {
          const ctx = canvas.getContext("2d");
          let imgData;
          if (ctx && canvas.width > 0 && canvas.height > 0) {
            imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          }
          
          canvas.width = width;
          canvas.height = height;
          
          if (ctx) {
            ctx.lineCap = "round";
            ctx.lineJoin = "round";
            ctx.lineWidth = 4;
            if (imgData) {
              ctx.putImageData(imgData, 0, 0);
            }
          }
        }
      });
    };
    
    resizeCanvas();
    setTimeout(resizeCanvas, 100);
    window.addEventListener("resize", resizeCanvas);
    return () => window.removeEventListener("resize", resizeCanvas);
  }, []);

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent, element: HTMLElement) => {
    const rect = element.getBoundingClientRect();
    if ("touches" in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }
    return {
      x: (e as React.MouseEvent).clientX - rect.left,
      y: (e as React.MouseEvent).clientY - rect.top,
    };
  };

  const handlePointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = getCanvas();
    if (!canvas) return;
    
    e.preventDefault();
    setIsDrawing(true);
    const { x, y } = getCoordinates(e, canvas);
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(x, y);
    }
  };

  const handlePointerMove = (e: React.MouseEvent | React.TouchEvent) => {
    const container = containerRef.current;
    if (!container) return;

    if (draggingRobot) {
      e.preventDefault();
      const { x, y } = getCoordinates(e, container);
      
      const boundedX = Math.max(0, Math.min(x - dragOffset.x, container.clientWidth - 48));
      const boundedY = Math.max(0, Math.min(y - dragOffset.y, container.clientHeight - 48));

      const updatedRobots = {
        ...robots,
        [phase]: robots[phase].map(r => r.id === draggingRobot ? { ...r, x: boundedX, y: boundedY } : r)
      };
      setRobots(updatedRobots);
      updateFrameData({ robots: updatedRobots });
      return;
    }

    if (isDrawing) {
      e.preventDefault();
      const canvas = getCanvas();
      if (!canvas) return;
      const { x, y } = getCoordinates(e, canvas);
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.lineTo(x, y);
        ctx.strokeStyle = color;
        ctx.stroke();
      }
    }
  };

  const handlePointerUp = () => {
    if (isDrawing) {
      setIsDrawing(false);
      const canvas = getCanvas();
      if (canvas) {
        const dataUrl = canvas.toDataURL();
        
        // Update history
        const key = `${currentFrameId}_${phase}`;
        const currentHist = canvasHistory[key] || [];
        const currentIndex = canvasHistoryIndex[key] ?? -1;
        
        const newHist = [...currentHist.slice(0, currentIndex + 1), dataUrl];
        setCanvasHistory({ ...canvasHistory, [key]: newHist });
        setCanvasHistoryIndex({ ...canvasHistoryIndex, [key]: newHist.length - 1 });
        
        const updatedCanvases = { ...currentFrame.canvases, [phase]: dataUrl };
        updateFrameData({ canvases: updatedCanvases });
      }
    }
    setDraggingRobot(null);
  };

  const undo = () => {
    const key = `${currentFrameId}_${phase}`;
    const currentIndex = canvasHistoryIndex[key] ?? -1;
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      const dataUrl = canvasHistory[key][newIndex];
      
      setCanvasHistoryIndex({ ...canvasHistoryIndex, [key]: newIndex });
      
      const canvas = getCanvas();
      const ctx = canvas?.getContext("2d");
      if (canvas && ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (dataUrl) {
          const img = new Image();
          img.src = dataUrl;
          img.onload = () => {
            ctx.drawImage(img, 0, 0);
          };
        }
      }
      
      const updatedCanvases = { ...currentFrame.canvases, [phase]: dataUrl };
      updateFrameData({ canvases: updatedCanvases });
    }
  };

  const redo = () => {
    const key = `${currentFrameId}_${phase}`;
    const currentIndex = canvasHistoryIndex[key] ?? -1;
    const currentHist = canvasHistory[key] || [];
    if (currentIndex < currentHist.length - 1) {
      const newIndex = currentIndex + 1;
      const dataUrl = currentHist[newIndex];
      
      setCanvasHistoryIndex({ ...canvasHistoryIndex, [key]: newIndex });
      
      const canvas = getCanvas();
      const ctx = canvas?.getContext("2d");
      if (canvas && ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (dataUrl) {
          const img = new Image();
          img.src = dataUrl;
          img.onload = () => {
            ctx.drawImage(img, 0, 0);
          };
        }
      }
      
      const updatedCanvases = { ...currentFrame.canvases, [phase]: dataUrl };
      updateFrameData({ canvases: updatedCanvases });
    }
  };

  const handleRobotPointerDown = (e: React.MouseEvent | React.TouchEvent, robot: Robot) => {
    e.stopPropagation();
    const container = containerRef.current;
    if (!container) return;
    
    const { x, y } = getCoordinates(e, container);
    setDragOffset({ x: x - robot.x, y: y - robot.y });
    setDraggingRobot(robot.id);
  };

  const updateFrameData = (data: Partial<Frame>) => {
    setFrames(prev => prev.map(f => f.id === currentFrameId ? { ...f, ...data } : f));
  };

  const clearCanvas = () => {
    const canvas = getCanvas();
    const ctx = canvas?.getContext("2d");
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL();
      
      // Add to history
      const key = `${currentFrameId}_${phase}`;
      const currentHist = canvasHistory[key] || [];
      const currentIndex = canvasHistoryIndex[key] ?? -1;
      const newHist = [...currentHist.slice(0, currentIndex + 1), dataUrl];
      setCanvasHistory({ ...canvasHistory, [key]: newHist });
      setCanvasHistoryIndex({ ...canvasHistoryIndex, [key]: newHist.length - 1 });

      const updatedCanvases = { ...currentFrame.canvases, [phase]: dataUrl };
      const updatedRobots = { ...robots, [phase]: [] };
      setRobots(updatedRobots);
      updateFrameData({ canvases: updatedCanvases, robots: updatedRobots });
    }
  };

  const addRobot = () => {
    const container = containerRef.current;
    const centerX = container ? container.clientWidth / 2 - 24 : 100;
    const centerY = container ? container.clientHeight / 2 - 24 : 100;

    const newRobot: Robot = {
      id: Math.random().toString(36).substring(7),
      x: centerX,
      y: centerY,
      number: "1234",
      color: color
    };
    const updatedRobots = { ...robots, [phase]: [...robots[phase], newRobot] };
    setRobots(updatedRobots);
    updateFrameData({ robots: updatedRobots });
  };

  const updateRobotNumber = (id: string, num: string) => {
    const updatedRobots = {
      ...robots,
      [phase]: robots[phase].map(r => r.id === id ? { ...r, number: num } : r)
    };
    setRobots(updatedRobots);
    updateFrameData({ robots: updatedRobots });
  };

  const deleteRobot = (id: string) => {
    const updatedRobots = {
      ...robots,
      [phase]: robots[phase].filter(r => r.id !== id)
    };
    setRobots(updatedRobots);
    updateFrameData({ robots: updatedRobots });
  };

  const handleNotesChange = (val: string) => {
    const updatedNotes = { ...notes, [phase]: val };
    setNotes(updatedNotes);
    updateFrameData({ notes: updatedNotes });
  };

  const addFrame = () => {
    const newId = Math.random().toString(36).substring(7);
    const newFrame: Frame = {
      id: newId,
      name: `Frame ${frames.length + 1}`,
      canvases: { auto: "", teleop: "", endgame: "" },
      robots: { auto: [], teleop: [], endgame: [] },
      notes: { auto: "", teleop: "", endgame: "" }
    };
    setFrames([...frames, newFrame]);
    setCurrentFrameId(newId);
  };

  const deleteFrame = (id: string) => {
    if (frames.length === 1) return; // Keep at least one
    const updatedFrames = frames.filter(f => f.id !== id);
    setFrames(updatedFrames);
    if (currentFrameId === id) {
      setCurrentFrameId(updatedFrames[0].id);
    }
  };

  const clearAllFrames = () => {
    if (confirm("Are you sure you want to clear all frames? This will reset the whiteboard.")) {
      const resetFrame: Frame = {
        id: "1",
        name: "Frame 1",
        canvases: { auto: "", teleop: "", endgame: "" },
        robots: { auto: [], teleop: [], endgame: [] },
        notes: { auto: "", teleop: "", endgame: "" }
      };
      setFrames([resetFrame]);
      setCurrentFrameId("1");
      setCanvasHistory({});
      setCanvasHistoryIndex({});
      
      // Clear canvases physically
      [autoCanvasRef, teleopCanvasRef, endgameCanvasRef].forEach(ref => {
        const canvas = ref.current;
        const ctx = canvas?.getContext("2d");
        if (canvas && ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
      });
      setRobots({ auto: [], teleop: [], endgame: [] });
      setNotes({ auto: "", teleop: "", endgame: "" });
    }
  };

  const currentKey = `${currentFrameId}_${phase}`;
  const canUndo = (canvasHistoryIndex[currentKey] ?? 0) > 0;
  const canRedo = (canvasHistoryIndex[currentKey] ?? 0) < (canvasHistory[currentKey]?.length ?? 1) - 1;

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] md:h-[calc(100vh-8rem)] space-y-4 max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Strategy Whiteboard</h1>
          <p className="text-muted-foreground mt-2 hidden sm:block">Plan out paths, starting positions, and match tactics.</p>
        </div>
        <Tabs value={phase} onValueChange={(val) => setPhase(val as Phase)} className="w-full sm:w-[400px]">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="auto">Auto</TabsTrigger>
            <TabsTrigger value="teleop">Teleop</TabsTrigger>
            <TabsTrigger value="endgame">Endgame</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Frames Bar */}
      <div className="flex flex-wrap gap-2 shrink-0 bg-muted p-2 rounded-lg items-center overflow-x-auto">
        <Film className="w-4 h-4 text-muted-foreground ml-1 mr-2" />
        {frames.map((frame) => (
          <div key={frame.id} className="flex items-center gap-1">
            <Button
              variant={currentFrameId === frame.id ? "default" : "outline"}
              size="sm"
              onClick={() => setCurrentFrameId(frame.id)}
              className="h-8"
            >
              {frame.name}
            </Button>
            {frames.length > 1 && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => deleteFrame(frame.id)}
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
              >
                <X className="w-3 h-3" />
              </Button>
            ) }
          </div>
        ))}
        <Button variant="outline" size="sm" onClick={addFrame} className="h-8">
          <Plus className="w-3 h-3 mr-1" /> Add Frame
        </Button>
        <Button variant="destructive" size="sm" onClick={clearAllFrames} className="h-8 ml-auto">
          <Trash2 className="w-3 h-3 mr-1" /> Clear All
        </Button>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-0">
        <div className="flex flex-col gap-2 flex-1 min-h-0 min-w-0">
          {/* Toolbar */}
          <div className="flex flex-wrap gap-2 shrink-0 bg-muted p-2 rounded-lg items-center overflow-x-auto">
            <div className="flex gap-1 items-center">
              <PenTool className="w-4 h-4 text-muted-foreground ml-1 mr-2" />
              <Button variant="outline" size="icon" onClick={() => setColor("#3b82f6")} className={color === "#3b82f6" ? "border-blue-500 border-2" : ""}><div className="w-4 h-4 rounded-full bg-blue-500" /></Button>
              <Button variant="outline" size="icon" onClick={() => setColor("#ef4444")} className={color === "#ef4444" ? "border-red-500 border-2" : ""}><div className="w-4 h-4 rounded-full bg-red-500" /></Button>
              <Button variant="outline" size="icon" onClick={() => setColor("#22c55e")} className={color === "#22c55e" ? "border-green-500 border-2" : ""}><div className="w-4 h-4 rounded-full bg-green-500" /></Button>
              <Button variant="outline" size="icon" onClick={() => setColor("#f59e0b")} className={color === "#f59e0b" ? "border-amber-500 border-2" : ""}><div className="w-4 h-4 rounded-full bg-amber-500" /></Button>
              <Button variant="outline" size="icon" onClick={() => setColor("#ffffff")} className={color === "#ffffff" ? "border-black border-2 dark:border-white" : ""}><div className="w-4 h-4 rounded-full bg-white border border-border" /></Button>
              <Button variant="outline" size="icon" onClick={() => setColor("#000000")} className={color === "#000000" ? "border-white border-2 dark:border-neutral-700" : ""}><div className="w-4 h-4 rounded-full bg-black border border-border" /></Button>
            </div>
            
            <div className="h-6 w-px bg-border mx-2" />
            
            <div className="flex gap-1">
              <Button variant="outline" size="sm" onClick={undo} disabled={!canUndo} className="h-8">
                <Undo className="w-4 h-4 mr-1" /> Undo
              </Button>
              <Button variant="outline" size="sm" onClick={redo} disabled={!canRedo} className="h-8">
                <Redo className="w-4 h-4 mr-1" /> Redo
              </Button>
            </div>

            <div className="h-6 w-px bg-border mx-2" />
            
            <Button variant="secondary" size="sm" onClick={addRobot} className="h-8">
              <Plus className="w-4 h-4 mr-1 sm:mr-2" /> <span className="hidden sm:inline">Add Robot</span><span className="sm:hidden">Add</span>
            </Button>
            <Button variant="destructive" size="sm" onClick={clearCanvas} className="h-8 ml-auto">
              <Eraser className="w-4 h-4 mr-1 sm:mr-2" /> <span className="hidden sm:inline">Clear Canvas</span><span className="sm:hidden">Clear</span>
            </Button>
          </div>

          <div className="flex-1 flex items-start justify-center min-h-0 overflow-auto">
            <div 
              ref={containerRef}
              className="relative w-full rounded-xl overflow-hidden border bg-neutral-100 dark:bg-neutral-800 shadow-inner"
              style={{ aspectRatio: "3902 / 1584" }}
              onMouseMove={handlePointerMove}
              onMouseUp={handlePointerUp}
              onMouseLeave={handlePointerUp}
              onTouchMove={handlePointerMove}
              onTouchEnd={handlePointerUp}
            >
              {/* Field Background */}
              <div 
                className="absolute inset-0 pointer-events-none bg-center bg-no-repeat bg-[length:100%_100%] opacity-80 mix-blend-multiply dark:mix-blend-screen"
                style={{ backgroundImage: 'url("/field.png")' }}
              />

              {/* Canvases for each phase */}
              <canvas
                ref={autoCanvasRef}
                onMouseDown={handlePointerDown}
                onTouchStart={handlePointerDown}
                className={`absolute inset-0 w-full h-full touch-none cursor-crosshair ${phase === "auto" ? "block z-10" : "hidden z-0"}`}
              />
              <canvas
                ref={teleopCanvasRef}
                onMouseDown={handlePointerDown}
                onTouchStart={handlePointerDown}
                className={`absolute inset-0 w-full h-full touch-none cursor-crosshair ${phase === "teleop" ? "block z-10" : "hidden z-0"}`}
              />
              <canvas
                ref={endgameCanvasRef}
                onMouseDown={handlePointerDown}
                onTouchStart={handlePointerDown}
                className={`absolute inset-0 w-full h-full touch-none cursor-crosshair ${phase === "endgame" ? "block z-10" : "hidden z-0"}`}
              />

              {/* Robots Overlay */}
              {robots[phase].map((r) => (
                <div
                  key={r.id}
                  className="absolute w-14 h-14 backdrop-blur-sm border-2 border-white dark:border-neutral-900 rounded-md shadow-xl flex items-center justify-center touch-none z-20 transition-transform duration-75 select-none"
                  style={{ 
                    left: r.x, 
                    top: r.y, 
                    transform: draggingRobot === r.id ? "scale(1.15)" : "scale(1)",
                    cursor: draggingRobot === r.id ? "grab" : "grab",
                    backgroundColor: r.color
                  }}
                  onMouseDown={(e) => handleRobotPointerDown(e, r)}
                  onTouchStart={(e) => handleRobotPointerDown(e, r)}
                >
                  {/* Delete Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteRobot(r.id);
                    }}
                    className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white cursor-pointer hover:bg-red-600 shadow-md z-30"
                  >
                    <X className="w-3 h-3" />
                  </button>

                  <label
                    className="w-6 h-6 flex items-center justify-center cursor-text z-10"
                    onMouseDown={(e) => e.stopPropagation()}
                    onTouchStart={(e) => e.stopPropagation()}
                  >
                    <input
                      type="text"
                      value={r.number}
                      onChange={(e) => updateRobotNumber(r.id, e.target.value)}
                      className="absolute w-24 bg-transparent text-white text-center font-bold text-sm outline-none pointer-events-none"
                    />
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Notes Panel */}
        <div className="w-full lg:w-[320px] bg-card border rounded-xl p-4 flex flex-col space-y-4 shrink-0">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Match Notes</h2>
            <span className="text-xs uppercase font-bold text-muted-foreground bg-muted px-2 py-1 rounded">
              {phase}
            </span>
          </div>
          
          <Textarea
            placeholder={`Type notes for the ${phase} phase here...`}
            value={notes[phase]}
            onChange={(e) => handleNotesChange(e.target.value)}
            className="flex-1 min-h-[200px] lg:min-h-0 text-base"
          />
          
          <div className="text-xs text-muted-foreground p-2 bg-muted rounded-md">
            <p>💡 Tip: Use the color picker to set the path color before drawing.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Whiteboard;
