import { XIcon } from "lucide-react";
import { useChatStore } from "../store/useChatStore";
import { useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";
import React from "react";
function ChatHeader() {
  const { selectedUser, setSelectedUser, isTyping, toggleContactInfo } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const isOnline = onlineUsers.includes(selectedUser._id);

  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === "Escape") setSelectedUser(null);
    };

    window.addEventListener("keydown", handleEscKey);

    // cleanup function
    return () => window.removeEventListener("keydown", handleEscKey);
  }, [setSelectedUser]);

  return (
    <div
      className="flex justify-between items-center bg-slate-800/50 border-b
   border-slate-700/50 max-h-[84px] px-6 flex-1"
    >
      <div 
        onClick={toggleContactInfo}
        className="flex items-center space-x-3 cursor-pointer hover:bg-slate-700/30 px-2 py-1.5 rounded-lg transition-colors"
      >
        <button onClick={() => setSelectedUser(null)} className="sm:hidden mr-1">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-slate-400 hover:text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <div className={`avatar ${(isOnline && !selectedUser.members) ? "online" : ""}`}>
          <div className="w-12 rounded-full">
            <img src={selectedUser.profilePic || selectedUser.groupPic || "/avatar.png"} alt={selectedUser.fullName || selectedUser.name} />
          </div>
        </div>

        <div>
          <h3 className="text-slate-200 font-medium">{selectedUser.fullName || selectedUser.name}</h3>
          <p className="text-sm">
            {isTyping ? (
              <span className="text-[#00a884] italic font-medium">typing...</span>
            ) : selectedUser.members ? (
              <span className="text-slate-400">
                  {selectedUser.members.map(m => m.fullName?.split(' ')[0] || "User").slice(0, 3).join(", ")}{selectedUser.members.length > 3 ? "..." : ""}
              </span>
            ) : (
              <span className="text-slate-400">{isOnline ? "Online" : "Offline"}</span>
            )}
          </p>
        </div>
      </div>

      <button onClick={() => setSelectedUser(null)} className="hidden sm:block">
        <XIcon className="w-5 h-5 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer" />
      </button>
    </div>
  );
}
export default ChatHeader;