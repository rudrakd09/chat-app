import { useRef, useState } from "react";
import useKeyboardSound from "../hooks/useKeyboardSound";
import { useChatStore } from "../store/useChatStore";
import toast from "react-hot-toast";
import { ImageIcon, SendIcon, XIcon, SmileIcon, ClockIcon } from "lucide-react";
import EmojiPicker from "emoji-picker-react";
import React from "react";

// later read tnis in detail while revising 

function MessageInput() {
  const { playRandomKeyStrokeSound } = useKeyboardSound();
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showScheduler, setShowScheduler] = useState(false);
  const [scheduledAt, setScheduledAt] = useState("");

  const fileInputRef = useRef(null);

  const { sendMessage, scheduleMessage, isSoundEnabled } = useChatStore();

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() && !imagePreview) return;
    if (isSoundEnabled) playRandomKeyStrokeSound();

    if (scheduledAt) {
      await scheduleMessage({
        text: text.trim(),
        image: imagePreview,
        scheduledAt,
      });
      setScheduledAt("");
      setShowScheduler(false);
    } else {
      sendMessage({
        text: text.trim(),
        image: imagePreview,
      });
    }

    setText("");
    setImagePreview("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const onEmojiClick = (emojiObject) => {
    setText((prev) => prev + emojiObject.emoji);
  };

  return (
    <div className="p-3 bg-[#202c33] border-t border-[#222d34] flex flex-col w-full">
      {imagePreview && (
        <div className="mb-3 flex items-center relative pl-12">
          <div className="relative inline-block">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-20 h-20 object-cover rounded-lg border border-[#222d34]"
            />
            <button
              onClick={removeImage}
              className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-slate-200 hover:bg-slate-700 shadow-md"
              type="button"
            >
              <XIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSendMessage} className="flex items-end sm:items-center space-x-2 w-full relative px-2">
        {showEmojiPicker && (
          <div className="absolute bottom-16 left-0 z-50 shadow-xl rounded-lg border border-[#222d34]">
            <EmojiPicker onEmojiClick={onEmojiClick} theme="dark" />
          </div>
        )}
        
        <div className="flex items-center">
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="p-2 sm:p-3 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <SmileIcon className="w-6 h-6 sm:w-7 sm:h-7" />
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className={`p-2 sm:p-3 text-slate-400 hover:text-slate-200 transition-colors ${imagePreview ? "text-[#00a884]" : ""}`}
            title="Attach image"
          >
            <ImageIcon className="w-6 h-6 sm:w-7 sm:h-7" />
          </button>
          
          <button
            type="button"
            onClick={() => {
              setShowScheduler(!showScheduler);
              setShowEmojiPicker(false);
            }}
            className={`p-2 sm:p-3 transition-colors ${scheduledAt ? "text-[#00a884]" : "text-slate-400 hover:text-slate-200"}`}
            title="Schedule message"
          >
            <ClockIcon className="w-6 h-6 sm:w-7 sm:h-7" />
          </button>
        </div>
        
        {showScheduler && (
          <div className="absolute bottom-16 left-12 z-50 bg-[#233138] border border-[#222d34] p-4 rounded-xl shadow-2xl flex flex-col gap-3 w-64 sm:w-72">
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-slate-200">Schedule Message</span>
              <button type="button" onClick={() => setShowScheduler(false)} className="text-slate-400 hover:text-[#00a884] transition-colors">
                <XIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 w-full">
               <button type="button" onClick={() => {
                   const d = new Date(); d.setHours(d.getHours() + 1); setScheduledAt(new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0,16));
               }} className="px-2 py-2 border border-[#222d34] rounded-lg text-xs text-slate-300 hover:bg-[#00a884] hover:text-white transition-colors bg-[#111b21]">In 1 Hour</button>
               <button type="button" onClick={() => {
                   const d = new Date(); d.setDate(d.getDate() + 1); d.setHours(9,0,0,0); setScheduledAt(new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0,16));
               }} className="px-2 py-2 border border-[#222d34] rounded-lg text-xs text-slate-300 hover:bg-[#00a884] hover:text-white transition-colors bg-[#111b21]">Tomorrow 9 AM</button>
            </div>

            <div className="w-full">
              <label className="text-[11px] text-slate-400 uppercase tracking-wider mb-1.5 block">Custom Time</label>
              <input 
                type="datetime-local" 
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                min={new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16)}
                className="w-full bg-[#2a3942] text-slate-200 text-sm px-3 py-2.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#00a884] border border-[#222d34]"
              />
            </div>
            
            {scheduledAt && (
               <button type="button" onClick={() => setScheduledAt("")} className="text-xs mt-1 text-red-400 hover:text-red-300 w-full text-left font-medium">
                 Clear scheduled time
               </button>
            )}
          </div>
        )}
        
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleImageChange}
          className="hidden"
        />

        <input
          type="text"
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            isSoundEnabled && playRandomKeyStrokeSound();
          }}
          className="flex-1 bg-[#2a3942] border border-transparent rounded-lg py-3 px-5 text-[#d1d7db] placeholder:text-[#8696a0] focus:outline-none text-[15px]"
          placeholder="Type a message"
        />

        <button
          type="submit"
          disabled={!text.trim() && !imagePreview}
          className={`p-3 rounded-full flex items-center justify-center transition-all ml-2
            ${text.trim() || imagePreview ? "text-[#00a884] hover:bg-[#2a3942]" : "text-slate-500 cursor-not-allowed"}
          `}
        >
          <SendIcon className="w-6 h-6 sm:w-7 sm:h-7" fill="currentColor" strokeWidth={1} />
        </button>
      </form>
    </div>
  );
}
export default MessageInput;