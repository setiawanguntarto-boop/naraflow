import { motion } from "framer-motion";

export const AnimatedBackground = () => {
  const floatTransition = {
    repeat: Infinity,
    duration: 6,
    ease: "easeInOut" as const,
    repeatType: "mirror" as const,
  };

  const particles = [
    { style: { top: "18%", left: "12%" }, emoji: "🔹" },
    { style: { top: "60%", right: "10%" }, emoji: "⚙️" },
    { style: { bottom: "12%", left: "28%" }, emoji: "💡" },
    { style: { bottom: "22%", right: "22%" }, emoji: "📈" },
  ] as const;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {/* Chat bubble main flow */}
      <motion.div
        initial={{ x: -220, y: 120, opacity: 0 }}
        animate={{ x: 220, y: -60, opacity: [0, 1, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        className="absolute text-6xl text-brand-primary/25"
        style={{ left: 0, bottom: 0 }}
      >
        💬
      </motion.div>

      {/* Chart icon flow */}
      <motion.div
        initial={{ x: 180, y: 160, opacity: 0 }}
        animate={{ x: -180, y: -110, opacity: [0, 1, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        className="absolute text-6xl text-brand-secondary/20"
        style={{ right: 0, bottom: 0 }}
      >
        📊
      </motion.div>

      {/* Floating small particles */}
      {particles.map((p, i) => (
        <motion.div
          key={i}
          style={p.style as React.CSSProperties}
          animate={{ y: [0, -15, 0], x: [0, 10, 0] }}
          transition={{ ...floatTransition, duration: 6 + i * 1.2 }}
          className="absolute text-3xl text-brand-accent/15"
        >
          {p.emoji}
        </motion.div>
      ))}
    </div>
  );
};

export default AnimatedBackground;


