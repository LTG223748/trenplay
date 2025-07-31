import React, { createContext, useState, useContext, ReactNode } from "react";

type Notification = {
  message: string;
  type: "success" | "error" | "info";
};

interface NotificationContextType {
  notify: (notification: Notification) => void;
  notification: Notification | null;
  clear: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notification, setNotification] = useState<Notification | null>(null);

  const notify = (notification: Notification) => setNotification(notification);
  const clear = () => setNotification(null);

  return (
    <NotificationContext.Provider value={{ notify, notification, clear }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification must be used within a NotificationProvider");
  }
  return context;
};
