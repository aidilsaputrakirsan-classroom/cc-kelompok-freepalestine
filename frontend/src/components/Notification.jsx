import { useState, useEffect } from "react"

function Notification({ message, type, onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, 3000)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div style={{
      ...styles.notification,
      backgroundColor: type === "success" ? "#E2EFDA" : "#FBE5D6",
      color: type === "success" ? "#548235" : "#C00000",
      borderColor: type === "success" ? "#548235" : "#C00000",
    }}>
      <span>{type === "success" ? "✅" : "❌"} {message}</span>
      <button onClick={onClose} style={styles.close}>✕</button>
    </div>
  )
}

const styles = {
  notification: {
    position: "fixed",
    top: "1rem",
    right: "1rem",
    padding: "0.75rem 1.25rem",
    borderRadius: "8px",
    border: "2px solid",
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    fontSize: "0.9rem",
    fontWeight: "bold",
    zIndex: 1000,
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
    animation: "slideIn 0.3s ease-out",
  },
  close: {
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: "1rem",
    opacity: 0.7,
    padding: 0,
  },
}

export default Notification
