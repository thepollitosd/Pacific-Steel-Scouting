import { useState, useRef, useEffect } from "react";
import { useQuery, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, Maximize2, MapPin } from "lucide-react";

export function PitMap() {
  const activeEvent = useQuery(api.events.getActiveEvent);
  const pitScoutingData = useQuery(
    api.pitScouting.getPitScoutingForEvent,
    activeEvent?._id ? { eventId: activeEvent._id } : "skip"
  );
  const getPitMap = useAction(api.nexus.getPitMap);
  const [nexusMap, setNexusMap] = useState<any>(null);

  useEffect(() => {
    if (activeEvent?.key) {
      getPitMap({ eventKey: activeEvent.key })
        .then(data => setNexusMap(data))
        .catch(err => console.error("Failed to fetch Nexus map:", err));
    }
  }, [activeEvent?.key, getPitMap]);

  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [selectedPit, setSelectedPit] = useState<string | null>(null);

  const mapRef = useRef<HTMLDivElement>(null);

  const rows = ["A", "B", "C", "D", "E"];
  const cols = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleZoom = (delta: number) => {
    setZoom(prev => Math.min(Math.max(prev + delta, 0.5), 3));
  };

  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setSelectedPit(null);
  };

  // Map pit locations to teams
  const pitToTeam: Record<string, { teamNumber: number; notes: string }> = {};
  if (pitScoutingData) {
    pitScoutingData.forEach(record => {
      if (record.pitLocation) {
        const normalized = record.pitLocation.toUpperCase().trim();
        pitToTeam[normalized] = {
          teamNumber: record.teamNumber,
          notes: record.notes,
        };
      }
    });
  }

  return (
    <div className="space-y-6 h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex justify-between items-center shrink-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pit Map</h1>
          <div className="flex items-center gap-2">
            <p className="text-muted-foreground">Interactive grid map of pit locations.</p>
            {nexusMap && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                Nexus Map Loaded
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={() => handleZoom(0.2)}>
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => handleZoom(-0.2)}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={resetView}>
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 flex gap-6 overflow-hidden">
        {/* Map Area */}
        <div 
          ref={mapRef}
          className="flex-1 relative border rounded-xl bg-muted/10 overflow-hidden cursor-grab active:cursor-grabbing"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <div 
            className="absolute inset-0 p-8 flex items-center justify-center"
            style={{
              transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
              transition: isDragging ? "none" : "transform 0.2s ease-out",
            }}
          >
            {nexusMap ? (
              <div 
                className="relative bg-background shadow-lg border"
                style={{ width: nexusMap.size.x, height: nexusMap.size.y }}
              >
                {/* Walls */}
                {nexusMap.walls && Object.entries(nexusMap.walls).map(([id, wall]: [string, any]) => (
                  <div
                    key={id}
                    className="absolute bg-muted-foreground/50 border"
                    style={{
                      left: wall.position.x - wall.size.x / 2,
                      top: wall.position.y - wall.size.y / 2,
                      width: wall.size.x,
                      height: wall.size.y,
                    }}
                  />
                ))}

                {/* Areas */}
                {nexusMap.areas && Object.entries(nexusMap.areas).map(([id, area]: [string, any]) => (
                  <div
                    key={id}
                    className="absolute bg-primary/10 border border-primary/20 flex items-center justify-center text-xs font-semibold text-primary"
                    style={{
                      left: area.position.x - area.size.x / 2,
                      top: area.position.y - area.size.y / 2,
                      width: area.size.x,
                      height: area.size.y,
                    }}
                  >
                    {area.label}
                  </div>
                ))}

                {/* Labels */}
                {nexusMap.labels && Object.entries(nexusMap.labels).map(([id, label]: [string, any]) => (
                  <div
                    key={id}
                    className="absolute flex items-center justify-center text-xs font-semibold text-muted-foreground"
                    style={{
                      left: label.position.x - label.size.x / 2,
                      top: label.position.y - label.size.y / 2,
                      width: label.size.x,
                      height: label.size.y,
                    }}
                  >
                    {label.label}
                  </div>
                ))}

                {/* Arrows */}
                {nexusMap.arrows && Object.entries(nexusMap.arrows).map(([id, arrow]: [string, any]) => (
                  <div
                    key={id}
                    className="absolute flex items-center justify-center font-bold text-lg"
                    style={{
                      left: arrow.position.x - arrow.size.x / 2,
                      top: arrow.position.y - arrow.size.y / 2,
                      width: arrow.size.x,
                      height: arrow.size.y,
                      transform: `rotate(${arrow.angle || 0}deg)`,
                    }}
                  >
                    ↑
                  </div>
                ))}

                {/* Pits */}
                {nexusMap.pits && Object.entries(nexusMap.pits).map(([id, pit]: [string, any]) => {
                  const teamInfo = pitToTeam[id.toUpperCase()];
                  const isSelected = selectedPit === id;
                  
                  return (
                    <div
                      key={id}
                      className={`
                        absolute border rounded-md flex flex-col items-center justify-center text-xs font-mono transition-colors
                        ${teamInfo ? 'bg-primary/10 border-primary text-primary' : 'bg-muted/50 border-muted text-muted-foreground'}
                        ${isSelected ? 'ring-2 ring-primary ring-offset-2' : ''}
                        hover:bg-accent hover:text-accent-foreground cursor-pointer
                      `}
                      style={{
                        left: pit.position.x - pit.size.x / 2,
                        top: pit.position.y - pit.size.y / 2,
                        width: pit.size.x,
                        height: pit.size.y,
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPit(id);
                      }}
                    >
                      <span className="font-bold">{id}</span>
                      {(pit.team || teamInfo) && (
                        <span className="mt-1 font-sans font-extrabold text-sm">
                          {pit.team || teamInfo?.teamNumber}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="grid grid-cols-10 gap-2 bg-background p-6 rounded-lg shadow-lg border">
                {rows.flatMap(row => 
                  cols.map(col => {
                    const pitId = `${row}${col}`;
                    const teamInfo = pitToTeam[pitId];
                    const isSelected = selectedPit === pitId;
                    
                    return (
                      <div
                        key={pitId}
                        className={`
                          w-16 h-16 border rounded-md flex flex-col items-center justify-center text-xs font-mono transition-colors
                          ${teamInfo ? 'bg-primary/10 border-primary text-primary' : 'bg-muted/50 border-muted text-muted-foreground'}
                          ${isSelected ? 'ring-2 ring-primary ring-offset-2' : ''}
                          hover:bg-accent hover:text-accent-foreground cursor-pointer
                        `}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPit(pitId);
                        }}
                      >
                        <span className="font-bold">{pitId}</span>
                        {teamInfo && (
                          <span className="mt-1 font-sans font-extrabold text-sm">{teamInfo.teamNumber}</span>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </div>

        {/* Info Panel */}
        <div className="w-80 border rounded-xl p-4 bg-card shrink-0 flex flex-col">
          <h3 className="font-semibold mb-4">Pit Details</h3>
          {selectedPit ? (
            <div className="space-y-4 flex-1">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Location</div>
                  <div className="font-bold text-xl">{selectedPit}</div>
                </div>
              </div>

              {pitToTeam[selectedPit] ? (
                <>
                  <div>
                    <div className="text-sm text-muted-foreground">Team</div>
                    <div className="font-bold text-2xl">{pitToTeam[selectedPit].teamNumber}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Notes</div>
                    <div className="text-sm mt-1 p-2 bg-muted rounded-md min-h-[100px]">
                      {pitToTeam[selectedPit].notes || "No notes available."}
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-sm text-muted-foreground bg-muted p-4 rounded-md text-center">
                  No team assigned to this pit location yet.
                </div>
              )}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground bg-muted p-4 rounded-md text-center flex-1 flex items-center justify-center">
              Select a pit on the map to view details.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
