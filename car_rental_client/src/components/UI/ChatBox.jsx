import React, { useEffect, useState } from "react";
import { StreamChat } from "stream-chat";
import {
  Chat,
  Channel,
  Window,
  MessageList,
  MessageInput,
} from "stream-chat-react";
import "stream-chat-react/dist/css/index.css";

// Thay thế bằng key bạn cung cấp
const apiKey = "64vy7vqv8sfs";

export default function ChatBox({ user, owner }) {
  const [chatClient, setChatClient] = useState(null);
  const [channel, setChannel] = useState(null);

  useEffect(() => {
    if (!user || !owner) return;

    // Khởi tạo client
    const client = StreamChat.getInstance(apiKey);

    // Dùng dev token để test (không cần backend)
    const userToken = StreamChat.getDevToken(String(user.id));

    // Kết nối user hiện tại
    client
      .connectUser(
        {
          id: String(user.id),
          name: user.name,
          image: user.avatar,
        },
        userToken
      )
      .then(() => {
        // Tạo kênh chat giữa 2 user (private messaging)
        const channel = client.channel("messaging", {
          members: [String(user.id), String(owner.id)],
        });
        channel.watch();
        setChannel(channel);
        setChatClient(client);
      });

    // Cleanup khi unmount
    return () => {
      if (client) client.disconnectUser();
    };
  }, [user, owner]);

  if (!chatClient || !channel) {
    return <div style={{ height: "500px" }}>Đang tải chat...</div>;
  }

  return (
    <div style={{ height: "500px" }}>
      <Chat client={chatClient} theme="messaging light">
        <Channel channel={channel}>
          <Window>
            <MessageList />
            <MessageInput />
          </Window>
        </Channel>
      </Chat>
    </div>
  );
}
