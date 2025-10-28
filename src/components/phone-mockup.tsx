import { useState, useEffect } from "react";
import { SendIcon } from "./ui/icons";

interface Message {
  text: string;
  type: "sent" | "received";
  time: string;
}

export const PhoneMockup = () => {
  const [messages, setMessages] = useState<Message[]>([]);

  const conversation: Message[] = [
    {
      text: `Selamat datang di <b>Rahayu.ai</b>. Silakan menginput sesuai dengan form dibawah ini:<br><br>
1. Sampling Bobot (dalam gram) :<br>
2. Deplesi (ekor):<br>
3. Pakan (sak):<br>
4. Ayam Terjual Penjarangan (ekor):<br>
5. Ayam Terjual Penjarangan (kg):<br>
6. Ayam Terjual (ekor):<br>
7. Ayam Terjual (kg):<br>
8. Catatan:<br><br>
Silakan salin dan isi sesuai format diatas.`,
      type: "received",
      time: "08:35 am",
    },
    {
      text: `1. Sampling Bobot (dalam gram) : 1350.0<br>
2. Deplesi (ekor): 7<br>
3. Pakan (sak): 40.0<br>
4. Ayam Terjual Penjarangan (ekor): 3360<br>
5. Ayam Terjual Penjarangan (kg): 4719.5<br>
6. Ayam Terjual (ekor): 0.0<br>
7. Ayam Terjual (kg): 0.0<br>
8. Catatan:`,
      type: "sent",
      time: "08:36 am",
    },
    {
      text: `Tolong periksa apakah record hari ini sudah benar<br><br>
Balas dengan <b>iya</b> untuk konfirmasi.`,
      type: "received",
      time: "08:37 am",
    },
    {
      text: `iya`,
      type: "sent",
      time: "08:38 am",
    },
    {
      text: `Terima kasih sudah menginput hari ini. 🙏`,
      type: "received",
      time: "08:39 am",
    },
  ];

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (messages.length < conversation.length) {
      timer = setTimeout(
        () => {
          setMessages(prevMessages => [...prevMessages, conversation[prevMessages.length]]);
        },
        messages.length === 0 ? 1000 : 2500
      );
    } else {
      timer = setTimeout(() => {
        setMessages([]);
      }, 5000);
    }
    return () => clearTimeout(timer);
  }, [messages, conversation]);

  return (
    <div className="w-[320px] h-[600px] bg-white rounded-[2rem] shadow-2xl flex flex-col overflow-hidden border-8 border-gray-900">
      {/* WhatsApp Header - Solid Green */}
      <div className="bg-[#25D366] text-white p-4 flex items-center shadow-sm">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-white/20 mr-3 flex items-center justify-center">
            <span className="text-xs font-bold text-white">RA</span>
          </div>
          <div>
            <div className="text-sm font-semibold">Rahayu.ai</div>
            <div className="text-xs opacity-90">online</div>
          </div>
        </div>
      </div>

      {/* Chat Area - Solid WhatsApp Background */}
      <div className="flex-1 bg-[#E5DDD5] p-4 overflow-y-auto flex flex-col gap-3 relative">
        {/* WhatsApp Pattern Background */}
        <div 
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: `repeating-linear-gradient(
              45deg,
              transparent,
              transparent 35px,
              rgba(189, 163, 145, 0.1) 35px,
              rgba(189, 163, 145, 0.1) 40px
            )`
          }}
        ></div>
        
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`
              max-w-[85%] p-3 rounded-xl text-sm break-words message-animate relative z-10
              ${
                msg.type === "sent"
                  ? "bg-[#DCF8C6] text-gray-800 self-end rounded-br-sm shadow-sm"
                  : "bg-white text-gray-800 self-start rounded-bl-sm shadow-sm"
              }
            `}
            style={{
              animationDelay: `${i * 2.5}s`,
              opacity: 0,
            }}
            dangerouslySetInnerHTML={{
              __html:
                msg.text +
                `<div class='text-[0.65rem] opacity-70 mt-2 text-right'>${msg.time}</div>`,
            }}
          />
        ))}
      </div>

      {/* Input Area - Solid Gray */}
      <div className="bg-gray-100 p-3 flex items-center gap-2 border-t border-gray-300">
        <div className="flex-1 px-4 py-2 bg-white rounded-full text-sm border border-gray-300 text-gray-500">
          Type a message...
        </div>
        <div className="w-10 h-10 bg-[#25D366] rounded-full flex justify-center items-center text-white shadow-sm hover:bg-[#20BD5C] transition-colors">
          <SendIcon className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
};
