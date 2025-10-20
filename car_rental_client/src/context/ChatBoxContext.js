import React, { createContext, useContext, useState } from "react";

const ChatBoxContext = createContext();

export const ChatBoxProvider = ({ children }) => {
  const [open, setOpen] = useState(false);
  const openChatBox = () => setOpen(true);
  const closeChatBox = () => setOpen(false);
  return (
    <ChatBoxContext.Provider value={{ open, openChatBox, closeChatBox }}>
      {children}
    </ChatBoxContext.Provider>
  );
};

export const useChatBox = () => useContext(ChatBoxContext);
