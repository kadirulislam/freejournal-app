import React from "react";
import { DriveStatus as DriveStatusType } from "../lib/driveSync";

interface DriveStatusProps {
  status: DriveStatusType;
  lastSynced: Date | null;
  onConnect: () => void;
  onSync: () => void;
}

function timeAgo(date: Date) {
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 5) return "just now";
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function DriveStatus({ status, lastSynced, onConnect, onSync }: DriveStatusProps) {
  if (status === "disconnected") {
    return (
      <div className="drive-bar drive-bar-disconnected">
        <span className="drive-bar-icon">☁</span>
        <span className="drive-bar-text">Not connected to Google Drive</span>
        <button className="drive-connect-btn" onClick={onConnect}>
          Connect
        </button>
      </div>
    );
  }

  if (status === "connecting") {
    return (
      <div className="drive-bar drive-bar-connecting">
        <span className="drive-spinner" />
        <span className="drive-bar-text">Connecting to Google Drive…</span>
      </div>
    );
  }

  if (status === "syncing") {
    return (
      <div className="drive-bar drive-bar-syncing">
        <span className="drive-spinner" />
        <span className="drive-bar-text">Syncing to Google Drive…</span>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="drive-bar drive-bar-error">
        <span className="drive-bar-icon">⚠</span>
        <span className="drive-bar-text">Drive sync failed</span>
        <button className="drive-retry-btn" onClick={onSync}>
          Retry
        </button>
      </div>
    );
  }

  // synced
  return (
    <div className="drive-bar drive-bar-synced">
      <span className="drive-bar-icon drive-bar-check">✓</span>
      <span className="drive-bar-text">
        Saved to Google Drive
        {lastSynced && (
          <span className="drive-bar-time"> · {timeAgo(lastSynced)}</span>
        )}
      </span>
      <button className="drive-sync-btn" onClick={onSync} title="Sync now">
        ↺
      </button>
    </div>
  );
}
