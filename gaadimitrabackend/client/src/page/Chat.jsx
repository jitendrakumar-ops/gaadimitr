import {
  ArrowLeft,
  CarFront,
  CheckCheck,
  Circle,
  Clock3,
  FileText,
  Image as ImageIcon,
  MapPin,
  MessageSquare,
  MoreVertical,
  Paperclip,
  Phone,
  Search,
  Send,
  ShieldCheck,
  Smile,
  UserRound,
  Video,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

/* =========================================================
   MOCK CONVERSATIONS
========================================================= */

const initialConversations = {
  admin: [
    {
      id: "admin-1",
      name: "Support Team",
      subtitle: "GaadiMitra Support",
      avatar: "GT",
      online: true,
      unread: 2,
      lastMessage: "Your request has been resolved.",
      lastTime: "10:42 AM",
      messages: [
        {
          id: 1,
          sender: "them",
          text: "Hi Vikram, how can we help you today?",
          time: "10:38 AM",
        },
        {
          id: 2,
          sender: "me",
          text: "I wanted to check the status of the recent system request.",
          time: "10:39 AM",
        },
        {
          id: 3,
          sender: "them",
          text: "Sure. Let me check that for you.",
          time: "10:40 AM",
        },
        {
          id: 4,
          sender: "them",
          text: "Your request has been resolved.",
          time: "10:42 AM",
        },
      ],
    },
    {
      id: "admin-2",
      name: "Operations Team",
      subtitle: "Operations",
      avatar: "OP",
      online: true,
      unread: 0,
      lastMessage: "We'll monitor the issue.",
      lastTime: "09:28 AM",
      messages: [
        {
          id: 1,
          sender: "them",
          text: "Good morning. We noticed an issue with a few rides.",
          time: "09:22 AM",
        },
        {
          id: 2,
          sender: "me",
          text: "Which rides are affected?",
          time: "09:24 AM",
        },
        {
          id: 3,
          sender: "them",
          text: "Around 6 rides in the Noida zone.",
          time: "09:26 AM",
        },
        {
          id: 4,
          sender: "them",
          text: "We'll monitor the issue.",
          time: "09:28 AM",
        },
      ],
    },
    {
      id: "admin-3",
      name: "Finance Team",
      subtitle: "Finance",
      avatar: "FN",
      online: false,
      unread: 0,
      lastMessage: "Payment report is ready.",
      lastTime: "Yesterday",
      messages: [
        {
          id: 1,
          sender: "them",
          text: "The monthly payment report is ready.",
          time: "Yesterday",
        },
      ],
    },
  ],

  user: [
    {
      id: "user-1",
      name: "Rahul Sharma",
      subtitle: "User • #USR10284",
      avatar: "RS",
      online: true,
      unread: 3,
      lastMessage: "The driver is not moving.",
      lastTime: "10:47 AM",
      messages: [
        {
          id: 1,
          sender: "them",
          text: "Hi, I need help with my current ride.",
          time: "10:43 AM",
        },
        {
          id: 2,
          sender: "me",
          text: "Sure Rahul. Please tell me what happened.",
          time: "10:44 AM",
        },
        {
          id: 3,
          sender: "them",
          text: "The driver is not moving.",
          time: "10:47 AM",
        },
      ],
    },
    {
      id: "user-2",
      name: "Priya Singh",
      subtitle: "User • #USR10283",
      avatar: "PS",
      online: false,
      unread: 0,
      lastMessage: "Thank you for resolving it.",
      lastTime: "09:52 AM",
      messages: [
        {
          id: 1,
          sender: "them",
          text: "I was charged extra for my last ride.",
          time: "09:45 AM",
        },
        {
          id: 2,
          sender: "me",
          text: "I'll check the ride details and payment information.",
          time: "09:48 AM",
        },
        {
          id: 3,
          sender: "them",
          text: "Thank you for resolving it.",
          time: "09:52 AM",
        },
      ],
    },
    {
      id: "user-3",
      name: "Ananya Verma",
      subtitle: "User • #USR10276",
      avatar: "AV",
      online: true,
      unread: 1,
      lastMessage: "Can I cancel my ride?",
      lastTime: "09:18 AM",
      messages: [
        {
          id: 1,
          sender: "them",
          text: "Can I cancel my ride?",
          time: "09:18 AM",
        },
      ],
    },
    {
      id: "user-4",
      name: "Karan Malhotra",
      subtitle: "User • #USR10280",
      avatar: "KM",
      online: false,
      unread: 0,
      lastMessage: "Got it, thanks.",
      lastTime: "Yesterday",
      messages: [
        {
          id: 1,
          sender: "them",
          text: "Where can I see my previous rides?",
          time: "Yesterday",
        },
        {
          id: 2,
          sender: "me",
          text: "You can find them under Ride History.",
          time: "Yesterday",
        },
        {
          id: 3,
          sender: "them",
          text: "Got it, thanks.",
          time: "Yesterday",
        },
      ],
    },
  ],

  driver: [
    {
      id: "driver-1",
      name: "Amit Kumar",
      subtitle: "Driver • DL 8C AX 4281",
      avatar: "AK",
      online: true,
      unread: 2,
      lastMessage: "I'm waiting at the pickup point.",
      lastTime: "10:51 AM",
      messages: [
        {
          id: 1,
          sender: "them",
          text: "I'm having trouble finding the pickup location.",
          time: "10:49 AM",
        },
        {
          id: 2,
          sender: "me",
          text: "Please share your current location.",
          time: "10:50 AM",
        },
        {
          id: 3,
          sender: "them",
          text: "I'm waiting at the pickup point.",
          time: "10:51 AM",
        },
      ],
    },
    {
      id: "driver-2",
      name: "Rohit Verma",
      subtitle: "Driver • UP 16 BT 8214",
      avatar: "RV",
      online: true,
      unread: 0,
      lastMessage: "Documents have been uploaded.",
      lastTime: "09:44 AM",
      messages: [
        {
          id: 1,
          sender: "them",
          text: "Documents have been uploaded.",
          time: "09:44 AM",
        },
      ],
    },
    {
      id: "driver-3",
      name: "Sanjay Yadav",
      subtitle: "Driver • UP 14 DX 1028",
      avatar: "SY",
      online: false,
      unread: 1,
      lastMessage: "When will my verification complete?",
      lastTime: "09:12 AM",
      messages: [
        {
          id: 1,
          sender: "them",
          text: "When will my verification complete?",
          time: "09:12 AM",
        },
      ],
    },
    {
      id: "driver-4",
      name: "Vikas Singh",
      subtitle: "Driver • DL 01 AB 9271",
      avatar: "VS",
      online: true,
      unread: 0,
      lastMessage: "Thanks for the update.",
      lastTime: "Yesterday",
      messages: [
        {
          id: 1,
          sender: "me",
          text: "Your account has been successfully verified.",
          time: "Yesterday",
        },
        {
          id: 2,
          sender: "them",
          text: "Thanks for the update.",
          time: "Yesterday",
        },
      ],
    },
  ],
};

/* =========================================================
   CHAT PAGE
========================================================= */

const Chat = () => {
  const [activeType, setActiveType] = useState("user");

  const [conversations, setConversations] = useState(initialConversations);

  const [selectedId, setSelectedId] = useState(initialConversations.user[0].id);

  const [search, setSearch] = useState("");

  const [message, setMessage] = useState("");

  const [mobileChatOpen, setMobileChatOpen] = useState(false);

  const messagesEndRef = useRef(null);

  /* =======================================================
     ACTIVE CONVERSATIONS
  ======================================================= */

  const activeConversations = conversations[activeType];

  const selectedConversation = activeConversations.find(
    (conversation) => conversation.id === selectedId,
  );

  /* =======================================================
     SEARCH
  ======================================================= */

  const filteredConversations = useMemo(() => {
    const query = search.toLowerCase().trim();

    if (!query) return activeConversations;

    return activeConversations.filter(
      (conversation) =>
        conversation.name.toLowerCase().includes(query) ||
        conversation.subtitle.toLowerCase().includes(query) ||
        conversation.lastMessage.toLowerCase().includes(query),
    );
  }, [activeConversations, search]);

  /* =======================================================
     AUTO SCROLL
  ======================================================= */

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [selectedConversation?.messages]);

  /* =======================================================
     CHANGE CHAT TYPE
  ======================================================= */

  const changeType = (type) => {
    setActiveType(type);
    setSearch("");

    const firstConversation = conversations[type][0];

    if (firstConversation) {
      setSelectedId(firstConversation.id);
    }

    setMobileChatOpen(false);
  };

  /* =======================================================
     SELECT CONVERSATION
  ======================================================= */

  const selectConversation = (id) => {
    setSelectedId(id);
    setMobileChatOpen(true);

    setConversations((prev) => ({
      ...prev,
      [activeType]: prev[activeType].map((conversation) =>
        conversation.id === id
          ? {
              ...conversation,
              unread: 0,
            }
          : conversation,
      ),
    }));
  };

  /* =======================================================
     SEND MESSAGE
  ======================================================= */

  const sendMessage = () => {
    const text = message.trim();

    if (!text || !selectedConversation) {
      return;
    }

    const now = new Date();

    const time = now.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    const newMessage = {
      id: Date.now(),
      sender: "me",
      text,
      time,
    };

    setConversations((prev) => ({
      ...prev,
      [activeType]: prev[activeType].map((conversation) =>
        conversation.id === selectedId
          ? {
              ...conversation,
              lastMessage: text,
              lastTime: time,
              messages: [...conversation.messages, newMessage],
            }
          : conversation,
      ),
    }));

    setMessage("");
  };

  /* =======================================================
     ENTER TO SEND
  ======================================================= */

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  /* =======================================================
     QUICK REPLY
  ======================================================= */

  const sendQuickReply = (text) => {
    setMessage(text);
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="h-[calc(100vh-120px)] min-h-[600px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_4px_25px_rgba(15,23,42,0.03)]">
      {/* =================================================
          CHAT HEADER / TYPE SWITCHER
      ================================================= */}

      <div className="flex h-[68px] items-center justify-between border-b border-slate-100 px-4 sm:px-5">
        <div className="flex items-center gap-1 rounded-xl bg-slate-50 p-1">
          <ChatTypeButton
            active={activeType === "admin"}
            icon={ShieldCheck}
            label="Admin"
            count={getUnreadCount(conversations.admin)}
            onClick={() => changeType("admin")}
          />

          <ChatTypeButton
            active={activeType === "user"}
            icon={UserRound}
            label="Users"
            count={getUnreadCount(conversations.user)}
            onClick={() => changeType("user")}
          />

          <ChatTypeButton
            active={activeType === "driver"}
            icon={CarFront}
            label="Drivers"
            count={getUnreadCount(conversations.driver)}
            onClick={() => changeType("driver")}
          />
        </div>

        <div className="hidden items-center gap-2 sm:flex">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />

            <span className="text-[10px] font-semibold text-slate-400">
              {activeConversations.filter((item) => item.online).length} online
            </span>
          </div>

          <button className="rounded-lg p-2 text-slate-400 hover:bg-slate-50">
            <MoreVertical size={17} />
          </button>
        </div>
      </div>

      {/* =================================================
          CHAT BODY
      ================================================= */}

      <div className="flex h-[calc(100%-68px)]">
        {/* =================================================
            CONVERSATION SIDEBAR
        ================================================= */}

        <div
          className={`
            flex w-full shrink-0 flex-col
            border-r border-slate-100
            bg-white
            md:w-[300px]
            lg:w-[330px]
            ${mobileChatOpen ? "hidden md:flex" : "flex"}
          `}
        >
          {/* Search */}
          <div className="border-b border-slate-100 p-3">
            <div
              className="
                flex h-10 items-center gap-2
                rounded-xl
                border border-slate-200
                bg-slate-50
                px-3
              "
            >
              <Search size={15} className="text-slate-400" />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search conversations..."
                className="
                  w-full bg-transparent
                  text-[11px] text-slate-700
                  outline-none
                  placeholder:text-slate-400
                "
              />
            </div>
          </div>

          {/* Inbox label */}
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-[10px] font-bold uppercase tracking-[1px] text-slate-400">
              Conversations
            </span>

            <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[8px] font-bold text-[#0757D9]">
              {filteredConversations.length}
            </span>
          </div>

          {/* Conversation List */}
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.map((conversation) => (
              <ConversationItem
                key={conversation.id}
                conversation={conversation}
                active={selectedId === conversation.id}
                onClick={() => selectConversation(conversation.id)}
              />
            ))}

            {filteredConversations.length === 0 && (
              <div className="px-5 py-12 text-center">
                <MessageSquare size={22} className="mx-auto text-slate-300" />

                <p className="mt-3 text-xs font-bold text-slate-500">
                  No conversations
                </p>

                <p className="mt-1 text-[10px] text-slate-400">
                  Try another search.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* =================================================
            ACTIVE CHAT
        ================================================= */}

        <div
          className={`
            flex min-w-0 flex-1 flex-col bg-[#F8FAFD]
            ${mobileChatOpen ? "flex" : "hidden md:flex"}
          `}
        >
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="flex h-[70px] shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-5">
                <div className="flex min-w-0 items-center gap-3">
                  {/* Mobile Back */}
                  <button
                    onClick={() => setMobileChatOpen(false)}
                    className="rounded-lg p-2 text-slate-500 hover:bg-slate-50 md:hidden"
                  >
                    <ArrowLeft size={18} />
                  </button>

                  <div className="relative">
                    <Avatar conversation={selectedConversation} />

                    {selectedConversation.online && (
                      <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h2 className="truncate text-xs font-extrabold text-slate-800 sm:text-sm">
                        {selectedConversation.name}
                      </h2>

                      {activeType === "admin" && (
                        <ShieldCheck size={13} className="text-[#0757D9]" />
                      )}
                    </div>

                    <div className="mt-0.5 flex items-center gap-1.5">
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          selectedConversation.online
                            ? "bg-emerald-500"
                            : "bg-slate-300"
                        }`}
                      />

                      <span className="text-[9px] text-slate-400">
                        {selectedConversation.online ? "Online" : "Offline"} •{" "}
                        {selectedConversation.subtitle}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button className="hidden rounded-lg p-2 text-slate-400 hover:bg-blue-50 hover:text-[#0757D9] sm:block">
                    <Phone size={16} />
                  </button>

                  <button className="hidden rounded-lg p-2 text-slate-400 hover:bg-blue-50 hover:text-[#0757D9] sm:block">
                    <Video size={17} />
                  </button>

                  <button className="rounded-lg p-2 text-slate-400 hover:bg-slate-100">
                    <MoreVertical size={17} />
                  </button>
                </div>
              </div>

              {/* =================================================
                  MESSAGES
              ================================================= */}

              <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-6">
                {/* Date */}
                <div className="mb-6 flex items-center justify-center">
                  <span className="rounded-full bg-white px-3 py-1 text-[8px] font-semibold text-slate-400 shadow-sm">
                    Today
                  </span>
                </div>

                <div className="space-y-3">
                  {selectedConversation.messages.map((item) => (
                    <MessageBubble key={item.id} message={item} />
                  ))}
                </div>

                <div ref={messagesEndRef} />
              </div>

              {/* =================================================
                  QUICK REPLIES
              ================================================= */}

              <div className="border-t border-slate-100 bg-white px-4 pt-2 sm:px-5">
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {getQuickReplies(activeType).map((reply) => (
                    <button
                      key={reply}
                      onClick={() => sendQuickReply(reply)}
                      className="
                          shrink-0 rounded-full
                          border border-slate-200
                          bg-white
                          px-3 py-1.5
                          text-[9px] font-medium
                          text-slate-500
                          transition
                          hover:border-blue-200
                          hover:bg-blue-50
                          hover:text-[#0757D9]
                        "
                    >
                      {reply}
                    </button>
                  ))}
                </div>
              </div>

              {/* =================================================
                  MESSAGE INPUT
              ================================================= */}

              <div className="bg-white px-3 pb-3 sm:px-5 sm:pb-4">
                <div
                  className="
                    flex items-end gap-2
                    rounded-2xl
                    border border-slate-200
                    bg-slate-50
                    p-2
                    transition
                    focus-within:border-blue-200
                    focus-within:bg-white
                    focus-within:shadow-[0_5px_20px_rgba(7,87,217,0.05)]
                  "
                >
                  <button
                    className="
                      mb-0.5 flex h-9 w-9 shrink-0
                      items-center justify-center
                      rounded-xl text-slate-400
                      hover:bg-white
                      hover:text-[#0757D9]
                    "
                  >
                    <Paperclip size={17} />
                  </button>

                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    rows={1}
                    placeholder="Write a message..."
                    className="
                      max-h-24 min-h-[36px]
                      flex-1 resize-none
                      bg-transparent
                      px-1 py-2
                      text-[11px]
                      text-slate-700
                      outline-none
                      placeholder:text-slate-400
                    "
                  />

                  <button
                    className="
                      mb-0.5 hidden h-9 w-9
                      shrink-0 items-center
                      justify-center
                      rounded-xl text-slate-400
                      hover:bg-white
                      hover:text-[#0757D9]
                      sm:flex
                    "
                  >
                    <Smile size={17} />
                  </button>

                  <button
                    onClick={sendMessage}
                    disabled={!message.trim()}
                    className="
                      mb-0.5 flex h-9 w-9
                      shrink-0 items-center
                      justify-center
                      rounded-xl
                      bg-[#0757D9]
                      text-white
                      shadow-[0_5px_15px_rgba(7,87,217,0.20)]
                      transition
                      hover:bg-[#064bbd]
                      disabled:cursor-not-allowed
                      disabled:bg-slate-200
                      disabled:text-slate-400
                      disabled:shadow-none
                    "
                  >
                    <Send size={16} className="translate-x-[-1px]" />
                  </button>
                </div>

                <p className="mt-1.5 hidden text-[8px] text-slate-300 sm:block">
                  Press Enter to send • Shift + Enter for new line
                </p>
              </div>
            </>
          ) : (
            <EmptyChat />
          )}
        </div>

        {/* =================================================
            DETAILS PANEL
        ================================================= */}

        <ChatDetails conversation={selectedConversation} type={activeType} />
      </div>
    </div>
  );
};

/* =========================================================
   CHAT TYPE BUTTON
========================================================= */

const ChatTypeButton = ({ active, icon: Icon, label, count, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-1.5
        rounded-lg px-3 py-2
        text-[9px] font-bold
        transition
        ${
          active
            ? "bg-white text-[#0757D9] shadow-sm"
            : "text-slate-400 hover:text-slate-600"
        }
      `}
    >
      <Icon size={14} />

      <span className="hidden sm:block">{label}</span>

      {count > 0 && (
        <span
          className="
            flex h-4 min-w-4
            items-center justify-center
            rounded-full
            bg-[#0757D9]
            px-1
            text-[7px]
            text-white
          "
        >
          {count}
        </span>
      )}
    </button>
  );
};

/* =========================================================
   CONVERSATION ITEM
========================================================= */

const ConversationItem = ({ conversation, active, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`
        flex w-full items-center gap-3
        px-4 py-3
        text-left
        transition
        ${
          active
            ? "border-r-2 border-[#0757D9] bg-blue-50/60"
            : "hover:bg-slate-50"
        }
      `}
    >
      <div className="relative shrink-0">
        <Avatar conversation={conversation} />

        {conversation.online && (
          <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p
            className={`
              truncate text-[11px]
              ${
                conversation.unread
                  ? "font-extrabold text-slate-800"
                  : "font-bold text-slate-700"
              }
            `}
          >
            {conversation.name}
          </p>

          <span className="shrink-0 text-[8px] text-slate-400">
            {conversation.lastTime}
          </span>
        </div>

        <div className="mt-1 flex items-center justify-between gap-2">
          <p
            className={`
              truncate text-[9px]
              ${
                conversation.unread
                  ? "font-semibold text-slate-600"
                  : "text-slate-400"
              }
            `}
          >
            {conversation.lastMessage}
          </p>

          {conversation.unread > 0 && (
            <span className="flex h-4 min-w-4 shrink-0 items-center justify-center rounded-full bg-[#0757D9] px-1 text-[7px] font-bold text-white">
              {conversation.unread}
            </span>
          )}
        </div>
      </div>
    </button>
  );
};

/* =========================================================
   MESSAGE BUBBLE
========================================================= */

const MessageBubble = ({ message }) => {
  const isMine = message.sender === "me";

  return (
    <div className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
      <div
        className={`
          max-w-[78%]
          sm:max-w-[65%]
          ${isMine ? "items-end" : "items-start"}
        `}
      >
        <div
          className={`
            rounded-2xl
            px-3.5 py-2.5
            ${
              isMine
                ? "rounded-br-md bg-[#0757D9] text-white shadow-[0_5px_15px_rgba(7,87,217,0.12)]"
                : "rounded-bl-md border border-slate-100 bg-white text-slate-700 shadow-sm"
            }
          `}
        >
          <p className="whitespace-pre-wrap break-words text-[11px] leading-5">
            {message.text}
          </p>
        </div>

        <div
          className={`
            mt-1 flex items-center gap-1
            ${isMine ? "justify-end" : "justify-start"}
          `}
        >
          <span className="text-[8px] text-slate-400">{message.time}</span>

          {isMine && <CheckCheck size={11} className="text-[#0757D9]" />}
        </div>
      </div>
    </div>
  );
};

/* =========================================================
   CHAT DETAILS
========================================================= */

const ChatDetails = ({ conversation, type }) => {
  if (!conversation) return null;

  return (
    <div className="hidden w-[240px] shrink-0 border-l border-slate-100 bg-white xl:block">
      <div className="border-b border-slate-100 px-5 py-4">
        <p className="text-[9px] font-bold uppercase tracking-[1px] text-slate-400">
          Conversation
        </p>

        <h3 className="mt-1 text-sm font-extrabold text-slate-800">Details</h3>
      </div>

      <div className="p-5">
        <div className="flex flex-col items-center text-center">
          <div className="relative">
            <Avatar conversation={conversation} large />

            {conversation.online && (
              <span className="absolute bottom-1 right-1 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
            )}
          </div>

          <h3 className="mt-3 text-sm font-extrabold text-slate-800">
            {conversation.name}
          </h3>

          <p className="mt-1 text-[9px] text-slate-400">
            {conversation.subtitle}
          </p>
        </div>

        <div className="mt-6 space-y-2">
          <DetailItem
            icon={Circle}
            label="Status"
            value={conversation.online ? "Online" : "Offline"}
            green={conversation.online}
          />

          <DetailItem
            icon={MessageSquare}
            label="Messages"
            value={`${conversation.messages.length}`}
          />

          <DetailItem
            icon={Clock3}
            label="Last active"
            value={conversation.lastTime}
          />
        </div>

        {type === "user" && (
          <div className="mt-6 rounded-xl bg-blue-50 p-3">
            <p className="text-[9px] font-bold text-[#0757D9]">User Support</p>

            <p className="mt-1 text-[8px] leading-4 text-blue-600/70">
              Check the user's ride history and account details before resolving
              support requests.
            </p>
          </div>
        )}

        {type === "driver" && (
          <div className="mt-6 rounded-xl bg-blue-50 p-3">
            <p className="text-[9px] font-bold text-[#0757D9]">
              Driver Support
            </p>

            <p className="mt-1 text-[8px] leading-4 text-blue-600/70">
              Driver related conversations can include ride, vehicle and
              document issues.
            </p>
          </div>
        )}

        <div className="mt-6 space-y-2">
          <button className="flex w-full items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-left text-[9px] font-bold text-slate-500 hover:bg-slate-50">
            <ImageIcon size={14} />
            Shared Media
          </button>

          <button className="flex w-full items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-left text-[9px] font-bold text-slate-500 hover:bg-slate-50">
            <FileText size={14} />
            Shared Documents
          </button>

          <button className="flex w-full items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-left text-[9px] font-bold text-slate-500 hover:bg-slate-50">
            <MapPin size={14} />
            Ride Location
          </button>
        </div>
      </div>
    </div>
  );
};

/* =========================================================
   DETAIL ITEM
========================================================= */

const DetailItem = ({ icon: Icon, label, value, green }) => {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
      <Icon
        size={14}
        className={green ? "text-emerald-500" : "text-slate-400"}
      />

      <div className="min-w-0">
        <p className="text-[8px] text-slate-400">{label}</p>

        <p
          className={`
            mt-0.5 text-[9px] font-bold
            ${green ? "text-emerald-600" : "text-slate-600"}
          `}
        >
          {value}
        </p>
      </div>
    </div>
  );
};

/* =========================================================
   AVATAR
========================================================= */

const Avatar = ({ conversation, large = false }) => {
  return (
    <div
      className={`
        flex shrink-0 items-center justify-center
        rounded-xl
        bg-gradient-to-br
        from-blue-50 to-blue-100
        font-extrabold text-[#0757D9]
        ${large ? "h-16 w-16 text-lg rounded-2xl" : "h-10 w-10 text-[10px]"}
      `}
    >
      {conversation.avatar}
    </div>
  );
};

/* =========================================================
   EMPTY CHAT
========================================================= */

const EmptyChat = () => {
  return (
    <div className="flex flex-1 flex-col items-center justify-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-[#0757D9]">
        <MessageSquare size={24} />
      </div>

      <h2 className="mt-4 text-sm font-extrabold text-slate-700">
        Select a conversation
      </h2>

      <p className="mt-1 text-xs text-slate-400">
        Choose a conversation to start chatting.
      </p>
    </div>
  );
};

/* =========================================================
   HELPERS
========================================================= */

const getUnreadCount = (items) => {
  return items.reduce((total, item) => total + item.unread, 0);
};

const getQuickReplies = (type) => {
  if (type === "driver") {
    return [
      "Please share your current location.",
      "We're checking this for you.",
      "Your request has been received.",
    ];
  }

  if (type === "admin") {
    return [
      "I'll check this for you.",
      "The request has been received.",
      "We'll get back to you shortly.",
    ];
  }

  return [
    "I'll check this for you.",
    "Please share your ride ID.",
    "We're looking into this.",
  ];
};

export default Chat;
