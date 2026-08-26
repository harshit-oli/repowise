import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { serverUrl } from "../App";
import { setConversations, setChatHistory, setActiveConversation } from "../redux/chatSlice";

const ChatTab = ({ repoId }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { conversations, chatHistory, activeConversation } = useSelector(state => state.chat);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [creatingConvo, setCreatingConvo] = useState(false);
  const [creditsExhausted, setCreditsExhausted] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const result = await axios.get(`${serverUrl}/api/chat/getConversations/${repoId}`, { withCredentials: true });
        dispatch(setConversations(result.data.conversations));
      } catch (error) {
        console.log(error);
      }
    };
    fetchConversations();
  }, [repoId]);

  useEffect(() => {
    if (!activeConversation) return;
    const fetchHistory = async () => {
      try {
        const result = await axios.get(`${serverUrl}/api/chat/getChatHistory/${repoId}/${activeConversation._id}`, { withCredentials: true });
        dispatch(setChatHistory(result.data.chat));
      } catch (error) {
        console.log(error);
      }
    };
    fetchHistory();
  }, [activeConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, sending]);

    const handleCreateConversation = async () => {
        if (!newTitle.trim()) return;
        setCreatingConvo(true);
        try {
        const result = await axios.post(`${serverUrl}/api/chat/createConversation/${repoId}`, { title: newTitle }, { withCredentials: true });
        dispatch(setConversations([result.data.conversation, ...(conversations || [])]));
        dispatch(setActiveConversation(result.data.conversation));
        dispatch(setChatHistory([]));
        setNewTitle("");
        setShowSidebar(false);
        } catch (error) {
        console.log(error);
        } finally {
        setCreatingConvo(false);
        }
    };

  const handleSendMessage = async () => {
    if (!message.trim() || !activeConversation || sending) return;
    setSending(true);
    const userMsg = message;
    setMessage("");
    dispatch(setChatHistory([...(chatHistory || []), { role: "User", content: userMsg, _id: Date.now() }]));
    try {
      const result = await axios.post(`${serverUrl}/api/chat/sendMessage/${repoId}`, {
        content: userMsg,
        conversationId: activeConversation._id
      }, { withCredentials: true });
      dispatch(setChatHistory([...(chatHistory || []),
        { role: "User", content: userMsg, _id: Date.now() + 1 },
        { role: "Assistant", content: result.data.aiMessage, _id: Date.now() + 2 }
      ]));
    } catch (error) {
      if (error.response?.status === 403) {
        setCreditsExhausted(true);
        dispatch(setChatHistory([...(chatHistory || []), { role: "User", content: userMsg, _id: Date.now() }]));
      }
    } finally {
      setSending(false);
    }
  };

  const handleDeleteConversation = async (convId, e) => {
    e.stopPropagation();
    try {
      await axios.delete(`${serverUrl}/api/chat/deleteConversation/${convId}`, { withCredentials: true });
      dispatch(setConversations(conversations.filter(c => c._id !== convId)));
      if (activeConversation?._id === convId) {
        dispatch(setActiveConversation(null));
        dispatch(setChatHistory(null));
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleClearChat = async () => {
    if (!activeConversation) return;
    try {
      await axios.delete(`${serverUrl}/api/chat/clearChat/${repoId}/${activeConversation._id}`, { withCredentials: true });
      dispatch(setChatHistory([]));
    //   setCreditsExhausted(false);
    } catch (error) {
      console.log(error);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const Sidebar = () => (
    <div className="flex flex-col gap-3 h-full">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl p-4">
        <p className="text-sm font-semibold text-slate-300 mb-2">New chat</p>
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleCreateConversation()}
          placeholder="Give it a name..."
          className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-slate-200 outline-none placeholder-slate-500 focus:border-blue-500 transition-colors mb-2"
        />
        <button
          onClick={handleCreateConversation}
          disabled={creatingConvo || !newTitle.trim()}
          className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-40 rounded-xl py-2 text-sm font-semibold text-white cursor-pointer transition-colors"
        >
          {creatingConvo ? "Creating..." : "+ New chat"}
        </button>
      </div>

      <div className="bg-gray-900 border border-gray-700 rounded-2xl p-3 flex-1 overflow-y-auto">
        <p className="text-xs text-white uppercase tracking-widest mb-2 px-1">History</p>
        {!conversations || conversations.length === 0 ? (
          <p className="text-sm text-white text-center py-5">No chats yet</p>
        ) : (
          <div className="flex flex-col gap-1">
            {conversations.map((conv) => (
              <div
                key={conv._id}
                onClick={() => { dispatch(setActiveConversation(conv)); setCreditsExhausted(false); setShowSidebar(false); }}
                className={`flex items-center justify-between gap-1 px-3 py-2 rounded-xl cursor-pointer transition-colors group
                  ${activeConversation?._id === conv._id
                    ? "bg-blue-600/20 border border-blue-600/30"
                    : "hover:bg-gray-800 border border-transparent"
                  }`}
              >
                <p className="text-sm text-slate-200 truncate flex-1">{conv.title}</p>
                <button
                  onClick={(e) => handleDeleteConversation(conv._id, e)}
                  className="text-white hover:text-gray-500 text-sm opacity-0 group-hover:opacity-100 transition-all cursor-pointer flex-shrink-0"
                >✕</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex gap-3 h-[620px] relative">
      {showSidebar && (
        <div className="fixed inset-0 bg-black/50 z-20 md:hidden" onClick={() => setShowSidebar(false)} />
      )}
      <div className="hidden md:flex flex-col w-56 flex-shrink-0">
        <Sidebar />
      </div>
      <div className={`fixed top-0 left-0 h-full w-64 z-30 p-4 bg-gray-700 flex flex-col gap-3 transition-transform duration-300 md:hidden
        ${showSidebar ? "translate-x-0" : "-translate-x-full"}`}>
        <button onClick={() => setShowSidebar(false)} className="text-white text-sm self-end cursor-pointer mb-1">✕ Close</button>
        <Sidebar />
      </div>
      <div className="flex-1 flex flex-col bg-gray-800 border border-gray-600 rounded-2xl overflow-hidden min-w-0">
        {!activeConversation ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center p-8">
            <button
              onClick={() => setShowSidebar(true)}
              className="md:hidden mb-2 text-sm text-blue-200 border border-blue-500 rounded-xl px-4 py-2 cursor-pointer"
            >
              View Chats
            </button>
            <p className="text-lg font-semibold text-white">Chat Here</p>
            <p className="text-sm white">Ask anything about this repo</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700 gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <button onClick={() => setShowSidebar(true)} className="md:hidden text-slate-400 hover:text-white text-lg cursor-pointer flex-shrink-0">☰</button>
                <p className="text-base font-semibold text-slate-100 truncate">{activeConversation.title}</p>
              </div>
              <button
                onClick={handleClearChat}
                className="text-sm p-2 rounded-xl bg-blue-500 text-white hover:text-gray-300 cursor-pointer transition-colors flex-shrink-0"
              >
                Clear
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
              {!chatHistory || chatHistory.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 text-center h-full">
                  <p className="text-sm text-slate-400">Ask me anything about this repo</p>
                </div>
              ) : (
                chatHistory.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === "User" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[85%] md:max-w-[75%] px-4 py-2.5 text-sm leading-relaxed rounded-2xl
                      ${msg.role === "User"
                        ? "bg-blue-400 text-white rounded-br-sm"
                        : "bg-gray-600 text-slate-200 border border-gray-500 rounded-bl-sm"
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))
              )}
              {sending && (
                <div className="flex justify-start">
                  <div className="bg-gray-800 border border-gray-700 rounded-2xl rounded-bl-sm px-4 py-2.5 text-sm text-slate-400">
                    Thinking...
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            <div className="px-4 py-3 border-t border-gray-700">
              {creditsExhausted ? (
                <div className="flex flex-wrap items-center justify-between gap-3 bg-amber-800 border border-amber-800 rounded-xl px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-amber-400">Credits exhausted</p>
                    <p className="text-xs text-amber-600 mt-0.5">Upgrade to Pro to keep chatting</p>
                  </div>
                  <button
                    onClick={() => navigate("/subscription")}
                    className="bg-amber-500 hover:bg-amber-400 rounded-lg px-4 py-2 text-sm font-semibold text-white cursor-pointer transition-colors"
                  >
                    Upgrade →
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Ask something about the code..."
                      disabled={sending}
                      className="flex-1 bg-gray-800 border border-gray-700 focus:border-blue-400 rounded-xl px-4 py-2.5 text-sm text-slate-200 outline-none placeholder-slate-500 transition-colors disabled:opacity-50 min-w-0"
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={sending || !message.trim()}
                      className="bg-blue-600 hover:bg-blue-500 disabled:opacity-40 rounded-xl px-4 py-2.5 text-sm font-semibold text-white cursor-pointer transition-colors flex-shrink-0"
                    >
                      {sending ? "..." : "Send"}
                    </button>
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ChatTab;
