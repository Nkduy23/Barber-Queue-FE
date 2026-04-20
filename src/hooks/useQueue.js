import { useEffect, useState, useCallback } from "react";
import { useSocket } from "./useSocket";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export function useQueue(date = null) {
  const [queue, setQueue] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const socket = useSocket();

  const fetchQueue = useCallback(async () => {
    try {
      const query = date ? `?date=${date}` : "";
      const res = await fetch(`${API}/api/queue${query}`);
      const data = await res.json();
      setQueue(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Lỗi fetch queue:", err);
    } finally {
      setLoading(false);
    }
  }, [date]);

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
    const handler = (data) => {
      const rows = Array.isArray(data) ? data : [];
      // Chỉ update queue nếu đang xem hôm nay hoặc không filter ngày
      if (!date) setQueue(rows);

      const waiting = rows.filter((q) => q.status === "waiting");
      const currentServing = rows.filter((q) => q.status === "serving");

      // Tính avg duration từ services nếu có, fallback 25p
      const avgDur = currentServing.length ? (currentServing[0]?.total_duration ?? 25) : 25;

      setStats((prev) => ({
        ...prev,
        waitingCount: waiting.length,
        currentServing,
        estimatedWaitMinutes: Math.ceil(waiting.length / Math.max(currentServing.length, 1)) * avgDur,
      }));
    };
    socket.on("queue_updated", handler);
    return () => socket.off("queue_updated", handler);
  }, [socket, date]);

  return { queue, stats, loading, refetch: fetchQueue };
}

// ── Slots ──────────────────────────────────────────────────────
export function useSlots(date) {
  const [slots, setSlots] = useState([]);
  const [settings, setSettings] = useState(null);
  const [activeBarbers, setActiveBarbers] = useState(0);
  const [loadingSlots, setLoadingSlots] = useState(true);

  const fetchSlots = useCallback(async () => {
    setLoadingSlots(true);
    try {
      const query = date ? `?date=${date}` : "";
      const res = await fetch(`${API}/api/queue/slots${query}`);
      const data = await res.json();
      setSlots(data.slots || []);
      setSettings(data.settings || null);
      setActiveBarbers(data.activeBarbers || 0);
    } catch (err) {
      console.error("Lỗi fetch slots:", err);
    } finally {
      setLoadingSlots(false);
    }
  }, [date]);

  useEffect(() => {
    fetchSlots();
  }, [fetchSlots]);

  return { slots, settings, activeBarbers, loadingSlots, refetchSlots: fetchSlots };
}

// ── Barbers ────────────────────────────────────────────────────
export function useBarbers(token) {
  const [barbers, setBarbers] = useState([]);

  const fetchBarbers = useCallback(async () => {
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch(`${API}/api/queue/barbers`, { headers });
      const data = await res.json();
      setBarbers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Lỗi fetch barbers:", err);
    }
  }, [token]);

  useEffect(() => {
    fetchBarbers();
  }, [fetchBarbers]);

  return { barbers, refetchBarbers: fetchBarbers };
}

// ── Services ───────────────────────────────────────────────────
export function useServices() {
  const [services, setServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(true);

  useEffect(() => {
    fetch(`${API}/api/services`)
      .then((r) => r.json())
      .then((data) => setServices(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoadingServices(false));
  }, []);

  return { services, loadingServices };
}
