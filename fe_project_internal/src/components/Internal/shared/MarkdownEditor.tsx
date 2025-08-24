"use client"
import React, { useState } from 'react';
import { Bold, Italic, List, ListOrdered, Quote, Code, Link, Image, Smile } from 'lucide-react';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
  showPreview?: boolean;
}

export default function MarkdownEditor({
  value,
  onChange,
  placeholder = "Enter your description...",
  rows = 4,
  className = "",
  showPreview = true
}: MarkdownEditorProps) {
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  const insertMarkdown = (prefix: string, suffix: string = "", placeholder: string = "") => {
    const textarea = document.getElementById('markdown-editor') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    
    const newText = value.substring(0, start) + 
                   prefix + 
                   (selectedText || placeholder) + 
                   suffix + 
                   value.substring(end);
    
    onChange(newText);
    
    // Set cursor position after inserted text
    setTimeout(() => {
      const newCursorPos = start + prefix.length + (selectedText || placeholder).length + suffix.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
      textarea.focus();
    }, 0);
  };

  const toolbarButtons = [
    { icon: Bold, action: () => insertMarkdown('**', '**', 'bold text'), tooltip: 'Bold' },
    { icon: Italic, action: () => insertMarkdown('*', '*', 'italic text'), tooltip: 'Italic' },
    { icon: List, action: () => insertMarkdown('- ', '', 'list item'), tooltip: 'Unordered List' },
    { icon: ListOrdered, action: () => insertMarkdown('1. ', '', 'ordered item'), tooltip: 'Ordered List' },
    { icon: Quote, action: () => insertMarkdown('> ', '', 'quote text'), tooltip: 'Quote' },
    { icon: Code, action: () => insertMarkdown('`', '`', 'code'), tooltip: 'Inline Code' },
    { icon: Link, action: () => insertMarkdown('[', '](url)', 'link text'), tooltip: 'Link' },
    { icon: Image, action: () => insertMarkdown('![', '](image-url)', 'alt text'), tooltip: 'Image' },
    { icon: Smile, action: () => insertMarkdown('😊 ', '', ''), tooltip: 'Emoji' },
  ];

  const renderMarkdownPreview = (markdown: string) => {
    // Basic Markdown to HTML conversion (you can use a library like marked for more features)
    let html = markdown
      // Headers
      .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-semibold mt-4 mb-2">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mt-4 mb-2">$1</h1>')
      // Bold
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold">$1</strong>')
      // Italic
      .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
      // Code
      .replace(/`(.*?)`/g, '<code class="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">$1</code>')
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 hover:text-blue-800 underline" target="_blank" rel="noopener noreferrer">$1</a>')
      // Images
      .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="max-w-full h-auto rounded-lg my-2" />')
      // Blockquotes
      .replace(/^> (.*$)/gim, '<blockquote class="border-l-4 border-gray-300 pl-4 my-2 italic text-gray-700">$1</blockquote>')
      // Lists
      .replace(/^[\*\-]\s+(.*$)/gim, '<li class="ml-4">$1</li>')
      .replace(/^[\d]+\.\s+(.*$)/gim, '<li class="ml-4">$1</li>')
      // Line breaks
      .replace(/\n/g, '<br />');

    // Wrap lists properly
    html = html.replace(/(<li.*<\/li>)/g, '<ul class="list-disc ml-6 my-2">$1</ul>');
    
    return html;
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 p-2 bg-gray-50 border border-gray-200 rounded-lg">
        {toolbarButtons.map((button, index) => (
          <button
            key={index}
            type="button"
            onClick={button.action}
            className="p-2 hover:bg-gray-200 rounded-md transition-colors duration-200 group relative"
            title={button.tooltip}
          >
            <button.icon className="w-4 h-4 text-gray-600 group-hover:text-gray-800" />
          </button>
        ))}
        
        {showPreview && (
          <div className="ml-auto flex items-center">
            <button
              type="button"
              onClick={() => setIsPreviewMode(!isPreviewMode)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors duration-200 ${
                isPreviewMode 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {isPreviewMode ? 'Edit' : 'Preview'}
            </button>
          </div>
        )}
      </div>

      {/* Editor/Preview */}
      {isPreviewMode ? (
        <div className="prose prose-sm max-w-none p-4 bg-gray-50 border border-gray-200 rounded-lg min-h-[120px]">
          <div 
            dangerouslySetInnerHTML={{ 
              __html: renderMarkdownPreview(value) || '<span class="text-gray-400">No content to preview</span>' 
            }} 
          />
        </div>
      ) : (
        <textarea
          id="markdown-editor"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none font-mono text-sm"
        />
      )}

      {/* Help Text */}
      <div className="text-xs text-gray-500 space-y-1">
        <p><strong>Markdown Tips:</strong></p>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <span>**bold** • *italic* • `code`</span>
                     <span>- list • &gt; quote • [link](url)</span>
        </div>
      </div>
    </div>
  );
}
