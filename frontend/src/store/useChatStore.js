import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { useAuthStore } from "./useAuthStore";

// memorise the format of useChatStore 
export const useChatStore = create((set, get) => ({
  allContacts: [],
  chats: [],
  messages: [],
  statuses: [],
  activeTab: "chats",
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  isStatusesLoading: false,
  isSoundEnabled: JSON.parse(localStorage.getItem("isSoundEnabled")) === true,
  isTyping: false,
  isContactInfoOpen: false,
  isSearching: false,
  searchQuery: "",
  groups: [],
  contactMedia: [],
  showStarredOnly: false,

  setShowStarredOnly: (showStarredOnly) => set({ showStarredOnly }),

  toggleContactInfo: () => {
    const isOpening = !get().isContactInfoOpen;
    set({
      isContactInfoOpen: isOpening,
      ...( !isOpening ? { isSearching: false, searchQuery: "", showStarredOnly: false } : {} )
    });
  },
  setIsSearching: (isSearching) => set({ isSearching }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),

  toggleSound: () => {
    localStorage.setItem("isSoundEnabled", !get().isSoundEnabled);
    set({ isSoundEnabled: !get().isSoundEnabled });
  },

  setActiveTab: (tab) => set({ activeTab: tab }),
  setSelectedUser: (selectedUser) => {
    set({ 
        selectedUser, 
        isContactInfoOpen: false, 
        contactMedia: [],
        isSearching: false,
        searchQuery: "",
        showStarredOnly: false
    });
  },

  getAllContacts: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/contacts");
      set({ allContacts: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "An error occurred");
    } finally {
      set({ isUsersLoading: false });
    }
  },
  getMyChatPartners: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/chats");
      set({ chats: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "An error occurred");
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getGroups: async () => {
    try {
      const res = await axiosInstance.get("/groups");
      set({ groups: res.data });
    } catch (error) {
      console.error(error);
    }
  },

  createGroup: async (groupData) => {
    try {
      const res = await axiosInstance.post("/groups/create", groupData);
      set({ groups: [...get().groups, res.data] });
      toast.success("Group created successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Error creating group");
    }
  },

  updateGroupAction: async (groupId, action, targetUserId = null, image = null) => {
    try {
      const res = await axiosInstance.put(`/groups/${groupId}`, { action, targetUserId, image });
      set({ selectedUser: res.data });
      get().getGroups(); // refresh groups list
      if (action === "add_member") toast.success("Member added");
      else if (action === "remove_member") toast.success("Member removed");
      else if (action === "update_group_pic") toast.success("Group picture updated");
      else toast.success("Group settings updated");
    } catch (error) {
      toast.error(error.response?.data?.message || "Error modifying group");
    }
  },

  deleteGroup: async (groupId) => {
    try {
      await axiosInstance.delete(`/groups/${groupId}`);
      set((state) => ({
        groups: state.groups.filter((g) => g._id !== groupId),
        selectedUser: state.selectedUser?._id === groupId ? null : state.selectedUser,
        isContactInfoOpen: state.selectedUser?._id === groupId ? false : state.isContactInfoOpen
      }));
      toast.success("Group completely deleted");
    } catch (error) {
      toast.error(error.response?.data?.message || "Error deleting group");
    }
  },

  getMessagesByUserId: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  clearChat: async (targetId) => {
    try {
      await axiosInstance.delete(`/messages/clear/${targetId}`);
      if (get().selectedUser?._id === targetId) {
          set({ messages: [], contactMedia: [] });
      }
      toast.success("Chat cleared successfully");
    } catch (error) {
      toast.error("Failed to clear chat");
    }
  },

  getChatMedia: async (targetId) => {
    try {
      const res = await axiosInstance.get(`/messages/media/${targetId}`);
      set({ contactMedia: res.data });
    } catch (error) {
      console.error(error);
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    const { authUser } = useAuthStore.getState();

    const tempId = `temp-${Date.now()}`;

    const optimisticMessage = {
      _id: tempId,
      senderId: authUser._id,
      receiverId: selectedUser._id,
      text: messageData.text,
      image: messageData.image,
      createdAt: new Date().toISOString(),
      isOptimistic: true, // flag to identify optimistic messages (optional)
    };
    // immidetaly update the ui by adding the message
    set({ messages: [...messages, optimisticMessage] });
    
    // Organically bump the active chat to the top of the sidebar logically
    const { chats, groups } = get();
    if (selectedUser.members) {
        const groupIndex = groups.findIndex(g => g._id === selectedUser._id);
        if (groupIndex > -1) {
            const updatedGroups = [...groups];
            const [groupToMove] = updatedGroups.splice(groupIndex, 1);
            set({ groups: [groupToMove, ...updatedGroups] });
        }
    } else {
        const chatIndex = chats.findIndex(c => c._id === selectedUser._id);
        if (chatIndex > -1) {
            const updatedChats = [...chats];
            const [chatToMove] = updatedChats.splice(chatIndex, 1);
            set({ chats: [chatToMove, ...updatedChats] });
        } else {
            set({ chats: [selectedUser, ...chats] });
        }
    }

    try {
      const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
      set({ messages: messages.concat(res.data) });
    } catch (error) {
      // remove optimistic message on failure
      set({ messages: messages });
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  },

  deleteMessage: async (msgId) => {
    try {
      await axiosInstance.delete(`/messages/delete/${msgId}`);
      set((state) => ({
        messages: state.messages.filter((msg) => msg._id !== msgId),
      }));
      toast.success("Message deleted");
    } catch (error) {
      toast.error(error.response?.data?.message || "Error deleting message");
    }
  },

  scheduleMessage: async (messageData) => {
    const { selectedUser } = get();

    try {
      const res = await axiosInstance.post(`/messages/schedule/${selectedUser._id}`, messageData);
      toast.success("Message scheduled successfully!");
      return res.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to schedule message");
      throw error;
    }
  },

  getStatuses: async () => {
    set({ isStatusesLoading: true });
    try {
      const res = await axiosInstance.get("/statuses");
      set({ statuses: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch statuses");
    } finally {
      set({ isStatusesLoading: false });
    }
  },

  uploadStatus: async (statusData) => {
    try {
      const res = await axiosInstance.post("/statuses/upload", statusData);
      toast.success("Status uploaded successfully!");
      // add the new status to our local state natively
      set({ statuses: [...get().statuses, res.data] });
      return res.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to upload status");
      throw error;
    }
  },

  translateMessage: async (text, targetLanguage = "English") => {
    try {
       const res = await axiosInstance.post("/ai/translate", { text, targetLanguage });
       return res.data.translation;
    } catch (error) {
       toast.error(error.response?.data?.message || "AI translation flawlessly failed");
       return null;
    }
  },

  subscribeToMessages: () => {
    const { selectedUser, isSoundEnabled } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;

    socket.on("newMessage", (newMessage) => {
      // Ensure the message belongs to the currently active chat
      const isMessageForCurrentChat = 
        newMessage.groupId === selectedUser._id ||
        newMessage.senderId === selectedUser._id || 
        newMessage.receiverId === selectedUser._id;
        
      if (!isMessageForCurrentChat) return;

      const currentMessages = get().messages;
      set({ messages: [...currentMessages, newMessage] });

      const { chats, groups, allContacts } = get();
      if (newMessage.groupId) {
          const groupIndex = groups.findIndex(g => g._id === newMessage.groupId);
          if (groupIndex > -1) {
              const updatedGroups = [...groups];
              const [groupToMove] = updatedGroups.splice(groupIndex, 1);
              set({ groups: [groupToMove, ...updatedGroups] });
          }
      } else {
          // If receiverId isn't on our frontend state yet, parse correctly
          const authUserId = useAuthStore.getState().authUser._id;
          const partnerId = newMessage.senderId === authUserId ? newMessage.receiverId : newMessage.senderId;
          const chatIndex = chats.findIndex(c => c._id === partnerId);
          if (chatIndex > -1) {
              const updatedChats = [...chats];
              const [chatToMove] = updatedChats.splice(chatIndex, 1);
              set({ chats: [chatToMove, ...updatedChats] });
          } else {
              const foundContact = allContacts.find(c => c._id === partnerId);
              if (foundContact) set({ chats: [foundContact, ...chats] });
          }
      }

      if (isSoundEnabled) {
        const notificationSound = new Audio("/sounds/notification.mp3");

        notificationSound.currentTime = 0; // reset to start
        notificationSound.play().catch((e) => console.log("Audio play failed:", e));
      }
    });

    socket.on("messageDeleted", (msgId) => {
        set({ messages: get().messages.filter(msg => msg._id !== msgId) });
    });

    socket.on("typing", (data) => {
      if (selectedUser._id === data.userId) {
        set({ isTyping: true });
      }
    });

    socket.on("stopTyping", (data) => {
      if (selectedUser._id === data.userId) {
        set({ isTyping: false });
      }
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
    socket.off("messageDeleted");
    socket.off("typing");
    socket.off("stopTyping");
    set({ isTyping: false }); // Reset state when unsubscribing
  },
}));