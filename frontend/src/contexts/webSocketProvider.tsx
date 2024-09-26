import { BACKEND_DEV_WS_URL } from "@shared/constants";
import { WebSocketContextType } from "@shared/types";
import React, {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from "react";

const WebSocketContext = createContext<WebSocketContextType | undefined>(
  undefined,
);

type WebSocketProviderProps = PropsWithChildren;

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}: WebSocketProviderProps) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    const newSocket = new WebSocket(`${BACKEND_DEV_WS_URL}/ws`);

    newSocket.onopen = (event) => {
      console.log("WebSocket client opened", event);
    };

    newSocket.onmessage = (event) => {
      console.log("Received message:", event.data);
    };

    newSocket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    newSocket.onclose = (event) => {
      console.log("WebSocket client closed", event);
    };

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  return (
    <WebSocketContext.Provider value={{ socket }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error("useWebSocket must be used within a WebSocketProvider");
  }
  return context;
};
