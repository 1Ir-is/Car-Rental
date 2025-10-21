import React, { createContext, useContext, useState } from "react";

const ChatBoxContext = createContext();

export const ChatBoxProvider = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [currentOwner, setCurrentOwner] = useState(null);

  // Mở chatbox, truyền owner nếu có (user chọn từ danh sách)
  const openChatBox = (owner = null) => {
    setOpen(true);
    setCurrentOwner(owner);
  };
  const closeChatBox = () => {
    setOpen(false);
    setCurrentOwner(null);
  };

  return (
    <ChatBoxContext.Provider
      value={{
        open,
        openChatBox,
        closeChatBox,
        currentOwner,
        setCurrentOwner,
      }}
    >
      {children}
    </ChatBoxContext.Provider>
  );
};

export const useChatBox = () => useContext(ChatBoxContext);
