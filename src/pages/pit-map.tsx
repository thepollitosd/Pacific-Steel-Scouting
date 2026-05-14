import { useState, useRef, useEffect } from "react";
import { useQuery, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, Maximize2, MapPin, Search, X, Crosshair, Asterisk, CircleIcon, Tally1, Tally2, Tally3, Tally4, Tally5 } from "lucide-react"; // Fallback to CircleIcon if CirclePile is missing
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router";

export function PitMap() {
  const activeEvent = useQuery(api.events.getActiveEvent);
  const pitScoutingData = useQuery(
    api.pitScouting.getPitScoutingForEvent,
    activeEvent?._id ? { eventId: activeEvent._id } : "skip"
  );
  const getPitMap = useAction(api.nexus.getPitMap);
  const [nexusMap, setNexusMap] = useState<any>(undefined); // undefined = loading
  const navigate = useNavigate();

  useEffect(() => {
    if (activeEvent?.key) {
      getPitMap({ eventKey: activeEvent.key })
        .then(data => setNexusMap(data))
        .catch(err => {
          console.error("Failed to fetch Nexus map:", err);
          setNexusMap(null);
        });
    }
  }, [activeEvent?.key, getPitMap]);

  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [selectedPit, setSelectedPit] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const mapRef = useRef<HTMLDivElement>(null);

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

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      const touch = e.touches[0];
      setDragStart({ x: touch.clientX - pan.x, y: touch.clientY - pan.y });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && isDragging) {
      const touch = e.touches[0];
      setPan({
        x: touch.clientX - dragStart.x,
        y: touch.clientY - dragStart.y,
      });
    }
  };

  const handleTouchEnd = () => {
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

  // Find scouting record by team number
  const getScoutingRecord = (teamNum: string | number) => {
    return pitScoutingData?.find(r => r.teamNumber.toString() === teamNum.toString());
  };

  // Find pit for a searched team
  const findPitByTeam = (teamNum: string) => {
    if (!pitScoutingData) return null;
    const record = pitScoutingData.find(r => r.teamNumber.toString() === teamNum);
    return record?.pitLocation || null;
  };

  const handleSearch = () => {
    const pit = findPitByTeam(search);
    if (pit) {
      const normalized = pit.toUpperCase().trim();
      setSelectedPit(normalized);
      // Pan to the pit if we have map data!
      if (nexusMap && nexusMap.pits && nexusMap.pits[normalized]) {
        const pitData = nexusMap.pits[normalized];
        setPan({
          x: -pitData.position.x * zoom + (mapRef.current?.clientWidth || 0) / 2,
          y: -pitData.position.y * zoom + (mapRef.current?.clientHeight || 0) / 2,
        });
      }
    }
  };

  const selectedPitData = selectedPit && nexusMap?.pits ? nexusMap.pits[selectedPit] : null;
  const selectedTeamNum = selectedPitData?.team;
  const selectedScoutingRecord = selectedTeamNum ? getScoutingRecord(selectedTeamNum) : null;

  return (
    <div className="space-y-6 flex-1 flex flex-col min-h-0">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pit Map</h1>
            <p className="text-muted-foreground">Interactive map of pit locations.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto justify-between sm:justify-start">
          <div className="relative flex-1 sm:w-48">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              className="pl-8 bg-background h-9" 
              placeholder="Find team pit..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
          </div>
          <Button variant="outline" size="icon" className="h-10 w-10" onClick={() => handleZoom(0.2)}>
            <ZoomIn className="h-5 w-5" />
          </Button>
          <Button variant="outline" size="icon" className="h-10 w-10" onClick={() => handleZoom(-0.2)}>
            <ZoomOut className="h-5 w-5" />
          </Button>
          <Button variant="outline" size="icon" className="h-10 w-10" onClick={resetView}>
            <Maximize2 className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="flex-1 relative border rounded-xl bg-muted/10 overflow-hidden cursor-grab active:cursor-grabbing min-h-0 touch-none"
        ref={mapRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
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
                const teamNum = pit.team;
                const scoutingRecord = teamNum ? getScoutingRecord(teamNum) : null;
                const isSelected = selectedPit === id;
                
                return (
                  <div
                    key={id}
                    className={`
                      absolute border rounded-md flex flex-col items-center justify-center font-mono transition-colors
                      ${scoutingRecord ? 'bg-green-500/10 border-green-500 text-green-700' : 'bg-muted/50 border-muted text-muted-foreground'}
                      ${isSelected ? 'ring-2 ring-primary ring-offset-2' : ''}
                      hover:bg-accent hover:text-accent-foreground cursor-pointer
                    `}
                    style={{
                      left: pit.position.x - pit.size.x / 2,
                      top: pit.position.y - pit.size.y / 2,
                      width: pit.size.x,
                      height: pit.size.y,
                      fontSize: Math.min(pit.size.x / 4, 12), // Dynamic font size
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPit(id);
                    }}
                  >
                    <span className="font-bold">{id}</span>
                    {(teamNum || scoutingRecord) && (
                      <span 
                        className="mt-0.5 font-sans font-extrabold flex items-center gap-1 overflow-hidden"
                        style={{ fontSize: Math.min(pit.size.x / 3.5, 14) }}
                      >
                        {teamNum || scoutingRecord?.teamNumber}
                        {scoutingRecord?.shooterType && (
                          <span title={scoutingRecord.shooterType}>
                            {scoutingRecord.shooterType === "Turret" && <Crosshair className="h-2.5 w-2.5" />}
                            {scoutingRecord.shooterType === "Dumper" && <CircleIcon className="h-2.5 w-2.5" />}
                            {scoutingRecord.shooterType === "Misc" && (
                              scoutingRecord.shootingPaths === 1 ? <Tally1 className="h-2.5 w-2.5" /> :
                              scoutingRecord.shootingPaths === 2 ? <Tally2 className="h-2.5 w-2.5" /> :
                              scoutingRecord.shootingPaths === 3 ? <Tally3 className="h-2.5 w-2.5" /> :
                              scoutingRecord.shootingPaths === 4 ? <Tally4 className="h-2.5 w-2.5" /> :
                              scoutingRecord.shootingPaths === 5 ? <Tally5 className="h-2.5 w-2.5" /> :
                              <Asterisk className="h-2.5 w-2.5" />
                            )}
                          </span>
                        )}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          ) : nexusMap === undefined ? (
            <div className="text-muted-foreground">Loading Nexus map...</div>
          ) : (
            <div className="text-muted-foreground bg-muted p-8 rounded-lg text-center max-w-lg mx-auto border-2 border-dashed border-muted-foreground/20">
              <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
              <h3 className="text-xl font-bold mb-2 text-foreground">No Pit Map Available</h3>
              <p className="text-sm mb-6">
                This event (<b>{activeEvent?.key}</b>) does not have a map on FRC Nexus yet. 
                If the event has started, try importing pit locations in the Event Setup.
              </p>
              <Button variant="outline" onClick={() => navigate("/setup")}>
                Go to Event Setup
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Popup Modal */}
      {selectedPit && selectedPitData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setSelectedPit(null)}>
          <div className="bg-card w-96 rounded-xl shadow-xl border p-6 space-y-4 relative" onClick={(e) => e.stopPropagation()}>
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute right-2 top-2"
              onClick={() => setSelectedPit(null)}
            >
              <X className="h-4 w-4" />
            </Button>
            
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Location</div>
                <div className="font-bold text-xl">{selectedPit}</div>
              </div>
            </div>

            <div>
              <div className="text-sm text-muted-foreground">Team</div>
              <div className="font-bold text-2xl">{selectedTeamNum || "N/A"}</div>
            </div>

            <div>
              <div className="text-sm text-muted-foreground">Status</div>
              <div className="mt-1">
                {selectedScoutingRecord ? (
                  <span className="px-2 py-1 bg-green-500/20 text-green-700 rounded-full text-xs font-semibold">Scouted</span>
                ) : (
                  <span className="px-2 py-1 bg-muted text-muted-foreground rounded-full text-xs font-semibold">Unscouted</span>
                )}
              </div>
            </div>

            <div>
              <div className="text-sm text-muted-foreground">Notes</div>
              <div className="text-sm mt-1 p-2 bg-muted rounded-md min-h-[100px]">
                {(selectedScoutingRecord?.notes && selectedScoutingRecord.notes !== "Imported from Nexus") 
                  ? selectedScoutingRecord.notes 
                  : "No notes available."}
              </div>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setSelectedPit(null)}>Close</Button>
              {selectedScoutingRecord ? (
                <Button onClick={() => {
                  setSelectedPit(null);
                  navigate(`/teams/${selectedTeamNum}`);
                }}>View Full Details</Button>
              ) : (
                selectedTeamNum && (
                  <Button onClick={() => {
                    setSelectedPit(null);
                    navigate(`/pit?team=${selectedTeamNum}&pit=${selectedPit}`);
                  }}>Scout Team</Button>
                )
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
