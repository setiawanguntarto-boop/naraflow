import React, { useState, useEffect, useRef } from 'react';
import { workflowPresets, WorkflowPreset } from '@/lib/templates/workflowPresets';

interface MentionInputProps {
  value: string;
  onChange: (value: string) => void;
  onTemplateSelect?: (template: WorkflowPreset) => void;
  placeholder?: string;
  className?: string;
}

// Color palette for each category
const categoryColors: Record<string, string> = {
  'Customer Service': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-300 dark:border-blue-700',
  'Business Process': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-300 dark:border-green-700',
  'Data Processing': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 border-purple-300 dark:border-purple-700',
  'E-commerce': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 border-orange-300 dark:border-orange-700',
  'Content Management': 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300 border-pink-300 dark:border-pink-700',
};

export function MentionInput({
  value,
  onChange,
  onTemplateSelect,
  placeholder = "Describe your workflow...",
  className
}: MentionInputProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<WorkflowPreset[]>([]);
  const [cursor, setCursor] = useState(0);
  const [mentionStart, setMentionStart] = useState<number | null>(null);
  const contentEditableRef = useRef<HTMLDivElement>(null);
  const suggestionsRef = useRef<HTMLUListElement>(null);
  const updateTimeoutRef = useRef<NodeJS.Timeout>();
  const isInternalUpdate = useRef(false);

  // Parse text and highlight mentions
  const parseTextWithMentions = (text: string) => {
    const mentionRegex = /@(\w+)/g;
    const parts: Array<{ type: 'text' | 'mention'; content: string; template?: WorkflowPreset }> = [];
    let lastIndex = 0;
    let match;

    while ((match = mentionRegex.exec(text)) !== null) {
      // Add text before mention
      if (match.index > lastIndex) {
        parts.push({ type: 'text', content: text.substring(lastIndex, match.index) });
      }
      
      // Find template for this mention
      const mentionId = match[1];
      const template = workflowPresets.find(p => p.id === mentionId);
      
      parts.push({ 
        type: 'mention', 
        content: match[0], 
        template 
      });
      
      lastIndex = match.index + match[0].length;
    }
    
    // Add remaining text
    if (lastIndex < text.length) {
      parts.push({ type: 'text', content: text.substring(lastIndex) });
    }
    
    return parts.length > 0 ? parts : [{ type: 'text', content: text }];
  };

  const handleContentChange = () => {
    const text = contentEditableRef.current?.textContent || '';
    onChange(text);
  };

  // Monitor for @ mentions and update styled content with debounce
  useEffect(() => {
    if (!contentEditableRef.current || isInternalUpdate.current) return;
    
    const updateStyledContent = () => {
      const text = contentEditableRef.current?.textContent || '';
      
      // Parse and update styled content
      const parts = parseTextWithMentions(text);
      
      // Update the content
      contentEditableRef.current!.innerHTML = '';
      
      parts.forEach(part => {
        if (part.type === 'mention' && part.template) {
          const span = document.createElement('span');
          const colorClass = categoryColors[part.template.category] || categoryColors['Business Process'];
          span.className = `inline-flex items-center px-2 py-0.5 rounded border ${colorClass}`;
          span.textContent = part.content;
          span.setAttribute('contenteditable', 'false');
          contentEditableRef.current?.appendChild(span);
        } else {
          const textNode = document.createTextNode(part.content);
          contentEditableRef.current?.appendChild(textNode);
        }
      });
    };
    
    const handleInput = () => {
      const text = contentEditableRef.current?.textContent || '';
      console.log('🔍 Input text:', text);
      onChange(text);
      
      // Clear existing timeout
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
      
      // Don't update styled content while user is actively typing
      // We'll update on blur instead to avoid cursor jumping
      // updateTimeoutRef.current = setTimeout(() => {
      //   updateStyledContent(true);
      // }, 1000);
      
      // Check for @ mentions
      const lastAtPos = text.lastIndexOf('@');
      console.log('📍 Last @ position:', lastAtPos);
      
      if (lastAtPos === -1) {
        console.log('❌ No @ found');
        setShowSuggestions(false);
        setSuggestions([]);
        return;
      }
      
      const textAfterAt = text.substring(lastAtPos + 1);
      const nextSpacePos = textAfterAt.indexOf(' ');
      const nextNewlinePos = textAfterAt.indexOf('\n');
      
      let mentionText = '';
      if (nextSpacePos !== -1 && nextNewlinePos !== -1) {
        mentionText = textAfterAt.substring(0, Math.min(nextSpacePos, nextNewlinePos));
      } else if (nextSpacePos !== -1) {
        mentionText = textAfterAt.substring(0, nextSpacePos);
      } else if (nextNewlinePos !== -1) {
        mentionText = textAfterAt.substring(0, nextNewlinePos);
      } else {
        mentionText = textAfterAt;
      }

      console.log('🎯 Mention text after @:', mentionText);

      if (mentionText.length > 0) {
        const query = mentionText.toLowerCase();
        const filtered = workflowPresets.filter((template) =>
          template.label.toLowerCase().includes(query) ||
          template.description.toLowerCase().includes(query) ||
          template.category.toLowerCase().includes(query) ||
          template.id.toLowerCase().includes(query)
        );
        
        console.log('📋 Filtered suggestions:', filtered.length);
        setSuggestions(filtered.slice(0, 6));
        setShowSuggestions(filtered.length > 0);
        setMentionStart(lastAtPos);
        setCursor(0);
      } else {
        // Show ALL suggestions when just @ is typed (no filter)
        console.log('✨ Showing all suggestions for empty mention');
        setSuggestions(workflowPresets.slice(0, 6));
        setShowSuggestions(workflowPresets.length > 0);
        setMentionStart(lastAtPos);
        setCursor(0);
      }
    };

    const handleBlur = () => {
      // Update styled content when user clicks away
      const text = contentEditableRef.current?.textContent || '';
      // Only update if there are mentions to style
      if (text.includes('@')) {
        updateStyledContent();
      }
    };
    
    const div = contentEditableRef.current;
    
    // Always attach event listeners
    div.addEventListener('input', handleInput);
    div.addEventListener('keyup', handleInput); // Fallback for contenteditable
    div.addEventListener('keydown', (e) => {
      // Also check on keydown for @
      if (e.key === '@' || e.key === 'Shift') {
        setTimeout(handleInput, 10); // Small delay to let the character be inserted
      }
    });
    div.addEventListener('blur', handleBlur);
    
    console.log('🔧 Event listeners attached to contentEditable');
    
    // Only do initial styled update if there are mentions in the value
    if (value && value.includes('@')) {
      const parts = parseTextWithMentions(value);
      div.innerHTML = '';
      parts.forEach(part => {
        if (part.type === 'mention' && part.template) {
          const span = document.createElement('span');
          const colorClass = categoryColors[part.template.category] || categoryColors['Business Process'];
          span.className = `inline-flex items-center px-2 py-0.5 rounded border ${colorClass}`;
          span.textContent = part.content;
          span.setAttribute('contenteditable', 'false');
          div.appendChild(span);
        } else {
          const textNode = document.createTextNode(part.content);
          div.appendChild(textNode);
        }
      });
    } else {
      // Just set the text content for plain text
      div.textContent = value || '';
    }
    
    // Trigger initial input check
    if (contentEditableRef.current) {
      const text = contentEditableRef.current.textContent || '';
      console.log('📝 Initial text:', text);
      if (text) {
        handleInput();
      }
    }
    
    return () => {
      div.removeEventListener('input', handleInput);
      div.removeEventListener('keyup', handleInput);
      div.removeEventListener('blur', handleBlur);
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, [value, onChange]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!showSuggestions || suggestions.length === 0) {
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setCursor((prev) => (prev + 1) % suggestions.length);
      setTimeout(() => {
        const suggestionElement = suggestionsRef.current?.children[cursor + 1] as HTMLElement;
        suggestionElement?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }, 0);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setCursor((prev) => (prev - 1 + suggestions.length) % suggestions.length);
      setTimeout(() => {
        const suggestionElement = suggestionsRef.current?.children[cursor - 1] as HTMLElement;
        suggestionElement?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }, 0);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      selectTemplate(suggestions[cursor]);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const selectTemplate = (template: WorkflowPreset) => {
    if (mentionStart === null) return;

    console.log('✅ Template selected:', template);

    const text = contentEditableRef.current?.textContent || value;
    const beforeMention = text.substring(0, mentionStart);
    const afterMention = text.substring(mentionStart).replace(/@[\w-\s]*/, '');
    
    const newValue = `${beforeMention}@${template.id} ${afterMention}`;
    onChange(newValue);
    
    setShowSuggestions(false);
    setSuggestions([]);
    setMentionStart(null);
    
    if (onTemplateSelect) {
      onTemplateSelect(template);
    }

    // Focus contentEditable after selection
    setTimeout(() => {
      contentEditableRef.current?.focus();
    }, 0);
  };

  // Click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        contentEditableRef.current &&
        !contentEditableRef.current.contains(e.target as Node) &&
        suggestionsRef.current &&
        !suggestionsRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative w-full h-full flex flex-col">
      <div
        ref={contentEditableRef}
        contentEditable
        onKeyDown={handleKeyDown}
        data-placeholder={placeholder}
        className={className || "flex-1 min-h-[120px] resize-none rounded-lg border border-border bg-background p-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 overflow-auto"}
        style={{ 
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word'
        }}
      />
      <style>{`
        [data-placeholder]:empty::before {
          content: attr(data-placeholder);
          color: rgb(156 163 175);
        }
        [data-placeholder]:focus::before {
          content: '';
        }
      `}</style>
      
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute bottom-full left-0 w-full z-[9999] mb-2">
          <ul
            ref={suggestionsRef}
            className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-2xl max-h-72 overflow-y-auto"
          >
          {suggestions.map((s, i) => (
            <li
              key={s.id}
              className={`p-3 cursor-pointer transition-colors ${
                i === cursor
                  ? 'bg-indigo-50 dark:bg-indigo-900/20 border-l-4 border-indigo-500'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-700/50 border-l-4 border-transparent'
              }`}
              onClick={() => selectTemplate(s)}
            >
              <div className="flex items-start gap-2">
                <span className="text-lg">{s.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 dark:text-gray-100 text-sm">{s.label}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">
                    {s.description}
                  </div>
                  <div className="text-xs text-indigo-600 dark:text-indigo-400 font-medium mt-1">
                    {s.category}
                  </div>
                </div>
                {i === cursor && (
                  <kbd className="px-2 py-1 text-xs font-semibold text-gray-500 bg-gray-100 border border-gray-300 rounded">
                    ↵
                  </kbd>
                )}
              </div>
            </li>
          ))}
          </ul>
        </div>
      )}
    </div>
  );
}
