import { useEffect, useRef } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import ChatHeader from "./ChatHeader";
import NoChatHistoryPlaceholder from "./NoChatHistoryPlaceholder";
import MessageInput from "./MessageInput";
import MessagesLoadingSkeleton from "./MessagesLoadingSkeleton";
import { CheckCheck, GlobeIcon, Loader2Icon, Star, Reply, MessageSquare, Copy, SmilePlus, Forward, ThumbsDown, Trash2 } from "lucide-react";
import React, { useState } from "react";
import toast from "react-hot-toast";

function ChatContainer() {
  const {
    selectedUser,
    getMessagesByUserId,
    messages,
    isMessagesLoading,
    subscribeToMessages,
    unsubscribeFromMessages,
    translateMessage,
    isSearching,
    searchQuery,
    setSearchQuery,
    deleteMessage,
    allContacts,
    setSelectedUser
  } = useChatStore();
  const { authUser, toggleStarMessage } = useAuthStore();
  const messageEndRef = useRef(null);

  const [translations, setTranslations] = useState({});
  const [translatingId, setTranslatingId] = useState(null);
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, msg: null });

  const handleTranslate = async (msgId, originalText) => {
      setTranslatingId(msgId);
      const translated = await translateMessage(originalText, "English");
      if (translated) {
          setTranslations(prev => ({ ...prev, [msgId]: translated }));
      }
      setTranslatingId(null);
  };

  const handleContextMenu = (e, msg) => {
      e.preventDefault();
      setContextMenu({ visible: true, x: e.pageX, y: e.pageY, msg });
  };

  const closeContextMenu = () => {
      if (contextMenu.visible) setContextMenu({ ...contextMenu, visible: false });
  };

  useEffect(() => {
    getMessagesByUserId(selectedUser._id);
    subscribeToMessages();
    return () => unsubscribeFromMessages();
  }, [selectedUser, getMessagesByUserId, subscribeToMessages, unsubscribeFromMessages]);

  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const filteredMessages = messages.filter(msg => {
      const matchesSearch = !searchQuery || (msg.text && msg.text.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesStarred = !useChatStore.getState().showStarredOnly || authUser?.starredMessages?.includes(msg._id);
      return matchesSearch && matchesStarred;
  });

  return (
    <>
      <ChatHeader />
      
      {isSearching && (
          <div className="bg-[#202c33] p-3 border-b border-[#2a3942] animate-slideDown">
              <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search messages..." 
                  className="w-full bg-[#2a3942] text-[#e9edef] px-4 py-2 rounded-lg outline-none border border-[#2a3942] focus:border-[#00a884] transition-colors"
                  autoFocus
              />
          </div>
      )}

      <div className="flex-1 px-[4%] lg:px-[9%] py-6 overflow-y-auto space-y-3 bg-[#0b141a]" onClick={closeContextMenu} onScroll={closeContextMenu}>
        {filteredMessages.length > 0 && !isMessagesLoading ? (
          <div className="w-full flex flex-col space-y-3">
            {filteredMessages.map((msg) => {
              const isSent = msg.senderId === authUser._id;
              const isGroup = !!selectedUser.members;
              const sender = (isGroup && !isSent) ? (allContacts.find(c => c._id === msg.senderId) || selectedUser.members?.find(m => m._id === msg.senderId)) : null;

              return (
                <div
                  key={msg._id}
                  className={`flex w-full ${isSent ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`relative max-w-[85%] md:max-w-[65%] rounded-xl px-3 pt-2 pb-1.5 shadow-sm 
                      ${isSent ? "bg-[#005c4b] text-[#e9edef] rounded-tr-none" : "bg-[#202c33] text-[#e9edef] rounded-tl-none"} cursor-context-menu`}
                    onContextMenu={(e) => handleContextMenu(e, msg)}
                  >
                    {sender && (
                        <div className="text-[13px] font-medium text-[#ee82ee] mb-1">
                            {sender.fullName || "User"}
                        </div>
                    )}
                    {msg.image && (
                      <img src={msg.image} alt="Shared" className="rounded-lg max-h-60 object-cover mb-2" />
                    )}
                    {msg.text && (
                      <div className="text-[15px] leading-snug break-words">
                        {translations[msg._id] || msg.text}
                      </div>
                    )}
                    <div className="text-[11px] opacity-75 mt-1 flex items-center justify-end gap-1.5 min-w-[100px]">
                      {msg.text && (
                          <button 
                              onClick={() => handleTranslate(msg._id, msg.text)}
                              className="mr-auto hover:text-white transition flex items-center"
                              title="Translate exclusively to English via AI"
                          >
                             {translatingId === msg._id ? <Loader2Icon className="w-3.5 h-3.5 animate-spin opacity-80" /> : <GlobeIcon className="w-3.5 h-3.5 opacity-80 hover:opacity-100" />}
                          </button>
                      )}
                      <span className="opacity-80">
                        {new Date(msg.createdAt).toLocaleTimeString(undefined, {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      {authUser?.starredMessages?.includes(msg._id) && (
                        <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                      )}
                      {isSent && (
                        <CheckCheck className={`w-3.5 h-3.5 ${msg.isOptimistic ? "text-slate-400" : "text-[#53bdeb]"}`} />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            {/* 👇 scroll target */}
            <div ref={messageEndRef} />
          </div>
        ) : isMessagesLoading ? (
          <MessagesLoadingSkeleton />
        ) : (
          <NoChatHistoryPlaceholder name={selectedUser.fullName} />
        )}
      </div>

      {(() => {
          const isGroup = !!selectedUser.members;
          const isAdmin = isGroup && selectedUser.admins?.some(a => a._id === authUser._id);
          
          if (isGroup && selectedUser.onlyAdminsCanPost && !isAdmin) {
              return (
                  <div className="bg-[#202c33] px-4 py-3.5 flex justify-center items-center border-t border-[#2a3942]">
                      <span className="text-[#8696a0] text-[15px]">Only <span className="text-[#00a884] font-medium">admins</span> can send messages</span>
                  </div>
              );
          }
          return <MessageInput />;
      })()}

      {/* Context Menu Popup Map */}
      {contextMenu.visible && (
          <div 
              style={{ 
                  top: Math.min(contextMenu.y, window.innerHeight - 380), 
                  left: Math.min(contextMenu.x, window.innerWidth - 260) 
              }}
              className="fixed bg-[#233138] border border-[#222d34] shadow-2xl rounded-xl py-2 w-64 z-50 flex flex-col transition-all text-[15px] font-medium"
          >
              {(() => {
                  const msg = contextMenu.msg;
                  if (!msg) return null;
                  const isSent = msg.senderId === authUser._id;
                  const isGroup = !!selectedUser.members;
                  const senderUser = allContacts.find(c => c._id === msg.senderId) || selectedUser.members?.find(m => m._id === msg.senderId);
                  
                  return (
                      <>
                          {!isSent && isGroup && (
                              <>
                                  <button 
                                      className="px-6 py-2.5 flex items-center gap-4 text-slate-300 hover:bg-[#111b21] hover:text-slate-100 transition"
                                      onClick={() => {
                                          if (senderUser) setSelectedUser(senderUser);
                                          closeContextMenu();
                                      }}
                                  >
                                      <Reply className="w-5 h-5" /> Reply privately
                                  </button>
                                  <button 
                                      className="px-6 py-2.5 flex items-center gap-4 text-slate-300 hover:bg-[#111b21] hover:text-slate-100 transition"
                                      onClick={() => {
                                          if (senderUser) setSelectedUser(senderUser);
                                          closeContextMenu();
                                      }}
                                  >
                                      <MessageSquare className="w-5 h-5" /> Message {senderUser?.phoneNumber || senderUser?.fullName || "User"}
                                  </button>
                              </>
                          )}
                          
                          {msg.text && (
                              <button 
                                  className="px-6 py-2.5 flex items-center gap-4 text-slate-300 hover:bg-[#111b21] hover:text-slate-100 transition"
                                  onClick={() => {
                                      navigator.clipboard.writeText(msg.text);
                                      closeContextMenu();
                                  }}
                              >
                                  <Copy className="w-5 h-5" /> Copy
                              </button>
                          )}
                          

                          
                          <button 
                              className="px-6 py-2.5 flex items-center gap-4 text-slate-300 hover:bg-[#111b21] hover:text-slate-100 transition"
                              onClick={() => {
                                  toggleStarMessage(msg._id);
                                  closeContextMenu();
                              }}
                          >
                              <Star className={`w-5 h-5 ${authUser?.starredMessages?.includes(msg._id) ? "text-yellow-500 fill-yellow-500" : ""}`} /> 
                              {authUser?.starredMessages?.includes(msg._id) ? "Unstar" : "Star"}
                          </button>

                          <div className="h-px bg-[#2a3942] my-1.5 w-[90%] mx-auto" />

                          {!isSent && (
                              <button 
                                  className="px-6 py-2.5 flex items-center gap-4 text-slate-300 hover:bg-[#111b21] hover:text-slate-100 transition"
                                  onClick={() => { toast.success("Message reported to safety team"); closeContextMenu(); }}
                              >
                                  <ThumbsDown className="w-5 h-5" /> Report
                              </button>
                          )}
                          
                          {isSent && (
                              <button 
                                  className="px-6 py-2.5 flex items-center gap-4 text-[#f15c6d] hover:bg-[#111b21] transition"
                                  onClick={() => {
                                      deleteMessage(msg._id);
                                      closeContextMenu();
                                  }}
                              >
                                  <Trash2 className="w-5 h-5" /> Delete
                              </button>
                          )}
                      </>
                  );
              })()}
          </div>
      )}
    </>
  );
}

export default ChatContainer;