import { createContext, useContext, useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";

const RoomContext = createContext(null);

export function RoomProvider({ children }) {
  const [currentRoomId, setCurrentRoomId] = useState(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [code, setCode] = useState(`// Welcome to your collaborative room!
// Start coding together...
function greet() {
  console.log("Hello, multiplayer world!");
}`);
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const socketRef = useRef(null);
  const joiningRoomRef = useRef(null);

  // Leave room logic
  const leaveRoom = () => {
    if (socketRef.current && currentRoomId) {
      socketRef.current.emit("leave-room", { roomId: currentRoomId });
      socketRef.current.disconnect();
    }
    socketRef.current = null;
    joiningRoomRef.current = null;
    setCurrentRoomId(null);
    setIsMinimized(false);
    setCode(`// Welcome to your collaborative room!
// Start coding together...
function greet() {
  console.log("Hello, multiplayer world!");
}`);
    setUsers([]);
    setMessages([]);
    setUnreadMessages(0);
  };

  // Join room logic
  const joinRoom = (roomId, token) => {
    if (joiningRoomRef.current === roomId && socketRef.current) {
      // Already connected/connecting and inside this room, just ensure maximized
      setIsMinimized(false);
      setUnreadMessages(0);
      return;
    }

    // If joining a different room, leave the current one first
    if (joiningRoomRef.current && joiningRoomRef.current !== roomId) {
      leaveRoom();
    }

    joiningRoomRef.current = roomId;
    setCurrentRoomId(roomId);
    setIsMinimized(false);
    setUnreadMessages(0);

    const socket = io(import.meta.env.VITE_API_URL || "https://devhub-hxqe.onrender.com");
    socketRef.current = socket;

    // Attach listeners before emitting join request
    socket.on("room-joined", ({ users }) => {
      setUsers(users);
    });

    socket.on("user-joined", ({ username, users }) => {
      setUsers(users);
      setMessages((prev) => [
        ...prev,
        { system: true, text: `${username} joined the room` },
      ]);
    });

    socket.on("user-updated", ({ users }) => {
      setUsers(users);
    });

    socket.on("user-left", ({ username, users }) => {
      setUsers(users);
      setMessages((prev) => [
        ...prev,
        { system: true, text: `${username} left the room` },
      ]);
    });

    socket.on("code-update", ({ code }) => {
      setCode(code);
    });

    socket.on("new-message", (msg) => {
      setMessages((prev) => [...prev, msg]);
      
      // Increment unread messages count if minimized
      setIsMinimized((minimized) => {
        if (minimized) {
          setUnreadMessages((count) => count + 1);
        }
        return minimized;
      });
    });

    socket.on("error", (err) => {
      alert(err.message);
      leaveRoom();
    });

    socket.on("room-closed", ({ message }) => {
      alert(message);
      leaveRoom();
      window.location.href = "/rooms";
    });

    // Now emit join request
    socket.emit("join-room", { roomId, token });
  };

  const updateCode = (newCode) => {
    setCode(newCode);
    if (socketRef.current && currentRoomId) {
      socketRef.current.emit("code-change", { roomId: currentRoomId, code: newCode });
    }
  };

  const sendMessage = (messageText) => {
    if (socketRef.current && currentRoomId) {
      socketRef.current.emit("send-message", {
        roomId: currentRoomId,
        message: messageText,
        timestamp: new Date().toISOString(),
      });
    }
  };

  // Disconnect when context is unmounted
  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  return (
    <RoomContext.Provider
      value={{
        currentRoomId,
        isMinimized,
        setIsMinimized,
        code,
        setCode,
        users,
        messages,
        unreadMessages,
        setUnreadMessages,
        joinRoom,
        leaveRoom,
        updateCode,
        sendMessage,
      }}
    >
      {children}
    </RoomContext.Provider>
  );
}

export function useRoom() {
  const context = useContext(RoomContext);
  if (!context) {
    throw new Error("useRoom must be used within a RoomProvider");
  }
  return context;
}
