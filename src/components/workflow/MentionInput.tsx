import React, { useState, useEffect, useRef } from 'react';
import { workflowPresets, WorkflowPreset } from '@/lib/templates/workflowPresets';
import { PresetType } from './PresetPanel';

interface MentionInputProps {
  value: string;
  onChange: (value: string) => void;
  onTemplateSelect?: (template: WorkflowPreset) => void;
  selectedPreset?: PresetType | null;
  placeholder?: string;
  className?: string;
}

// Color palette for @mention templates - High contrast for readability
const categoryColors: Record<string, string> = {
  'Customer Service': 'bg-blue-500 text-white dark:bg-blue-600 dark:text-white border-blue-600 dark:border-blue-400',
  'Business Process': 'bg-emerald-600 text-white dark:bg-emerald-700 dark:text-white border-emerald-700 dark:border-emerald-500',
  'Data Processing': 'bg-violet-600 text-white dark:bg-violet-700 dark:text-white border-violet-700 dark:border-violet-500',
  'E-commerce': 'bg-amber-600 text-white dark:bg-amber-700 dark:text-white border-amber-700 dark:border-amber-500',
  'Content Management': 'bg-rose-600 text-white dark:bg-rose-700 dark:text-white border-rose-700 dark:border-rose-500',
};

// Color palette for Quick Template badges - Gradient scale for better cohesion
const presetColors: Record<string, string> = {
  'broiler': 'bg-amber-500 text-white dark:bg-amber-600 dark:text-white border-amber-600 dark:border-amber-500',
  'udang': 'bg-indigo-500 text-white dark:bg-indigo-600 dark:text-white border-indigo-600 dark:border-indigo-500',
  'singkong': 'bg-pink-500 text-white dark:bg-pink-600 dark:text-white border-pink-600 dark:border-pink-500',
  'sales': 'bg-purple-500 text-white dark:bg-purple-600 dark:text-white border-purple-600 dark:border-purple-500',
  'hotel': 'bg-red-500 text-white dark:bg-red-600 dark:text-white border-red-600 dark:border-red-500',
  'sampah': 'bg-lime-500 text-white dark:bg-lime-600 dark:text-white border-lime-600 dark:border-lime-500',
};

export function MentionInput({
  value,
  onChange,
  onTemplateSelect,
  selectedPreset,
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

  // Helper functions to save and restore cursor position
  const saveCursorPosition = () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return null;
    
    const range = selection.getRangeAt(0);
    const preCaretRange = range.cloneRange();
    preCaretRange.selectNodeContents(contentEditableRef.current!);
    preCaretRange.setEnd(range.startContainer, range.startOffset);
    
    return preCaretRange.toString().length;
  };

  const restoreCursorPosition = (position: number) => {
    if (!contentEditableRef.current) return;
    
    const textNodes: Text[] = [];
    const treeWalker = document.createTreeWalker(
      contentEditableRef.current,
      NodeFilter.SHOW_TEXT
    );
    
    let node: Text | null;
    while ((node = treeWalker.nextNode() as Text)) {
      textNodes.push(node);
    }
    
    let currentPosition = 0;
    for (const textNode of textNodes) {
      const nodeLength = textNode.textContent?.length || 0;
      if (currentPosition + nodeLength >= position) {
        const range = document.createRange();
        range.setStart(textNode, position - currentPosition);
        range.setEnd(textNode, position - currentPosition);
        
        const selection = window.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(range);
        break;
      }
      currentPosition += nodeLength;
    }
  };

  // Parse text and highlight mentions and preset badges
  const parseTextWithMentions = (text: string, selectedPreset: PresetType | null = null) => {
    const mentionRegex = /@(\w+)/g;
    const parts: Array<{ type: 'text' | 'mention' | 'preset'; content: string; template?: WorkflowPreset; preset?: PresetType }> = [];
    
    // Special case: If we have a selected preset, always add it as a badge at the start
    if (selectedPreset) {
      // Find all @ mentions first
      const mentionMatches: Array<{ type: 'mention'; index: number; length: number; data: any }> = [];
    let match;
      while ((match = mentionRegex.exec(text)) !== null) {
        const mentionId = match[1];
        const template = workflowPresets.find(p => p.id === mentionId);
        mentionMatches.push({
          type: 'mention',
          index: match.index,
          length: match[0].length,
          data: { template, content: match[0] }
        });
      }
      
      // Check if preset badge already exists in text to avoid duplicates
      const presetBadgeText = `${selectedPreset.emoji} ${selectedPreset.title}`;
      const alreadyHasBadge = text.includes(presetBadgeText);
      
      // Only add preset badge if it's not already in the text
      if (!alreadyHasBadge) {
        parts.push({
          type: 'preset',
          content: presetBadgeText,
          preset: selectedPreset
        });
      }
      
      // Add text and mentions
      if (mentionMatches.length > 0) {
        // Process mentions with their text
        let lastIndex = 0;
        mentionMatches.sort((a, b) => a.index - b.index);
        mentionMatches.forEach(mentionMatch => {
      // Add text before mention
          if (mentionMatch.index > lastIndex) {
            const textBefore = text.substring(lastIndex, mentionMatch.index);
            if (textBefore) {
              parts.push({ type: 'text', content: textBefore });
            }
          }
          
          // Add mention badge
          parts.push({
            type: 'mention',
            content: mentionMatch.data.content,
            template: mentionMatch.data.template
          });
          
          lastIndex = mentionMatch.index + mentionMatch.length;
        });
        
        // Add remaining text after last mention
        if (lastIndex < text.length) {
          const remainingText = text.substring(lastIndex);
          if (remainingText) {
            parts.push({ type: 'text', content: remainingText });
          }
        }
      } else {
        // No mentions, just add the text
        if (text) {
          parts.push({ type: 'text', content: text });
        }
      }
      
      return parts.length > 0 ? parts : [{ type: 'text', content: '' }];
    }
    
    // No preset selected - normal mention parsing
    const matches: Array<{ type: 'mention'; index: number; length: number; data: any }> = [];
    while ((match = mentionRegex.exec(text)) !== null) {
      const mentionId = match[1];
      const template = workflowPresets.find(p => p.id === mentionId);
      matches.push({
        type: 'mention',
        index: match.index,
        length: match[0].length,
        data: { template, content: match[0] }
      });
    }
    
    if (matches.length === 0) {
      return [{ type: 'text', content: text }];
    }
    
    // Sort matches by index
    matches.sort((a, b) => a.index - b.index);
    
    // Build parts array
    let lastIndex = 0;
    matches.forEach(match => {
      // Add text before this match
      if (match.index > lastIndex) {
        const textBefore = text.substring(lastIndex, match.index);
        if (textBefore) {
          parts.push({ type: 'text', content: textBefore });
        }
      }
      
      // Add the mention
      parts.push({ 
        type: 'mention', 
        content: match.data.content,
        template: match.data.template
      });
      
      lastIndex = match.index + match.length;
    });
    
    // Add remaining text
    if (lastIndex < text.length) {
      const remainingText = text.substring(lastIndex);
      if (remainingText) {
        parts.push({ type: 'text', content: remainingText });
      }
    }
    
    return parts.length > 0 ? parts : [{ type: 'text', content: text }];
  };

  // Helper function to get editable text excluding badges
  const getEditableText = () => {
    if (!contentEditableRef.current) return '';
    
    let text = '';
    const walker = document.createTreeWalker(
      contentEditableRef.current,
      NodeFilter.SHOW_TEXT,
      null
    );
    
    let node;
    while ((node = walker.nextNode())) {
      const parent = node.parentElement;
      if (parent && parent.getAttribute('contenteditable') === 'false') {
        // Skip content inside badges
        continue;
      }
      text += node.textContent;
    }
    
    return text;
  };

  const handleContentChange = () => {
    const text = getEditableText();
    onChange(text.trim());
  };

  // Monitor for @ mentions and update styled content with debounce
  useEffect(() => {
    if (!contentEditableRef.current || isInternalUpdate.current) return;
    
    const updateStyledContent = () => {
      const text = getEditableText();
      
      // Save cursor position before updating innerHTML
      const cursorPosition = saveCursorPosition();
      
      // Parse and update styled content
      const parts = parseTextWithMentions(text, selectedPreset);
      
      // Update the content
      contentEditableRef.current!.innerHTML = '';
      
      parts.forEach(part => {
        if (part.type === 'mention' && part.template) {
          // Render @mention badge
          const span = document.createElement('span');
          const colorClass = categoryColors[part.template.category] || 'bg-gray-600 text-white border-gray-700 dark:bg-gray-700 dark:text-white dark:border-gray-500';
          span.className = `inline-flex items-center px-2.5 py-1 rounded-md border font-medium text-sm ${colorClass}`;
          span.textContent = part.content;
          span.setAttribute('contenteditable', 'false');
          contentEditableRef.current?.appendChild(span);
        } else if (part.type === 'preset' && part.preset) {
          // Render Quick Template badge with different color palette
          const span = document.createElement('span');
          const colorClass = presetColors[part.preset.id] || 'bg-slate-700 text-white dark:bg-slate-800 dark:text-white border-slate-800 dark:border-slate-600';
          span.className = `inline-flex items-center px-2.5 py-1 rounded-md border font-medium text-sm ${colorClass}`;
          span.textContent = `${part.preset.emoji} ${part.preset.title}`;
          span.setAttribute('contenteditable', 'false');
          contentEditableRef.current?.appendChild(span);
        } else {
          const textNode = document.createTextNode(part.content);
          contentEditableRef.current?.appendChild(textNode);
        }
      });
      
      // Restore cursor position after updating innerHTML
      if (cursorPosition !== null) {
        setTimeout(() => restoreCursorPosition(cursorPosition), 0);
      }
    };
    
    const handleInput = () => {
      const text = getEditableText();
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
      const text = getEditableText();
      // Update if there are mentions or preset selected
      if (text.includes('@') || selectedPreset) {
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
    
    // Always update styled content if there are mentions or preset selected
    if (value && (value.includes('@') || selectedPreset)) {
      const parts = parseTextWithMentions(value, selectedPreset);
      
      // Save cursor position
      const cursorPosition = saveCursorPosition();
      
      div.innerHTML = '';
      parts.forEach(part => {
        if (part.type === 'mention' && part.template) {
          // Render @mention badge
          const span = document.createElement('span');
          const colorClass = categoryColors[part.template.category] || 'bg-gray-600 text-white border-gray-700 dark:bg-gray-700 dark:text-white dark:border-gray-500';
          span.className = `inline-flex items-center px-2.5 py-1 rounded-md border font-medium text-sm ${colorClass}`;
          span.textContent = part.content;
          span.setAttribute('contenteditable', 'false');
          div.appendChild(span);
        } else if (part.type === 'preset' && part.preset) {
          // Render Quick Template badge
          const span = document.createElement('span');
          const colorClass = presetColors[part.preset.id] || 'bg-slate-700 text-white dark:bg-slate-800 dark:text-white border-slate-800 dark:border-slate-600';
          span.className = `inline-flex items-center px-2.5 py-1 rounded-md border font-medium text-sm ${colorClass}`;
          span.textContent = `${part.preset.emoji} ${part.preset.title}`;
          span.setAttribute('contenteditable', 'false');
          div.appendChild(span);
        } else {
          const textNode = document.createTextNode(part.content);
          div.appendChild(textNode);
        }
      });
      
      // Restore cursor position
      if (cursorPosition !== null) {
        setTimeout(() => restoreCursorPosition(cursorPosition), 0);
      }
    } else {
      // Just set the text content for plain text
      div.textContent = value || '';
    }
    
    // Trigger initial input check
    const initialText = getEditableText();
    console.log('📝 Initial text:', initialText);
    if (initialText) {
      setTimeout(() => {
        handleInput();
      }, 0);
    }
    
    return () => {
      div.removeEventListener('input', handleInput);
      div.removeEventListener('keyup', handleInput);
      div.removeEventListener('blur', handleBlur);
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, [value, onChange, selectedPreset]);

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

    const text = getEditableText();
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
