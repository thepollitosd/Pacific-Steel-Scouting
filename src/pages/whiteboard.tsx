import { useRef, useState, useEffect } from "react";
import { Eraser, PenTool, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

type Phase = "auto" | "teleop" | "endgame";
type Robot = { id: string, x: number, y: number, number: string, color: string };

export function Whiteboard() {
  const [phase, setPhase] = useState<Phase>("auto");
  const [color, setColor] = useState("#3b82f6");
  const [notes, setNotes] = useState<Record<Phase, string>>({ auto: "", teleop: "", endgame: "" });
  const [robots, setRobots] = useState<Record<Phase, Robot[]>>({ auto: [], teleop: [], endgame: [] });
  
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

  useEffect(() => {
    const resizeCanvas = () => {
      const parent = containerRef.current;
      if (!parent) return;
      
      const width = parent.clientWidth;
      const height = parent.clientHeight;
      
      [autoCanvasRef, teleopCanvasRef, endgameCanvasRef].forEach(ref => {
        const canvas = ref.current;
        if (canvas) {
          // Store image data before resize
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
      
      // Keep robots within bounds roughly
      const boundedX = Math.max(0, Math.min(x - dragOffset.x, container.clientWidth - 48));
      const boundedY = Math.max(0, Math.min(y - dragOffset.y, container.clientHeight - 48));

      setRobots(prev => ({
        ...prev,
        [phase]: prev[phase].map(r => r.id === draggingRobot ? { ...r, x: boundedX, y: boundedY } : r)
      }));
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
    setIsDrawing(false);
    setDraggingRobot(null);
  };

  const handleRobotPointerDown = (e: React.MouseEvent | React.TouchEvent, robot: Robot) => {
    e.stopPropagation(); // Prevent canvas drawing from starting
    const container = containerRef.current;
    if (!container) return;
    
    const { x, y } = getCoordinates(e, container);
    setDragOffset({ x: x - robot.x, y: y - robot.y });
    setDraggingRobot(robot.id);
  };

  const clearCanvas = () => {
    const canvas = getCanvas();
    const ctx = canvas?.getContext("2d");
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    setRobots(prev => ({ ...prev, [phase]: [] }));
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
      color: color // Inherit selected color
    };
    setRobots(prev => ({ ...prev, [phase]: [...prev[phase], newRobot] }));
  };

  const updateRobotNumber = (id: string, num: string) => {
    setRobots(prev => ({
      ...prev,
      [phase]: prev[phase].map(r => r.id === id ? { ...r, number: num } : r)
    }));
  };

  const deleteRobot = (id: string) => {
    setRobots(prev => ({
      ...prev,
      [phase]: prev[phase].filter(r => r.id !== id)
    }));
  };

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

      <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-0">
        <div className="flex flex-col gap-2 flex-1 min-h-0 min-w-0">
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
            <Button variant="secondary" size="sm" onClick={addRobot}>
              <Plus className="w-4 h-4 mr-1 sm:mr-2" /> <span className="hidden sm:inline">Add Robot</span><span className="sm:hidden">Add</span>
            </Button>
            <Button variant="destructive" size="sm" onClick={clearCanvas} className="ml-auto">
              <Eraser className="w-4 h-4 mr-1 sm:mr-2" /> <span className="hidden sm:inline">Clear All</span><span className="sm:hidden">Clear</span>
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
                    cursor: draggingRobot === r.id ? "grabbing" : "grab",
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

        <div className="w-full lg:w-80 flex flex-col gap-2 shrink-0">
          <h3 className="font-semibold text-lg">{phase.charAt(0).toUpperCase() + phase.slice(1)} Notes</h3>
          <Textarea 
            placeholder={`Add your strategy notes for ${phase} here...`}
            className="flex-1 min-h-[150px] lg:min-h-0 resize-none text-base"
            value={notes[phase]}
            onChange={(e) => setNotes(prev => ({ ...prev, [phase]: e.target.value }))}
          />
        </div>
      </div>
    </div>
  );
}
