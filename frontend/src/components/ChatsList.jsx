import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import UsersLoadingSkeleton from "./UsersLoadingSkeleton";
import NoChatsFound from "./NoChatsFound";
import { useAuthStore } from "../store/useAuthStore";

function ChatsList() {
  const { getMyChatPartners, chats, isUsersLoading, setSelectedUser, groups, getGroups, allContacts, getAllContacts } = useChatStore();
  const { onlineUsers, authUser } = useAuthStore();
  const [selectedGroupMembers, setSelectedGroupMembers] = useState([]);

  useEffect(() => {
    getMyChatPartners();
    getGroups();
    getAllContacts();
  }, [getMyChatPartners, getGroups, getAllContacts]);

  if (isUsersLoading) return <UsersLoadingSkeleton />;
  if (chats.length === 0 && groups.length === 0) return <NoChatsFound />;

  return (
    <>
      <div className="text-xs text-slate-500 font-semibold px-2 uppercase tracking-widest mt-2 mb-1">Direct Messages</div>
      {chats.length === 0 && <span className="text-slate-500 text-sm px-2">No direct chats yet</span>}
      {chats.map((chat) => (
        <div
          key={chat._id}
          className="bg-cyan-500/10 p-4 rounded-lg cursor-pointer hover:bg-cyan-500/20 transition-colors mb-2"
          onClick={() => setSelectedUser(chat)}
        >
          <div className="flex items-center gap-3">
            <div className={`avatar ${onlineUsers.includes(chat._id) ? "online" : "offline"}`}>
              <div className="size-12 rounded-full">
                <img src={chat.profilePic || "/avatar.png"} alt={chat.fullName} />
              </div>
            </div>
            <div className="flex flex-col overflow-hidden">
              <h4 className="text-slate-200 font-medium truncate">{chat.fullName}</h4>
              <p className="text-slate-500 text-[13px] truncate">{chat.about || "Hey there! I am using Chatify."}</p>
            </div>
          </div>
        </div>
      ))}

      <div className="text-xs text-slate-500 font-semibold px-2 uppercase tracking-widest mt-4 mb-2 flex justify-between items-center">
         <span>Groups</span>
         <button 
             className="p-1 hover:bg-slate-700 rounded transition-colors text-slate-400" 
             title="Create Group" 
             onClick={() => document.getElementById('create_group_modal').showModal()}
         >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
         </button>
      </div>
      {groups.length === 0 && <span className="text-slate-500 text-sm px-2">No groups yet</span>}
      {groups.map((group) => (
        <div
          key={group._id}
          className="bg-purple-500/10 p-4 rounded-lg cursor-pointer hover:bg-purple-500/20 transition-colors mb-2"
          onClick={() => setSelectedUser(group)}
        >
          <div className="flex items-center gap-3">
            <div className="avatar">
              <div className="size-12 rounded-full">
                <img src={group.groupPic || "/avatar.png"} alt={group.name} />
              </div>
            </div>
            <h4 className="text-slate-200 font-medium truncate">{group.name}</h4>
          </div>
        </div>
      ))}

      {/* CREATE GROUP MODAL */}
      <dialog id="create_group_modal" className="modal">
        <div className="modal-box bg-[#111b21] border border-[#222d34]">
          <h3 className="font-bold text-lg text-slate-200 mb-2">Create New Group</h3>
          <input type="text" id="group_name_input" placeholder="Group Name..." className="input input-bordered w-full bg-[#202c33] text-white border-[#222d34] mb-4" />
          
          <h4 className="text-slate-400 text-sm mb-2 font-semibold">Select Members:</h4>
          <div className="flex flex-col gap-2 max-h-48 overflow-y-auto mb-4 custom-scrollbar">
              {allContacts.map(contact => (
                  <label key={contact._id} className="flex items-center gap-3 cursor-pointer hover:bg-[#202c33] p-2 rounded">
                      <input 
                          type="checkbox" 
                          className="checkbox checkbox-sm checkbox-primary"
                          checked={selectedGroupMembers.includes(contact._id)}
                          onChange={(e) => {
                              if (e.target.checked) setSelectedGroupMembers([...selectedGroupMembers, contact._id]);
                              else setSelectedGroupMembers(selectedGroupMembers.filter(id => id !== contact._id));
                          }}
                      />
                      <div className="avatar">
                        <div className="size-8 rounded-full">
                          <img src={contact.profilePic || "/avatar.png"} alt={contact.fullName} />
                        </div>
                      </div>
                      <span className="text-slate-300 text-sm truncate">{contact.fullName}</span>
                  </label>
              ))}
              {allContacts.length === 0 && <span className="text-slate-500 text-sm">No contacts available</span>}
          </div>

          <div className="modal-action">
            <form method="dialog" className="flex gap-2">
              <button className="btn bg-[#202c33] text-white border-none hover:bg-slate-700" onClick={() => setSelectedGroupMembers([])}>Cancel</button>
              <button className="btn bg-[#00a884] text-white border-none hover:bg-[#008f6f]" onClick={() => {
                  const name = document.getElementById('group_name_input').value;
                  if (name) {
                      useChatStore.getState().createGroup({ 
                          name, 
                          members: [...selectedGroupMembers, authUser._id] 
                      });
                      setSelectedGroupMembers([]);
                      document.getElementById('group_name_input').value = "";
                  }
              }}>Create</button>
            </form>
          </div>
        </div>
      </dialog>
    </>
  );
}
export default ChatsList;