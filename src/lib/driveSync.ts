import { Journal } from "../types/journal";

const API_BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

export type DriveStatus =
  | "disconnected"
  | "connecting"
  | "syncing"
  | "synced"
  | "error";

export async function checkDriveConnection(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/api/drive/status`);
    if (!res.ok) return false;
    const data = await res.json();
    return data.connected === true;
  } catch {
    return false;
  }
}

export async function loadFromDrive(): Promise<Journal[] | null> {
  try {
    const res = await fetch(`${API_BASE}/api/drive/load`);
    if (!res.ok) return null;
    const data = await res.json();
    return data.journals as Journal[];
  } catch {
    return null;
  }
}

export async function saveToDrive(journals: Journal[]): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/api/drive/save`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ journals }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
