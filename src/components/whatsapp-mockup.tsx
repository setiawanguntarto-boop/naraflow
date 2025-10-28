import { useLanguage } from "@/hooks/use-language";
type WhatsAppMockupProps = {
  agentName?: string;
  agentIcon?: string; // emoji or single char
  agentSubtitle?: string; // e.g., "online" or "typing..."
};

export const WhatsAppMockup = ({
  agentName = "Rahayu",
  agentIcon = "🐔",
  agentSubtitle = "online",
}: WhatsAppMockupProps) => {
  const { t } = useLanguage();
  const chats = [
    {
      name: "Rahayu",
      icon: "🐔",
      message: "Sampling bobot hari ini sudah dikinm",
      time: "09:41",
      bgColor: "bg-green-500",
      hasCheck: true,
    },
    {
      name: "Rodaya",
      icon: "🏍️",
      message: "Pesanan, warung Bu Siti sudah dicatat",
      time: "09:41",
      bgColor: "bg-blue-500",
      hasEmoji: "👊",
    },
    {
      name: "Tambakflow",
      icon: "🦐",
      message: "Kualhas air stabil, pakan 25 kg",
      time: "09:41",
      bgColor: "bg-purple-500",
      hasCheck: true,
    },
    {
      name: "Kasaflow",
      icon: "🌾",
      message: "Nota timbang panen siap diverifikasi",
      time: "09:41",
      bgColor: "bg-green-600",
      hasDocument: true,
    },
    {
      name: "Tamara",
      icon: "🏨",
      message: "Checklist kamar 207 sudah selesai",
      time: "09:41",
      bgColor: "bg-orange-500",
      hasEmoji: "👍",
    },
    {
      name: "Sortify",
      icon: "♻️",
      message: "Sampah plastik 15kg sudah tercatat",
      time: "09:41",
      bgColor: "bg-emerald-600",
      hasCheck: true,
    },
  ];
  return (
    <div
      className="w-full max-w-[340px] mx-auto h-[680px] bg-white rounded-[3rem] flex flex-col overflow-hidden border-[12px] border-gray-900 relative"
      style={{
        boxShadow: `
        0 2px 4px rgba(0, 0, 0, 0.1),
        0 8px 16px rgba(0, 0, 0, 0.15),
        0 16px 32px rgba(0, 0, 0, 0.2),
        0 32px 64px rgba(0, 0, 0, 0.25),
        inset 0 0 0 1px rgba(255, 255, 255, 0.1)
      `,
        transform: "translateZ(50px)",
        transformStyle: "preserve-3d",
      }}
    >
      {/* iPhone Notch */}

      {/* Status Bar */}
      <div className="bg-[#075E54] text-white px-6 pt-3 pb-2 text-xs flex justify-between items-center">
        <span className="font-medium">9:41</span>
        <div className="flex gap-1 items-center">
          <svg className="w-4 h-3" viewBox="0 0 16 12" fill="currentColor">
            <path d="M0 8h2v4H0V8zm4-4h2v8H4V4zm4-4h2v12H8V0zm4 2h2v10h-2V2z" />
          </svg>
          <svg className="w-4 h-3" viewBox="0 0 16 12" fill="currentColor">
            <path d="M14 0c1.1 0 2 .9 2 2v8c0 1.1-.9 2-2 2H2c-1.1 0-2-.9-2-2V2C0 .9.9 0 2 0h12zM2 2v8h12V2H2z" />
          </svg>
          <span className="text-sm">100%</span>
        </div>
      </div>

      {/* WhatsApp Chat Header (Agent) */}
      <div className="bg-[#075E54] text-white px-4 py-3 flex items-center justify-between">
        {/* Left area intentionally empty to mimic minimal header without avatar/arrow/status */}
        <div className="h-6" />
        <div className="flex items-center gap-4">
          {/* Video */}
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
            <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14" />
            <path d="M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          {/* Call */}
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.95.69l1.5 4.5a1 1 0 01-.5 1.21l-2.26 1.13a11 11 0 005.52 5.52l1.13-2.26a1 1 0 011.21-.5l4.5 1.5a1 1 0 01.69.95V19a2 2 0 01-2 2h-1C9.72 21 3 14.28 3 6V5z" />
          </svg>
          {/* Menu */}
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
          </svg>
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 bg-white overflow-y-auto">
        {chats.map((chat, index) => (
          <div
            key={index}
            className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors"
            style={{
              animation: `slideInRight 0.5s ease-out ${index * 0.1}s both`,
            }}
          >
            {/* Avatar */}
            <div
              className={`w-12 h-12 ${chat.bgColor} rounded-full flex items-center justify-center text-2xl flex-shrink-0`}
            >
              {chat.icon}
            </div>

            {/* Chat Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-semibold text-gray-900 text-base">{chat.name}</h3>
                <span className="text-xs text-gray-500">{chat.time}</span>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600 truncate pr-2">{chat.message}</p>
                {chat.hasCheck && (
                  <svg
                    className="w-4 h-4 text-[#25D366] flex-shrink-0"
                    viewBox="0 0 16 16"
                    fill="currentColor"
                  >
                    <path d="M13.5 2L6 9.5 2.5 6 1 7.5l5 5 9-9z" />
                    <path d="M11.5 2L4 9.5 2.5 8l-1.5 1.5 3 3 9-9z" opacity="0.6" />
                  </svg>
                )}
                {chat.hasEmoji && <span className="text-base flex-shrink-0">{chat.hasEmoji}</span>}
                {chat.hasDocument && (
                  <svg
                    className="w-4 h-4 text-gray-400 flex-shrink-0"
                    viewBox="0 0 16 16"
                    fill="currentColor"
                  >
                    <path d="M4 0a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V6l-6-6H4z" />
                    <path d="M8 0v5h5L8 0z" opacity="0.5" />
                  </svg>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
