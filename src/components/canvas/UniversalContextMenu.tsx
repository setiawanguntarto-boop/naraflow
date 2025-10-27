import { useEffect } from "react";
import { ContextMenuState } from "@/hooks/useContextMenu";
import { Separator } from "@/components/ui/separator";

interface UniversalContextMenuProps {
  menu: ContextMenuState;
  onClose: () => void;
}

export const UniversalContextMenu = ({ menu, onClose }: UniversalContextMenuProps) => {
  // Close on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Close on click outside
  useEffect(() => {
    const handleClick = () => onClose();
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [onClose]);

  return (
    <div
      style={{
        position: "fixed",
        left: menu.x,
        top: menu.y,
        zIndex: 9999,
      }}
      className="animate-in fade-in-0 zoom-in-95 duration-200"
      onClick={e => e.stopPropagation()}
    >
      <div className="w-56 rounded-md border border-gray-200 bg-white p-1 shadow-lg">
        {menu.items.map((item, idx) => (
          <div key={idx}>
            {item.label === "---" ? (
              <Separator className="my-1" />
            ) : (
              <button
                onClick={() => {
                  if (item.onClick) {
                    item.onClick();
                  }
                  onClose();
                }}
                disabled={item.disabled}
                className={`
                  relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none
                  transition-colors
                  ${
                    item.disabled
                      ? "pointer-events-none opacity-50"
                      : "hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                  }
                  ${
                    item.variant === "destructive"
                      ? "text-destructive focus:text-destructive hover:text-destructive"
                      : "text-popover-foreground"
                  }
                `}
              >
                {item.icon && <span className="mr-2">{item.icon}</span>}
                <span className="flex-1 text-left">{item.label}</span>
                {item.shortcut && (
                  <span className="ml-auto text-xs text-muted-foreground">{item.shortcut}</span>
                )}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
