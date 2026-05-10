import { useState, useEffect } from "react";

// Simple in-memory cache to persist data across component unmounts
const eventCache: Record<string, any[]> = {};
const teamYearCache: Record<string, any> = {};

export function useStatboticsEvent(eventKey: string | undefined) {
  const [data, setData] = useState<any[]>(() => eventKey ? (eventCache[eventKey] || []) : []);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!eventKey) return;
    let mounted = true;
    
    if (eventCache[eventKey]) {
      setData(eventCache[eventKey]);
    }
    
    setLoading(true);
    fetch(`https://api.statbotics.io/v3/team_events?event=${eventKey}`)
      .then(r => r.json())
      .then(d => {
        if (mounted) {
          eventCache[eventKey] = d;
          setData(d);
          setLoading(false);
        }
      })
      .catch(e => {
        console.error("Failed to fetch Statbotics event data:", e);
        if (mounted) setLoading(false);
      });
    return () => { mounted = false; };
  }, [eventKey]);

  return { data, loading };
}

export function useStatboticsTeamYear(team: number | undefined, year: number | undefined) {
  const cacheKey = `${team}-${year}`;
  const [data, setData] = useState<any>(() => cacheKey ? (teamYearCache[cacheKey] || null) : null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!team || !year) return;
    let mounted = true;
    
    const key = `${team}-${year}`;
    if (teamYearCache[key]) {
      setData(teamYearCache[key]);
    }

    setLoading(true);
    fetch(`https://api.statbotics.io/v3/team_year/${team}/${year}`)
      .then(r => r.json())
      .then(d => {
        if (mounted) {
          teamYearCache[key] = d;
          setData(d);
          setLoading(false);
        }
      })
      .catch(e => {
        console.error("Failed to fetch Statbotics team year data:", e);
        if (mounted) setLoading(false);
      });
    return () => { mounted = false; };
  }, [team, year]);

  return { data, loading };
}
