import { useRef, useState, useEffect } from "react";
import { useQuery, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Eraser, PenTool, Undo, Redo, Play, Pause, RotateCcw } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function MatchReplay() {
  const [currentMatch, setCurrentMatch] = useState<string>("");
  const [youtubeKey, setYoutubeKey] = useState<string>("");
  const [color, setColor] = useState("#ef4444"); // Default to red
  const [isDrawing, setIsDrawing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  
  const [canvasHistory, setCanvasHistory] = useState<string[]>([""]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Fetch active event
  const activeEvent = useQuery(api.events.getActiveEvent);
  
  // Fetch matches for active event
  const matches = useQuery(api.events.listMatches, activeEvent ? { eventId: activeEvent._id } : "skip") || [];
  
  // Action to get match videos from TBA
  const getMatchVideos = useAction(api.tba.getMatchVideos);

  const selectedMatchObj = matches.find((m: any) => m._id === currentMatch);
  
  // Fetch scouting data for current match
  const matchScoutingData = useQuery(api.matchScouting.getByMatch, 
    activeEvent && selectedMatchObj ? { eventId: activeEvent._id, matchNumber: selectedMatchObj.number } : "skip"
  ) || [];

  useEffect(() => {
    if (currentMatch) {
      const match = matches.find((m: any) => m._id === currentMatch);
      if (match && match.tbaKey) {
        getMatchVideos({ matchKey: match.tbaKey }).then((videos: any) => {
          const ytVideo = videos.find((v: any) => v.type === "youtube");
          if (ytVideo) {
            setYoutubeKey(ytVideo.key);
          } else {
            setYoutubeKey("");
          }
        }).catch(err => {
          console.error("Failed to fetch match videos:", err);
          setYoutubeKey("");
        });
      }
    }
  }, [currentMatch, matches, getMatchVideos]);

  // Load YouTube API
  useEffect(() => {
    const tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

    (window as any).onYouTubeIframeAPIReady = () => {
      console.log("YouTube API Ready");
    };
  }, []);

  // Initialize player when key changes
  useEffect(() => {
    if (youtubeKey && (window as any).YT && (window as any).YT.Player) {
      playerRef.current = new (window as any).YT.Player('youtube-player', {
        videoId: youtubeKey,
        playerVars: {
          'playsinline': 1,
          'controls': 0, // Disable default controls to use our own
          'rel': 0,
        },
        events: {
          'onReady': (event: any) => {
            setDuration(event.target.getDuration());
          },
          'onStateChange': (event: any) => {
            // YT.PlayerState.PLAYING = 1
            // YT.PlayerState.PAUSED = 2
            if (event.data === 1) {
              setIsPlaying(true);
            } else if (event.data === 2) {
              setIsPlaying(false);
            }
          }
        }
      });
    }
    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, [youtubeKey]);

  // Poll for current time
  useEffect(() => {
    let interval: any;
    if (isPlaying && playerRef.current) {
      interval = setInterval(() => {
        setCurrentTime(playerRef.current.getCurrentTime());
      }, 500);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const teamsInMatch = selectedMatchObj ? [...selectedMatchObj.redAlliance, ...selectedMatchObj.blueAlliance] : [];
  
  // We would query scouting data here if we had a query for it
  // For now, let's assume we can display a placeholder or fetch it if available
  // Let's create a placeholder or use a mock since we can't easily query multiple teams at once without a custom query
  
  useEffect(() => {
    const resizeCanvas = () => {
      const parent = containerRef.current;
      const canvas = canvasRef.current;
      if (!parent || !canvas) return;
      
      const width = parent.clientWidth;
      const height = parent.clientHeight;
      
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
    };
    
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    return () => window.removeEventListener("resize", resizeCanvas);
  }, [youtubeKey]); // Re-run when video loads

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
    const canvas = canvasRef.current;
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
    if (!isDrawing) return;
    
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const { x, y } = getCoordinates(e, canvas);
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.lineTo(x, y);
      ctx.strokeStyle = color;
      ctx.stroke();
    }
  };

  const handlePointerUp = () => {
    if (isDrawing) {
      setIsDrawing(false);
      const canvas = canvasRef.current;
      if (canvas) {
        const dataUrl = canvas.toDataURL();
        const newHist = [...canvasHistory.slice(0, historyIndex + 1), dataUrl];
        setCanvasHistory(newHist);
        setHistoryIndex(newHist.length - 1);
      }
    }
  };

  const undo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      const dataUrl = canvasHistory[newIndex];
      redrawCanvas(dataUrl);
    }
  };

  const redo = () => {
    if (historyIndex < canvasHistory.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      const dataUrl = canvasHistory[newIndex];
      redrawCanvas(dataUrl);
    }
  };

  const redrawCanvas = (dataUrl: string) => {
    const canvas = canvasRef.current;
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
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL();
      const newHist = [...canvasHistory.slice(0, historyIndex + 1), dataUrl];
      setCanvasHistory(newHist);
      setHistoryIndex(newHist.length - 1);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const seekTo = percent * duration;
    playerRef.current?.seekTo(seekTo, true);
    setCurrentTime(seekTo);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] md:h-[calc(100vh-8rem)] space-y-4 max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Match Replay Tool</h1>
          <p className="text-muted-foreground mt-2 hidden sm:block">Watch match videos and draw over them for analysis.</p>
        </div>
        
        <div className="flex gap-2 w-full sm:w-auto">
          <Select value={currentMatch} onValueChange={setCurrentMatch}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Select Match" />
            </SelectTrigger>
            <SelectContent>
              {matches.map((match: any) => (
                <SelectItem key={match._id} value={match._id}>
                  Qual {match.number}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-0">
        {/* Video and Canvas Area */}
        <div className="flex flex-col gap-2 flex-1 min-h-0 min-w-0">
          {/* Toolbar */}
          <div className="flex flex-wrap gap-2 shrink-0 bg-muted p-2 rounded-lg items-center overflow-x-auto">
            <div className="flex gap-1 items-center">
              <PenTool className="w-4 h-4 text-muted-foreground ml-1 mr-2" />
              <Button variant="outline" size="icon" onClick={() => setColor("#ef4444")} className={color === "#ef4444" ? "border-red-500 border-2" : ""}><div className="w-4 h-4 rounded-full bg-red-500" /></Button>
              <Button variant="outline" size="icon" onClick={() => setColor("#3b82f6")} className={color === "#3b82f6" ? "border-blue-500 border-2" : ""}><div className="w-4 h-4 rounded-full bg-blue-500" /></Button>
              <Button variant="outline" size="icon" onClick={() => setColor("#22c55e")} className={color === "#22c55e" ? "border-green-500 border-2" : ""}><div className="w-4 h-4 rounded-full bg-green-500" /></Button>
              <Button variant="outline" size="icon" onClick={() => setColor("#f59e0b")} className={color === "#f59e0b" ? "border-amber-500 border-2" : ""}><div className="w-4 h-4 rounded-full bg-amber-500" /></Button>
              <Button variant="outline" size="icon" onClick={() => setColor("#ffffff")} className={color === "#ffffff" ? "border-black border-2 dark:border-white" : ""}><div className="w-4 h-4 rounded-full bg-white border border-border" /></Button>
            </div>
            
            <div className="h-6 w-px bg-border mx-2" />
            
            <div className="flex gap-1">
              <Button variant="outline" size="sm" onClick={undo} disabled={historyIndex === 0} className="h-8">
                <Undo className="w-4 h-4 mr-1" /> Undo
              </Button>
              <Button variant="outline" size="sm" onClick={redo} disabled={historyIndex === canvasHistory.length - 1} className="h-8">
                <Redo className="w-4 h-4 mr-1" /> Redo
              </Button>
            </div>

            <div className="h-6 w-px bg-border mx-2" />
            
            <Button variant="destructive" size="sm" onClick={clearCanvas} className="h-8 ml-auto">
              <Eraser className="w-4 h-4 mr-1 sm:mr-2" /> <span className="hidden sm:inline">Clear Canvas</span><span className="sm:hidden">Clear</span>
            </Button>
          </div>

          <div className="flex-1 flex flex-col items-center justify-start min-h-0 overflow-auto gap-4">
            <div 
              ref={containerRef}
              className="relative w-full rounded-xl overflow-hidden border bg-black shadow-inner shrink-0"
              style={{ aspectRatio: "16 / 9" }}
              onMouseMove={handlePointerMove}
              onMouseUp={handlePointerUp}
              onMouseLeave={handlePointerUp}
              onTouchMove={handlePointerMove}
              onTouchEnd={handlePointerUp}
            >
              {youtubeKey ? (
                <>
                  <div id="youtube-player" className="absolute inset-0 w-full h-full" />
                  {/* Transparent Canvas Overlay */}
                  <canvas
                    ref={canvasRef}
                    onMouseDown={handlePointerDown}
                    onTouchStart={handlePointerDown}
                    className="absolute inset-0 w-full h-full touch-none cursor-crosshair z-10 pointer-events-auto opacity-100"
                    style={{ mixBlendMode: "normal" }}
                  />
                </>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-4 text-center">
                  <Play className="w-12 h-12 text-muted-foreground mb-4" />
                  <p className="text-xl font-semibold">No video available for this match</p>
                  <p className="text-muted-foreground mt-2">Select a match with a YouTube video on TBA.</p>
                </div>
              )}
            </div>

            {/* Custom Controls & Timeline */}
            {youtubeKey && (
              <div className="w-full bg-card border rounded-lg p-3 space-y-3 shrink-0">
                <div className="flex items-center gap-3">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => {
                      if (isPlaying) {
                        playerRef.current?.pauseVideo();
                      } else {
                        playerRef.current?.playVideo();
                      }
                    }}
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </Button>
                  
                  <div className="text-sm font-mono whitespace-nowrap">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </div>
                  
                  {/* Timeline */}
                  <div className="flex-1 h-3 bg-muted rounded-full relative cursor-pointer" onClick={handleTimelineClick}>
                    {/* Progress */}
                    <div 
                      className="absolute top-0 left-0 h-full bg-primary/30 rounded-full" 
                      style={{ width: `${(currentTime / duration) * 100}%` }}
                    />
                    
                    {/* Match Periods Markers */}
                    {/* Auto starts at 8s, ends at 28s */}
                    {duration > 0 && (
                      <>
                        <div 
                          className="absolute top-0 h-full bg-yellow-500/50" 
                          style={{ left: `${(8 / duration) * 100}%`, width: `${(20 / duration) * 100}%` }}
                          title="Autonomous (20s)"
                        />
                        {/* Delay starts at 28s, ends at 32s */}
                        <div 
                          className="absolute top-0 h-full bg-orange-500/50" 
                          style={{ left: `${(28 / duration) * 100}%`, width: `${(4 / duration) * 100}%` }}
                          title="Delay (3s)"
                        />
                        {/* Teleop starts at 32s, ends at 152s */}
                        <div 
                          className="absolute top-0 h-full bg-green-500/50" 
                          style={{ left: `${(32 / duration) * 100}%`, width: `${(120 / duration) * 100}%` }}
                          title="Teleoperated (120s)"
                        />
                        
                        {/* Current Time Indicator */}
                        <div 
                          className="absolute top-0 w-1 h-full bg-primary" 
                          style={{ left: `${(currentTime / duration) * 100}%` }}
                        />
                      </>
                    )}
                  </div>
                </div>
                
                <div className="flex justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-1"><div className="w-2 h-2 bg-yellow-500/50 rounded-full" /> Auto: 5s - 25s</div>
                  <div className="flex items-center gap-1"><div className="w-2 h-2 bg-orange-500/50 rounded-full" /> Delay: 25s - 28s</div>
                  <div className="flex items-center gap-1"><div className="w-2 h-2 bg-green-500/50 rounded-full" /> Teleop: 28s - 148s</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Scouting Notes Panel */}
        <div className="w-full lg:w-[360px] bg-card border rounded-xl p-4 flex flex-col space-y-4 shrink-0 overflow-auto">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Scouting Analysis</h2>
          </div>
          
          <div className="space-y-4">
            {selectedMatchObj ? (
              <>
                <div className="space-y-2">
                  <h3 className="text-sm font-bold text-red-500">Red Alliance</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {selectedMatchObj.redAlliance.map((num: any) => (
                      <div key={num} className="p-2 bg-red-100 dark:bg-red-900/30 rounded text-center text-sm font-semibold">
                        {num}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-bold text-blue-500">Blue Alliance</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {selectedMatchObj.blueAlliance.map((num: any) => (
                      <div key={num} className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded text-center text-sm font-semibold">
                        {num}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="h-px bg-border my-2" />

                <div className="space-y-4">
                  <h3 className="text-sm font-bold">Scouting Notes</h3>
                  {teamsInMatch.map(teamNum => {
                    const scoutData = matchScoutingData.find((d: any) => d.teamNumber === teamNum);
                    return (
                      <div key={teamNum} className="text-sm text-muted-foreground p-3 bg-muted rounded-md">
                        <p className="font-semibold text-foreground">Team {teamNum}:</p>
                        {scoutData ? (
                          <>
                            <p className="mt-1"><span className="font-medium">Auto:</span> {scoutData.auto.notes || "No notes"}</p>
                            <p className="mt-1"><span className="font-medium">Teleop:</span> {scoutData.teleop.notes || "No notes"}</p>
                            <p className="mt-1"><span className="font-medium">Endgame:</span> {scoutData.endgame.notes || "No notes"}</p>
                          </>
                        ) : (
                          <p className="mt-1 text-muted-foreground">No scouting data for this match.</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <p className="text-muted-foreground text-sm">Select a match to see scouting notes and alliance details.</p>
            )}
          </div>
          
          <div className="text-xs text-muted-foreground p-2 bg-muted rounded-md mt-auto">
            <p>💡 Tip: Pause the video to draw specific plays or note robot positioning at specific timestamps.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MatchReplay;
