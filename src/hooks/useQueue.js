import { useEffect, useState, useCallback } from "react";
import { useSocket } from "./useSocket";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export function useQueue() {
  const [queue, setQueue] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const socket = useSocket();

  const fetchQueue = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/queue`);
      const data = await res.json();
      setQueue(data);
    } catch (err) {
      console.error("Lỗi fetch queue:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/queue/stats`);
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error("Lỗi fetch stats:", err);
    }
  }, []);

  useEffect(() => {
    fetchQueue();
    fetchStats();
  }, [fetchQueue, fetchStats]);

  useEffect(() => {
    if (!socket) return;
    socket.on("queue_updated", (data) => {
      setQueue(data);
      const waiting = data.filter((q) => q.status === "waiting").length;
      const serving = data.find((q) => q.status === "serving") || null;
      setStats({ waitingCount: waiting, currentServing: serving, estimatedWaitMinutes: waiting * 20 });
    });
    return () => {
      socket.off("queue_updated");
    };
  }, [socket]);

  return { queue, stats, loading, refetch: fetchQueue };
}
