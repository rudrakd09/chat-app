import React, { useEffect, useState } from "react";
import { XIcon, Search, Star, BellOff, Clock, Heart, MinusCircle, Ban, ThumbsDown, Trash2, UserPlus, UserMinus, ShieldAlert, Camera } from "lucide-react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";

const ContactProfileInfo = () => {
    const { 
        selectedUser, 
        toggleContactInfo, 
        contactMedia, 
        getChatMedia, 
        clearChat,
        isSearching,
        setIsSearching,
        updateGroupMember,
        allContacts
    } = useChatStore();
    const { authUser, toggleBlockUser, toggleFavoriteUser } = useAuthStore();
    const [showAddMember, setShowAddMember] = useState(false);
    const [modalConfig, setModalConfig] = useState({ isOpen: false, type: null });
    const [isUpdatingPic, setIsUpdatingPic] = useState(false);

    useEffect(() => {
        if (selectedUser) {
            getChatMedia(selectedUser._id);
        }
    }, [selectedUser, getChatMedia]);

    if (!selectedUser) return null;

    const isGroup = !!selectedUser.members; // If using groups, we can check for members
    const isBlocked = authUser?.blockedUsers?.includes(selectedUser._id);
    const isFavorite = authUser?.favoriteUsers?.includes(selectedUser._id);
    
    // Group-specific calculated variables
    const isAdmin = isGroup && selectedUser.admins?.some(a => a._id === authUser._id);
    const nonMembers = isGroup ? allContacts.filter(c => !selectedUser.members.some(m => m._id === c._id)) : [];

    const handleGroupPicUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = async () => {
            setIsUpdatingPic(true);
            const base64Image = reader.result;
            await useChatStore.getState().updateGroupAction(selectedUser._id, "update_group_pic", null, base64Image);
            setIsUpdatingPic(false);
        };
    };

    return (
        <div className="w-full sm:w-[320px] md:w-[350px] lg:w-[400px] flex-shrink-0 bg-[#111b21] border-l border-[#222d34] flex flex-col h-full animate-slideInRight overflow-y-auto custom-scrollbar">
            {/* Header */}
            <div className="flex items-center px-6 py-4 bg-[#202c33] sticky top-0 z-10 transition-colors">
                <button onClick={toggleContactInfo} className="mr-6 hover:bg-[#2a3942] p-1 rounded-full text-[#aebac1]">
                    <XIcon className="w-6 h-6" />
                </button>
                <h2 className="text-[#e9edef] font-medium text-lg">{isGroup ? "Group info" : "Contact info"}</h2>
            </div>

            {/* Profile Avatar & Name */}
            <div className={`flex flex-col py-8 space-y-4 shadow-sm ${isGroup ? 'bg-[#111b21] items-center' : 'bg-[#111b21] items-center'}`}>
                <div className="w-48 h-48 rounded-full overflow-hidden shrink-0 border-2 border-[#202c33] relative group">
                    <img 
                        src={selectedUser.profilePic || selectedUser.groupPic || "/avatar.png"} 
                        alt="Profile" 
                        className={`w-full h-full object-cover transition-opacity ${isUpdatingPic ? 'opacity-50' : ''}`}
                    />
                    {isGroup && (
                        <label className={`absolute inset-0 bg-black/60 flex flex-col items-center justify-center cursor-pointer transition-opacity duration-300
                            ${isUpdatingPic ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
                        `}>
                            <Camera className="w-8 h-8 text-white mb-2" />
                            <span className="text-white text-sm px-4 text-center">
                                {isUpdatingPic ? 'Updating...' : 'Change Group Icon'}
                            </span>
                            <input 
                                type="file" 
                                accept="image/*" 
                                className="hidden" 
                                onChange={handleGroupPicUpload}
                                disabled={isUpdatingPic}
                            />
                        </label>
                    )}
                </div>
                <div className="text-center">
                    <h1 className="text-[#e9edef] text-2xl font-normal">{selectedUser.fullName || selectedUser.name}</h1>
                    {!isGroup ? (
                        <p className="text-[#8696a0] text-lg mt-1">{selectedUser.phoneNumber || selectedUser.email}</p>
                    ) : (
                        <p className="text-[#00a884] text-md mt-1">Group · {selectedUser.members?.length} members</p>
                    )}
                </div>
                
                {isGroup ? (
                    <div className="flex gap-4 mt-6 px-8 w-full">
                         {isAdmin && (
                             <button 
                                 className="flex flex-col items-center justify-center bg-[#202c33] hover:bg-[#2a3942] transition-colors rounded-xl py-3 flex-1"
                                 onClick={() => setShowAddMember(!showAddMember)}
                             >
                                 <UserPlus className="w-6 h-6 text-[#00a884] mb-2" />
                                 <span className="text-[#e9edef] text-[15px]">Add</span>
                             </button>
                         )}
                         <button 
                             className="flex flex-col items-center justify-center bg-[#202c33] hover:bg-[#2a3942] transition-colors rounded-xl py-3 flex-1"
                             onClick={() => setIsSearching(!isSearching)}
                         >
                             <Search className="w-6 h-6 text-[#00a884] mb-2" />
                             <span className="text-[#e9edef] text-[15px]">Search</span>
                         </button>
                    </div>
                ) : (
                    <div className="flex gap-6 mt-4">
                         <button 
                             className="flex flex-col items-center gap-2 cursor-pointer w-20"
                             onClick={() => setIsSearching(!isSearching)}
                         >
                             <div className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-colors ${isSearching ? 'bg-[#00a884] text-white' : 'bg-[#202c33] text-[#00a884] hover:bg-[#2a3942]'}`}>
                                 <Search className="w-5 h-5" />
                             </div>
                             <span className="text-[#8696a0] text-[15px]">Search</span>
                         </button>
                    </div>
                )}
            </div>

            <div className="h-2 bg-[#0b141a] w-full border-t border-[#202c33]" />

            {/* About Section */}
            {!isGroup ? (
                <>
                   <div className="px-8 py-5 bg-[#111b21]">
                       <h3 className="text-[#8696a0] text-[15px] mb-2 font-medium">About</h3>
                       <p className="text-[#e9edef] text-[16px]">{selectedUser.about || "Hey there! I am using Chatify."}</p>
                   </div>
                   <div className="h-2 bg-[#0b141a] w-full border-t border-[#202c33]" />
                </>
            ) : (
                <>
                   <div className="px-8 py-5 bg-[#111b21]">
                       <p className="text-[#e9edef] text-[16px] mb-6">{selectedUser.description || "This group brings our community together!"}</p>
                       <p className="text-[#8696a0] text-[14px]">
                           Group created on {new Date(selectedUser.createdAt).toLocaleDateString()}
                       </p>
                   </div>
                   {isAdmin && (
                       <div className="px-8 py-4 bg-[#111b21] flex justify-between items-center border-t border-[#202c33]">
                           <div className="flex flex-col">
                               <span className="text-[#e9edef] text-[16px]">Only admins can post</span>
                               <span className="text-[#8696a0] text-[14px]">Restrict messaging to admins</span>
                           </div>
                           <input 
                               type="checkbox" 
                               checked={selectedUser.onlyAdminsCanPost || false}
                               onChange={() => useChatStore.getState().updateGroupAction(selectedUser._id, "toggle_admin_post")}
                               className="toggle toggle-sm border-[#8696a0] bg-transparent hover:bg-transparent [--tglbg:#8696a0] checked:[--tglbg:white] checked:bg-[#00a884] checked:border-[#00a884]" 
                           />
                       </div>
                   )}
                   <div className="h-2 bg-[#0b141a] w-full border-t border-[#202c33]" />
                </>
            )}

            {/* Media Links Docs */}
            {contactMedia.length > 0 && (
                <>
                    <div className="px-8 py-4 bg-[#111b21] cursor-pointer hover:bg-[#202c33] transition-colors">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-[#8696a0] text-[15px] flex items-center gap-4">
                                Media, links and docs
                            </span>
                            <span className="text-[#8696a0] text-[14px] flex items-center">
                                {contactMedia.length}
                                <Search className="w-4 h-4 ml-2 opacity-0" /> {/* Spacer */}
                            </span>
                        </div>
                        <div className="flex gap-2 overflow-x-auto no-scrollbar">
                            {contactMedia.slice(0, 3).map((msg, i) => (
                                <img key={i} src={msg.image} className="w-20 h-20 bg-[#202c33] rounded-lg object-cover shrink-0" alt="media" />
                            ))}
                        </div>
                    </div>
                    <div className="h-2 bg-[#0b141a] w-full border-t border-[#202c33]" />
                </>
            )}

            {/* Options */}
            <div className="bg-[#111b21] flex flex-col py-2">
                <button 
                    onClick={() => useChatStore.getState().setShowStarredOnly(!useChatStore.getState().showStarredOnly)}
                    className="flex items-center gap-6 px-8 py-4 hover:bg-[#202c33] transition-colors text-[#e9edef] w-full text-left"
                >
                    <Star className={`w-5 h-5 ${useChatStore.getState().showStarredOnly ? 'text-yellow-500 fill-yellow-500' : 'text-[#8696a0]'}`} />
                    <span className="text-[16px]">Starred messages</span>
                </button>
                <div className="flex items-center gap-6 px-8 py-4 hover:bg-[#202c33] transition-colors text-[#e9edef] w-full justify-between">
                    <div className="flex items-center gap-6 text-left">
                       <BellOff className="w-5 h-5 text-[#8696a0]" />
                       <span className="text-[16px]">Mute notifications</span>
                    </div>
                    <input type="checkbox" className="toggle toggle-sm border-[#8696a0] bg-transparent hover:bg-transparent [--tglbg:#8696a0] checked:[--tglbg:white] checked:bg-[#00a884] checked:border-[#00a884]" />
                </div>

            </div>

            <div className="h-2 bg-[#0b141a] w-full border-t border-[#202c33]" />

            {/* Actions Menu */}
            {!isGroup && (
                <div className="bg-[#111b21] flex flex-col py-2 mb-8">
                    <button 
                        onClick={() => toggleFavoriteUser(selectedUser._id)}
                        className="flex items-center gap-6 px-8 py-4 hover:bg-[#202c33] transition-colors text-[#e9edef] w-full text-left font-medium"
                    >
                        <Heart className={`w-5 h-5 ${isFavorite ? "text-[#00a884] fill-[#00a884]" : "text-[#8696a0]"}`} />
                        <span className="text-[16px]">{isFavorite ? "Remove from Favorites" : "Add to Favorites"}</span>
                    </button>
                    <button 
                        onClick={() => setModalConfig({ isOpen: true, type: "clear" })}
                        className="flex items-center gap-6 px-8 py-4 hover:bg-[#202c33] transition-colors text-[#f15c6d] w-full text-left"
                    >
                        <MinusCircle className="w-5 h-5 text-[#f15c6d]" />
                        <span className="text-[16px]">Clear chat</span>
                    </button>
                    <button 
                        onClick={() => toggleBlockUser(selectedUser._id)}
                        className="flex items-center gap-6 px-8 py-4 hover:bg-[#202c33] transition-colors text-[#f15c6d] w-full text-left"
                    >
                        <Ban className="w-5 h-5 text-[#f15c6d]" />
                        <span className="text-[16px]">{isBlocked ? `Unblock ${selectedUser.fullName}` : `Block ${selectedUser.fullName}`}</span>
                    </button>
                    <button className="flex items-center gap-6 px-8 py-4 hover:bg-[#202c33] transition-colors text-[#f15c6d] w-full text-left">
                        <ThumbsDown className="w-5 h-5 text-[#f15c6d]" />
                        <span className="text-[16px]">Report {selectedUser.fullName}</span>
                    </button>
                </div>
            )}

            {isGroup && (
                <div className="bg-[#111b21] flex flex-col pt-2 pb-8">
                    <div className="flex justify-between items-center px-6 py-2">
                         <span className="text-[#8696a0] text-[15px] font-medium">{selectedUser.members.length} members</span>
                         <Search className="w-5 h-5 text-[#8696a0] cursor-pointer hover:text-[#e9edef]" />
                    </div>
                    
                    {isAdmin && (
                         <div className="px-4 mt-2">
                             <button 
                                 onClick={() => setShowAddMember(!showAddMember)}
                                 className="flex items-center gap-4 px-2 py-3 hover:bg-[#202c33] transition-colors w-full text-left rounded-lg"
                             >
                                 <div className="w-10 h-10 rounded-full bg-[#00a884] flex items-center justify-center flex-shrink-0">
                                     <UserPlus className="w-5 h-5 text-[#111b21]" />
                                 </div>
                                 <span className="text-[16px] text-[#e9edef]">Add member</span>
                             </button>
                         </div>
                    )}

                    {showAddMember && isAdmin && (
                         <div className="flex flex-col gap-2 max-h-48 overflow-y-auto custom-scrollbar px-6 pb-4 border-b border-[#202c33] mt-2">
                              {nonMembers.map(contact => (
                                  <div key={contact._id} className="flex items-center justify-between gap-3 text-slate-300">
                                      <div className="flex items-center gap-3">
                                          <div className="avatar">
                                            <div className="size-10 rounded-full">
                                              <img src={contact.profilePic || "/avatar.png"} alt={contact.fullName} />
                                            </div>
                                          </div>
                                          <span className="text-[15px] truncate max-w-[120px]">{contact.fullName}</span>
                                      </div>
                                      <button 
                                          className="text-xs bg-[#00a884] text-white px-3 py-1.5 rounded hover:bg-[#008f6f] font-medium"
                                          onClick={() => useChatStore.getState().updateGroupAction(selectedUser._id, "add_member", contact._id)}
                                      >
                                          Add
                                      </button>
                                  </div>
                              ))}
                              {nonMembers.length === 0 && <span className="text-slate-500 text-sm">No new contacts available to add.</span>}
                         </div>
                    )}

                    <div className="flex flex-col mt-2 px-4">
                         {selectedUser.members.map(member => {
                             const isMemberAdmin = selectedUser.admins?.some(a => a._id === member._id);
                             return (
                                 <div key={member._id} className="flex items-center justify-between gap-3 px-2 py-3 hover:bg-[#202c33] cursor-pointer transition-colors rounded-lg group">
                                      <div className="flex items-center gap-3 overflow-hidden">
                                          <div className="avatar flex-shrink-0">
                                            <div className="size-10 rounded-full">
                                              <img src={member.profilePic || "/avatar.png"} alt={member.fullName} />
                                            </div>
                                          </div>
                                          <div className="flex flex-col overflow-hidden w-full">
                                              <span className="text-[16px] text-[#e9edef] truncate">{member._id === authUser._id ? "You" : member.fullName}</span>
                                              <span className="text-[13px] text-[#8696a0] truncate">{member.about || "Hey there!"}</span>
                                          </div>
                                      </div>
                                      <div className="flex items-center gap-3 flex-shrink-0">
                                          {isMemberAdmin && <span className="text-[12px] font-medium text-[#00a884] bg-[#00a884]/10 px-2 py-0.5 border border-[#00a884]/20 rounded">Group admin</span>}
                                          {isAdmin && member._id !== authUser._id && (
                                              <button 
                                                  className="opacity-0 group-hover:opacity-100 transition-opacity text-[#f15c6d] p-1 hover:bg-[#2a3942] rounded"
                                                  onClick={(e) => {
                                                      e.stopPropagation();
                                                      useChatStore.getState().updateGroupAction(selectedUser._id, "remove_member", member._id);
                                                  }}
                                                  title="Remove Member"
                                              >
                                                  <UserMinus className="w-4 h-4" />
                                              </button>
                                          )}
                                      </div>
                                 </div>
                             );
                         })}
                    </div>
                </div>
            )}

            {isGroup && (
                <>
                    <div className="h-2 bg-[#0b141a] w-full border-t border-[#202c33]" />
                    <div className="bg-[#111b21] flex flex-col py-2 mb-8">
                        {/* Any member can exit */}
                        <button 
                            onClick={() => setModalConfig({ isOpen: true, type: "exit" })}
                            className="flex items-center gap-6 px-8 py-4 hover:bg-[#202c33] transition-colors text-[#f15c6d] w-full text-left"
                        >
                            <UserMinus className="w-5 h-5 text-[#f15c6d]" />
                            <span className="text-[16px]">Exit group</span>
                        </button>
                        
                        {/* Only admins can physically delete */}
                        {isAdmin && (
                            <button 
                                onClick={() => setModalConfig({ isOpen: true, type: "delete" })}
                                className="flex items-center gap-6 px-8 py-4 hover:bg-[#202c33] transition-colors text-[#f15c6d] w-full text-left"
                            >
                                <Trash2 className="w-5 h-5 text-[#f15c6d]" />
                                <span className="text-[16px]">Delete group</span>
                            </button>
                        )}
                    </div>
                </>
            )}

            {/* Custom Action Modal */}
            {modalConfig.isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-[#111b21] border border-[#202c33] p-6 rounded-2xl w-[90%] max-w-sm shadow-2xl animate-slideUp">
                        <h3 className="text-[#e9edef] text-xl font-medium mb-2">
                            {modalConfig.type === "exit" ? "Exit this group?" : modalConfig.type === "delete" ? "Delete this group?" : "Clear chat?"}
                        </h3>
                        <p className="text-[#8696a0] text-[15px] mb-8 leading-relaxed">
                            {modalConfig.type === "exit" 
                                ? "Are you sure you want to exit? You will no longer receive messages from this group."
                                : modalConfig.type === "delete"
                                ? "This action is irreversible. All messages and media will be permanently deleted for all members."
                                : "Are you sure you want to clear all messages? This cannot be undone."
                            }
                        </p>
                        <div className="flex justify-end gap-3 text-[15px] font-medium">
                            <button 
                                onClick={() => setModalConfig({ isOpen: false, type: null })}
                                className="px-5 py-2.5 rounded-full text-[#00a884] hover:bg-[#202c33] transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={() => {
                                    if (modalConfig.type === "exit") {
                                        useChatStore.getState().updateGroupAction(selectedUser._id, "remove_member", authUser._id);
                                    } else if (modalConfig.type === "delete") {
                                        useChatStore.getState().deleteGroup(selectedUser._id);
                                    } else if (modalConfig.type === "clear") {
                                        clearChat(selectedUser._id);
                                        toggleContactInfo();
                                    }
                                    setModalConfig({ isOpen: false, type: null });
                                }}
                                className={`px-5 py-2.5 rounded-full text-[#111b21] transition-colors ${
                                    modalConfig.type === "exit" || modalConfig.type === "delete" || modalConfig.type === "clear"
                                        ? "bg-[#f15c6d] hover:bg-[#d84e5d] text-white" 
                                        : "bg-[#00a884] hover:bg-[#008f6f]"
                                }`}
                            >
                                {modalConfig.type === "exit" ? "Exit group" : modalConfig.type === "delete" ? "Delete group" : "Clear chat"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ContactProfileInfo;
