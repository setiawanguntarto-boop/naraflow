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
      timer = setTimeout(() => {
        setMessages((prevMessages) => [...prevMessages, conversation[prevMessages.length]]);
      }, messages.length === 0 ? 1000 : 2500);
    } else {
      timer = setTimeout(() => {
        setMessages([]);
      }, 5000);
    }
    return () => clearTimeout(timer);
  }, [messages, conversation]);

  return (
    <div className="w-[320px] h-[600px] bg-card rounded-[2rem] shadow-strong flex flex-col overflow-hidden float-animation">
      {/* WhatsApp Header */}
      <div className="bg-brand-secondary text-surface-primary-foreground p-4 flex items-center">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-surface-muted mr-3"></div>
          <div>
            <div className="text-sm font-semibold">Rahayu.ai</div>
            <div className="text-xs opacity-80">online</div>
          </div>
        </div>
      </div>
      
      {/* Chat Area */}
      <div className="flex-1 bg-background-soft p-4 overflow-y-auto flex flex-col gap-3">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`
              max-w-[85%] p-3 rounded-xl text-sm break-words message-animate
              ${msg.type === "sent" 
                ? "bg-brand-secondary text-surface-primary-foreground self-end rounded-br-sm" 
                : "bg-card text-card-foreground self-start rounded-bl-sm shadow-soft"
              }
            `}
            style={{ 
              animationDelay: `${i * 2.5}s`,
              opacity: 0
            }}
            dangerouslySetInnerHTML={{ 
              __html: msg.text + `<div class='text-[0.65rem] opacity-70 mt-2 text-right'>${msg.time}</div>` 
            }}
          />
        ))}
      </div>
      
      {/* Input Area */}
      <div className="bg-surface-muted p-3 flex items-center gap-2">
        <input
          type="text"
          className="flex-1 px-4 py-2 bg-card rounded-full text-sm outline-none border border-border"
          placeholder="Type a message..."
          disabled
        />
        <div className="w-10 h-10 bg-brand-secondary rounded-full flex justify-center items-center text-surface-primary-foreground">
          <SendIcon className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
};