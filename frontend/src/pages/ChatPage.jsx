import { useChatStore } from "../store/useChatStore";

import BorderAnimatedContainer from "../components/BorderAnimatedContainer";
import ProfileHeader from "../components/ProfileHeader";
import ActiveTabSwitch from "../components/ActiveTabSwitch";
import StatusStrip from "../components/StatusStrip";
import ChatsList from "../components/ChatsList";
import ContactList from "../components/ContactList"; 
import ChatContainer from "../components/ChatContainer";
import NoConversationPlaceholder from "../components/NoConversationPlaceholder";
import ContactProfileInfo from "../components/ContactProfileInfo";

function ChatPage() {
  const { activeTab, selectedUser, isContactInfoOpen } = useChatStore();

  return (
    <div className="relative w-full h-full flex flex-1 overflow-hidden">
      <BorderAnimatedContainer>
        {/* LEFT SIDE: Fixed width sidebar mirroring WhatsApp Web */}
        <div 
          className={`w-full sm:w-[320px] md:w-[350px] lg:w-[400px] flex-shrink-0 bg-[#111b21] border-r border-[#222d34] flex flex-col transition-all duration-300 ${selectedUser ? "hidden sm:flex" : "flex"}`}
        >
          <ProfileHeader />
          <StatusStrip />
          <ActiveTabSwitch />

          <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
             {/* Note: In the future, this is where Group Lists can be rendered */}
            {activeTab === "chats" ? <ChatsList /> : <ContactList />}
          </div>
        </div>

        {/* CENTER: Fluid chat area filling the remaining space */}
        <div 
          className={`flex-1 flex flex-col bg-[#222e35] transition-all duration-300 w-full ${selectedUser ? "flex" : "hidden sm:flex"}`}
        >
          {selectedUser ? <ChatContainer /> : <NoConversationPlaceholder />}
        </div>

        {/* RIGHT SIDE: Contact Info / Profile Drawer */}
        {isContactInfoOpen && <ContactProfileInfo />}
      </BorderAnimatedContainer>
    </div>
  );
}
export default ChatPage;