import { useEffect, useRef, useMemo, useCallback } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const RichTextEditor = ({ value, onChange, placeholder }: RichTextEditorProps) => {
  const quillRef = useRef<ReactQuill>(null);

  // Handle image upload - convert to base64 for inline embedding
  const imageHandler = useCallback(() => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = async () => {
      const file = input.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = () => {
          const quill = quillRef.current?.getEditor();
          if (quill) {
            const range = quill.getSelection(true);
            quill.insertEmbed(range.index, 'image', reader.result);
            quill.setSelection({ index: range.index + 1, length: 0 });
          }
        };
        reader.readAsDataURL(file);
      }
    };
  }, []);

  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, 4, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'indent': '-1'}, { 'indent': '+1' }],
        ['link', 'image', 'blockquote'],
        [{ 'align': [] }],
        ['clean']
      ],
      handlers: {
        image: imageHandler
      }
    },
    clipboard: {
      matchVisual: false
    }
  }), [imageHandler]);

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet', 'indent',
    'link', 'image', 'blockquote',
    'align'
  ];

  // Handle paste events to support pasted images
  useEffect(() => {
    const quill = quillRef.current?.getEditor();
    if (!quill) return;

    const handlePaste = (e: ClipboardEvent) => {
      const clipboardData = e.clipboardData;
      if (!clipboardData) return;

      // Check for image files in clipboard
      const items = clipboardData.items;
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.indexOf('image') !== -1) {
          e.preventDefault();
          const file = item.getAsFile();
          if (file) {
            const reader = new FileReader();
            reader.onload = () => {
              const range = quill.getSelection(true);
              quill.insertEmbed(range.index, 'image', reader.result);
              quill.setSelection({ index: range.index + 1, length: 0 });
            };
            reader.readAsDataURL(file);
          }
          return;
        }
      }
    };

    const editorElement = quill.root;
    editorElement.addEventListener('paste', handlePaste);

    return () => {
      editorElement.removeEventListener('paste', handlePaste);
    };
  }, []);

  return (
    <div className="rich-text-editor">
      <style>{`
        .rich-text-editor .ql-container {
          min-height: 400px;
          font-size: 16px;
          border-bottom-left-radius: 0.5rem;
          border-bottom-right-radius: 0.5rem;
          background: hsl(var(--background));
          color: hsl(var(--foreground));
        }
        
        .rich-text-editor .ql-toolbar {
          border-top-left-radius: 0.5rem;
          border-top-right-radius: 0.5rem;
          background: hsl(var(--card));
          border-color: hsl(var(--border));
        }
        
        .rich-text-editor .ql-stroke {
          stroke: hsl(var(--foreground));
        }
        
        .rich-text-editor .ql-fill {
          fill: hsl(var(--foreground));
        }
        
        .rich-text-editor .ql-picker-label {
          color: hsl(var(--foreground));
        }
        
        .rich-text-editor .ql-editor {
          color: hsl(var(--foreground));
        }
        
        .rich-text-editor .ql-editor.ql-blank::before {
          color: hsl(var(--muted-foreground));
          font-style: normal;
        }
        
        .rich-text-editor .ql-toolbar button:hover,
        .rich-text-editor .ql-toolbar button.ql-active {
          color: hsl(var(--luxury-gold));
        }
        
        .rich-text-editor .ql-toolbar button:hover .ql-stroke,
        .rich-text-editor .ql-toolbar button.ql-active .ql-stroke {
          stroke: hsl(var(--luxury-gold));
        }
        
        .rich-text-editor .ql-toolbar button:hover .ql-fill,
        .rich-text-editor .ql-toolbar button.ql-active .ql-fill {
          fill: hsl(var(--luxury-gold));
        }
        
        .rich-text-editor .ql-container {
          border-color: hsl(var(--border));
        }
        
        .rich-text-editor .ql-editor h1,
        .rich-text-editor .ql-editor h2,
        .rich-text-editor .ql-editor h3,
        .rich-text-editor .ql-editor h4 {
          color: hsl(var(--foreground));
          font-weight: bold;
        }
        
        .rich-text-editor .ql-editor a {
          color: hsl(var(--luxury-gold));
        }
        
        .rich-text-editor .ql-editor strong {
          font-weight: 600;
        }
        
        .rich-text-editor .ql-editor img {
          max-width: 100%;
          height: auto;
          border-radius: 0.5rem;
          margin: 1rem 0;
        }
      `}</style>
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder || "Start writing..."}
      />
    </div>
  );
};

export default RichTextEditor;
