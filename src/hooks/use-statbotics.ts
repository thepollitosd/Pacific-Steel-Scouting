import { useState, useEffect } from "react";

export function useStatboticsEvent(eventKey: string | undefined) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!eventKey) return;
    let mounted = true;
    setLoading(true);
    fetch(`https://api.statbotics.io/v3/team_events?event=${eventKey}`)
      .then(r => r.json())
      .then(d => {
        if (mounted) {
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
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!team || !year) return;
    let mounted = true;
    setLoading(true);
    fetch(`https://api.statbotics.io/v3/team_year/${team}/${year}`)
      .then(r => r.json())
      .then(d => {
        if (mounted) {
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
