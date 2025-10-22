import { useEffect } from 'react';
import {
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
} from '@/components/ui/context-menu';
import { ContextMenuState } from '@/hooks/useContextMenu';

interface UniversalContextMenuProps {
  menu: ContextMenuState;
  onClose: () => void;
}

export const UniversalContextMenu = ({ menu, onClose }: UniversalContextMenuProps) => {
  // Close on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Close on click outside
  useEffect(() => {
    const handleClick = () => onClose();
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [onClose]);

  return (
    <div
      style={{
        position: 'fixed',
        left: menu.x,
        top: menu.y,
        zIndex: 9999,
      }}
      className="animate-in fade-in-0 zoom-in-95 duration-200"
    >
      <ContextMenuContent className="w-56">
        {menu.items.map((item, idx) => (
          <div key={idx}>
            {item.label === '---' ? (
              <ContextMenuSeparator />
            ) : (
              <ContextMenuItem
                onClick={() => {
                  if (item.onClick) {
                    item.onClick();
                  }
                  onClose();
                }}
                disabled={item.disabled}
                className={
                  item.variant === 'destructive'
                    ? 'text-destructive focus:text-destructive'
                    : ''
                }
              >
                {item.icon && <span className="mr-2">{item.icon}</span>}
                {item.label}
                {item.shortcut && (
                  <span className="ml-auto text-xs text-muted-foreground">
                    {item.shortcut}
                  </span>
                )}
              </ContextMenuItem>
            )}
          </div>
        ))}
      </ContextMenuContent>
    </div>
  );
};
