import React, { createContext, useContext } from "react";
import { message } from "antd";

const MessageContext = createContext(null);

export const MessageProvider = ({ children }) => {
  const [messageApi, contextHolder] = message.useMessage();

  const showMessage = {
    success: (content) => messageApi.success(content),
    error: (content) => messageApi.error(content),
    warning: (content) => messageApi.warning(content),
  };

  return (
    <MessageContext.Provider value={showMessage}>
      {contextHolder}
      {children}
    </MessageContext.Provider>
  );
};

export const useMessageApi = () => useContext(MessageContext);
