import { useEffect, useRef, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { PlusIcon, XIcon, ClockIcon } from "lucide-react";
import toast from "react-hot-toast";

function StatusStrip() {
  const { statuses, getStatuses, uploadStatus, isStatusesLoading } = useChatStore();
  const { authUser } = useAuthStore();
  const fileInputRef = useRef(null);
  
  const [activeStatusUser, setActiveStatusUser] = useState(null); // Which user's statuses we are viewing
  const [currentStatusIndex, setCurrentStatusIndex] = useState(0); // If they have multiple, cycle through them
  
  const [uploadPreview, setUploadPreview] = useState(null);
  const [uploadText, setUploadText] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    getStatuses();
  }, [getStatuses]);

  // Group statuses by user
  const groupedStatuses = statuses.reduce((acc, status) => {
    const id = status.userId._id;
    if (!acc[id]) acc[id] = { user: status.userId, items: [] };
    acc[id].items.push(status);
    return acc;
  }, {});

  // Identify if I have my own statuses
  const myStatuses = groupedStatuses[authUser._id];
  // Remove myself from the timeline list
  const timelineUsers = Object.values(groupedStatuses).filter((group) => group.user._id !== authUser._id);

  // Status Auto-advancer
  useEffect(() => {
    if (activeStatusUser) {
      const timer = setTimeout(() => {
        if (currentStatusIndex < activeStatusUser.items.length - 1) {
          setCurrentStatusIndex(prev => prev + 1);
        } else {
          setActiveStatusUser(null);
          setCurrentStatusIndex(0);
        }
      }, 5000); // 5 seconds per status
      return () => clearTimeout(timer);
    }
  }, [activeStatusUser, currentStatusIndex]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => setUploadPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleUploadStatus = async () => {
    if (!uploadPreview) return;
    setIsUploading(true);
    try {
      await uploadStatus({ image: uploadPreview, text: uploadText });
      setUploadPreview(null);
      setUploadText("");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      <div className="flex overflow-x-auto gap-4 p-4 border-b border-slate-700/50 bg-[#111b21] custom-scrollbar">
        
        {/* My Status Button */}
        <div className="flex flex-col items-center gap-1 min-w-[72px] cursor-pointer" onClick={() => myStatuses ? setActiveStatusUser(myStatuses) : fileInputRef.current?.click()}>
          <div className="relative">
            <div className={`w-14 h-14 rounded-full p-0.5 ${myStatuses ? "ring-2 ring-slate-400 ring-offset-2 ring-offset-[#111b21]" : ""}`}>
              <img src={authUser.profilePic || "/avatar.png"} alt="Me" className="w-full h-full rounded-full object-cover" />
            </div>
            
            {/* The "+" Badge */}
            <div className="absolute bottom-0 right-0 bg-[#00a884] border-2 border-[#111b21] rounded-full p-0.5"
                 onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>
              <PlusIcon className="w-3.5 h-3.5 text-white" />
            </div>
            
            <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageChange} className="hidden" />
          </div>
          <span className="text-xs text-slate-300 font-medium whitespace-nowrap">My status</span>
        </div>

        {/* Contacts' Statuses */}
        {isStatusesLoading ? (
            <div className="flex items-center text-xs text-slate-500 italic px-2">Loading...</div>
        ) : (
            timelineUsers.map((group) => (
            <div key={group.user._id} className="flex flex-col items-center gap-1 min-w-[72px] cursor-pointer" 
                 onClick={() => { setActiveStatusUser(group); setCurrentStatusIndex(0); }}>
                <div className="w-14 h-14 rounded-full p-0.5 ring-2 ring-[#00a884] ring-offset-2 ring-offset-[#111b21]">
                <img src={group.user.profilePic || "/avatar.png"} alt={group.user.fullName} className="w-full h-full rounded-full object-cover" />
                </div>
                <span className="text-xs text-slate-300 font-medium truncate w-16 text-center">{group.user.fullName.split(' ')[0]}</span>
            </div>
            ))
        )}
      </div>

      {/* Upload Preview Modal */}
      {uploadPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
          <div className="bg-[#111b21] p-6 rounded-xl w-full max-w-md flex flex-col items-center">
             <div className="w-full flex justify-between items-center mb-4">
                <h3 className="text-white font-medium">Add to my status</h3>
                <button onClick={() => setUploadPreview(null)} className="text-slate-400 hover:text-white"><XIcon/></button>
             </div>
             <img src={uploadPreview} className="max-w-full max-h-80 rounded-lg object-contain mb-4" alt="Preview"/>
             <input type="text" value={uploadText} onChange={(e)=>setUploadText(e.target.value)} 
                    placeholder="Add a caption..." className="w-full bg-[#2a3942] text-white p-3 rounded-lg mb-4 outline-none focus:ring-1 focus:ring-[#00a884]"/>
             <button onClick={handleUploadStatus} disabled={isUploading} 
                     className="w-full bg-[#00a884] text-white p-3 rounded-lg hover:bg-[#008f6f] transition flex justify-center items-center font-medium">
                  {isUploading ? "Uploading..." : "Post Status"}
             </button>
          </div>
        </div>
      )}

      {/* Status Viewer Fullscreen Overlay */}
      {activeStatusUser && (
        <div className="fixed inset-0 z-[100] flex flex-col bg-black">
            <div className="absolute top-0 left-0 w-full p-4 flex gap-1 z-10">
                {/* Progress Bars */}
                {activeStatusUser.items.map((_, idx) => (
                    <div key={idx} className="h-1 flex-1 bg-white/30 rounded overflow-hidden">
                        {idx === currentStatusIndex && <div className="h-full bg-white animate-[progress_5s_linear]" />}
                        {idx < currentStatusIndex && <div className="h-full bg-white" />}
                    </div>
                ))}
            </div>

            <div className="absolute top-6 left-0 w-full p-4 flex justify-between items-center z-10">
                <div className="flex items-center gap-3">
                   <img src={activeStatusUser.user.profilePic || "/avatar.png"} className="w-10 h-10 rounded-full object-cover" alt="User"/>
                   <div>
                      <h3 className="text-white font-medium">{activeStatusUser.user.fullName}</h3>
                      <p className="text-xs text-white/70 flex items-center gap-1">
                         <ClockIcon className="w-3 h-3"/>
                         {new Date(activeStatusUser.items[currentStatusIndex].createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </p>
                   </div>
                </div>
                <button onClick={() => setActiveStatusUser(null)} className="text-white hover:text-slate-300 p-2"><XIcon className="w-6 h-6"/></button>
            </div>

            {/* Click zones for navigating status */}
            <div className="absolute inset-y-0 left-0 w-1/3 z-0" onClick={() => {
                if (currentStatusIndex > 0) setCurrentStatusIndex(prev => prev - 1);
            }}></div>
            <div className="absolute inset-y-0 right-0 w-1/3 z-0" onClick={() => {
                if (currentStatusIndex < activeStatusUser.items.length - 1) setCurrentStatusIndex(prev => prev + 1);
                else setActiveStatusUser(null);
            }}></div>

            <div className="flex-1 flex items-center justify-center p-4">
                <img src={activeStatusUser.items[currentStatusIndex].imageUrl} className="max-w-full max-h-[80vh] object-contain shrink-0" alt="Status" />
            </div>

            {activeStatusUser.items[currentStatusIndex].text && (
                <div className="bg-black/50 p-6 text-center shrink-0">
                    <p className="text-white text-lg">{activeStatusUser.items[currentStatusIndex].text}</p>
                </div>
            )}
        </div>
      )}
    </>
  );
}

export default StatusStrip;
