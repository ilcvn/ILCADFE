'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  BoldIcon,
  ItalicIcon,
  Lightbulb,
  Link2,
  List,
  ListOrdered,
  Quote,
  Redo2,
  StrikethroughIcon,
  UnderlineIcon,
  Undo2,
  YoutubeIcon,
  ChevronDown,
  X,
  Check,
  ImageIcon,
} from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Color } from '@tiptap/extension-color';
import TextStyle from '@tiptap/extension-text-style';
import TextAlign from '@tiptap/extension-text-align';
import Youtube from '@tiptap/extension-youtube';
import { Separator } from './ui/separator';
import { UploadButton } from '@/lib/uploadthing';
import { useCallback, useEffect, useRef, useState } from 'react';
import { CustomImage } from './ImageCustom';
import Link from '@tiptap/extension-link';
import IntroductionArticle from './IntroductionArticle';

// ─── Toast ────────────────────────────────────────────────────────────────────
type ToastType = 'success' | 'error' | 'info';
interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const add = useCallback((message: string, type: ToastType = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3000);
  }, []);
  return { toasts, add };
}

function ToastContainer({ toasts }: { toasts: Toast[] }) {
  const colors: Record<ToastType, string> = {
    success: 'bg-green-600',
    error: 'bg-red-500',
    info: 'bg-blue-500',
  };
  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`${colors[t.type]} text-white text-sm px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2`}
        >
          {t.type === 'success' && <Check size={14} />}
          {t.message}
        </div>
      ))}
    </div>
  );
}

// ─── Modal dùng chung ─────────────────────────────────────────────────────────
function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="bg-white dark:bg-zinc-900 rounded-xl shadow-2xl p-5 w-full max-w-sm mx-4 border border-gray-200 dark:border-zinc-700"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-base">{title}</h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-zinc-800">
            <X size={16} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── Dropdown Heading ─────────────────────────────────────────────────────────
const HEADING_OPTIONS = [
  { label: 'Đoạn văn', value: 0 },
  { label: 'Tiêu đề 1', value: 1 },
  { label: 'Tiêu đề 2', value: 2 },
  { label: 'Tiêu đề 3', value: 3 },
  { label: 'Tiêu đề 4', value: 4 },
  { label: 'Tiêu đề 5', value: 5 },
  { label: 'Tiêu đề 6', value: 6 },
] as const;

function HeadingDropdown({ editor }: { editor: ReturnType<typeof useEditor> }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (!editor) return null;

  const active =
    HEADING_OPTIONS.find((h) => (h.value === 0 ? !editor.isActive('heading') : editor.isActive('heading', { level: h.value }))) ??
    HEADING_OPTIONS[0];

  const apply = (value: number) => {
    if (value === 0) editor.chain().focus().setParagraph().run();
    else
      editor
        .chain()
        .focus()
        .toggleHeading({ level: value as 1 | 2 | 3 | 4 | 5 | 6 })
        .run();
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 px-2 py-1 border rounded text-sm min-w-[100px] justify-between hover:bg-gray-50"
      >
        <span>{active.label}</span>
        <ChevronDown size={14} />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-lg shadow-lg z-50 overflow-hidden min-w-[130px]">
          {HEADING_OPTIONS.map((h) => (
            <button
              key={h.value}
              type="button"
              onClick={() => apply(h.value)}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-zinc-800 flex items-center justify-between ${
                active.value === h.value ? 'text-primary font-medium' : ''
              }`}
            >
              {h.label}
              {active.value === h.value && <Check size={12} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── ToolbarButton ────────────────────────────────────────────────────────────
function ToolbarBtn({
  active,
  onClick,
  title,
  children,
}: {
  active?: boolean;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`px-2 py-1 border rounded transition-colors hover:bg-gray-50 dark:hover:bg-zinc-800 ${
        active ? 'ring-2 ring-primary text-primary bg-primary/5' : ''
      }`}
    >
      {children}
    </button>
  );
}

// ─── Editor chính ─────────────────────────────────────────────────────────────
const Editor = ({ value, onChange }: { value: string; onChange: (content: string) => void }) => {
  const [isSticky, setIsSticky] = useState(false);
  const [isShowFormat, setIsShowFormat] = useState(false);
  const { toasts, add: addToast } = useToast();

  // Modal YouTube
  const [ytOpen, setYtOpen] = useState(false);
  const [ytUrl, setYtUrl] = useState('');
  const [ytWidth, setYtWidth] = useState('640');
  const [ytHeight, setYtHeight] = useState('480');

  // Modal Link
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      CustomImage,
      TextStyle,
      Color,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Youtube.configure({ controls: false, nocookie: true }),
      Link.configure({ openOnClick: false, autolink: true, linkOnPaste: true }),
    ],
    content: value || `<h2>Tiêu đề</h2><p>Giới thiệu ngắn về bài viết</p>`,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class:
          'h-full min-h-[360px] cursor-text rounded-md border p-5 ring-offset-background focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2',
        spellcheck: 'false',
      },
    },
    immediatelyRender: false,
  });

  // Sync value từ bên ngoài
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  // Sticky toolbar
  useEffect(() => {
    const handler = () => setIsSticky(window.scrollY > 600);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  // Mở modal link với URL hiện tại
  const openLinkModal = () => {
    const prev = editor?.getAttributes('link').href || '';
    setLinkUrl(prev);
    setLinkOpen(true);
  };

  const applyLink = () => {
    if (!editor) return;
    if (linkUrl === '') {
      editor.chain().focus().unsetLink().run();
    } else {
      editor.chain().focus().extendMarkRange('link').setLink({ href: linkUrl }).run();
    }
    setLinkOpen(false);
    addToast('Đã chèn liên kết', 'success');
  };

  const applyYoutube = () => {
    if (!editor || !ytUrl.trim()) return;
    editor.commands.setYoutubeVideo({
      src: ytUrl,
      width: Math.max(320, parseInt(ytWidth, 10)) || 640,
      height: Math.max(180, parseInt(ytHeight, 10)) || 480,
    });
    setYtOpen(false);
    setYtUrl('');
    addToast('Đã chèn video YouTube', 'success');
  };

  if (!editor) return null;

  const divider = <div className="flex flex-col justify-center text-gray-300 select-none">│</div>;

  return (
    <>
      <ToastContainer toasts={toasts} />

      {/* Modal YouTube */}
      <Modal open={ytOpen} onClose={() => setYtOpen(false)} title="Chèn video YouTube">
        <div className="flex flex-col gap-3">
          <div>
            <Label className="text-sm mb-1 block">Đường dẫn YouTube</Label>
            <input
              type="url"
              placeholder="https://www.youtube.com/watch?v=..."
              value={ytUrl}
              onChange={(e) => setYtUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && applyYoutube()}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              autoFocus
            />
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <Label className="text-sm mb-1 block">Chiều rộng (px)</Label>
              <input
                type="number"
                min="320"
                max="1024"
                value={ytWidth}
                onChange={(e) => setYtWidth(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="flex-1">
              <Label className="text-sm mb-1 block">Chiều cao (px)</Label>
              <input
                type="number"
                min="180"
                max="720"
                value={ytHeight}
                onChange={(e) => setYtHeight(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-1">
            <button
              type="button"
              onClick={() => setYtOpen(false)}
              className="px-4 py-2 text-sm border rounded-md hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={applyYoutube}
              disabled={!ytUrl.trim()}
              className="px-4 py-2 text-sm bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-50 flex items-center gap-2"
            >
              <YoutubeIcon size={15} />
              Chèn video
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal Link */}
      <Modal open={linkOpen} onClose={() => setLinkOpen(false)} title="Chèn liên kết">
        <div className="flex flex-col gap-3">
          <div>
            <Label className="text-sm mb-1 block">Địa chỉ URL</Label>
            <input
              type="url"
              placeholder="https://example.com"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && applyLink()}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              autoFocus
            />
            <p className="text-xs text-gray-400 mt-1">Để trống để xóa liên kết hiện tại.</p>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setLinkOpen(false)}
              className="px-4 py-2 text-sm border rounded-md hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={applyLink}
              className="px-4 py-2 text-sm bg-primary text-white rounded-md hover:bg-primary/90 flex items-center gap-2"
            >
              <Link2 size={14} />
              {linkUrl ? 'Chèn liên kết' : 'Xóa liên kết'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Editor wrapper */}
      <div className="p-4 border rounded-lg">
        <h2 className="text-lg font-bold mb-3 text-primary">Trình soạn thảo</h2>

        {/* Toolbar */}
        <div
          className={`flex flex-wrap items-center gap-1 ${
            isSticky
              ? 'fixed top-[60px] left-0 px-4 py-2 w-full border-b border-primary bg-white dark:bg-zinc-900 shadow-md z-50'
              : 'mb-3'
          }`}
        >
          {/* Undo / Redo */}
          <ToolbarBtn title="Hoàn tác (Ctrl+Z)" onClick={() => editor.chain().focus().undo().run()}>
            <Undo2 size={16} />
          </ToolbarBtn>
          <ToolbarBtn title="Làm lại (Ctrl+Y)" onClick={() => editor.chain().focus().redo().run()}>
            <Redo2 size={16} />
          </ToolbarBtn>

          {divider}

          {/* Heading dropdown */}
          <HeadingDropdown editor={editor} />

          {divider}

          {/* Text format */}
          <ToolbarBtn
            title="In đậm (Ctrl+B)"
            active={editor.isActive('bold')}
            onClick={() => editor.chain().focus().toggleBold().run()}
          >
            <BoldIcon size={16} />
          </ToolbarBtn>
          <ToolbarBtn
            title="In nghiêng (Ctrl+I)"
            active={editor.isActive('italic')}
            onClick={() => editor.chain().focus().toggleItalic().run()}
          >
            <ItalicIcon size={16} />
          </ToolbarBtn>
          <ToolbarBtn
            title="Gạch chân (Ctrl+U)"
            active={editor.isActive('underline')}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
          >
            <UnderlineIcon size={16} />
          </ToolbarBtn>
          <ToolbarBtn
            title="Gạch ngang"
            active={editor.isActive('strike')}
            onClick={() => editor.chain().focus().toggleStrike().run()}
          >
            <StrikethroughIcon size={16} />
          </ToolbarBtn>
          <ToolbarBtn
            title="Trích dẫn"
            active={editor.isActive('blockquote')}
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
          >
            <Quote size={16} />
          </ToolbarBtn>
          <ToolbarBtn title="Chèn / Sửa liên kết" active={editor.isActive('link')} onClick={openLinkModal}>
            <Link2 size={16} />
          </ToolbarBtn>

          {divider}

          {/* Alignment */}
          <ToolbarBtn
            title="Căn trái"
            active={editor.isActive({ textAlign: 'left' })}
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
          >
            <AlignLeft size={16} />
          </ToolbarBtn>
          <ToolbarBtn
            title="Căn giữa"
            active={editor.isActive({ textAlign: 'center' })}
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
          >
            <AlignCenter size={16} />
          </ToolbarBtn>
          <ToolbarBtn
            title="Căn phải"
            active={editor.isActive({ textAlign: 'right' })}
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
          >
            <AlignRight size={16} />
          </ToolbarBtn>

          {divider}

          {/* Lists */}
          <ToolbarBtn
            title="Danh sách không thứ tự"
            active={editor.isActive('bulletList')}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
          >
            <List size={16} />
          </ToolbarBtn>
          <ToolbarBtn
            title="Danh sách có thứ tự"
            active={editor.isActive('orderedList')}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
          >
            <ListOrdered size={16} />
          </ToolbarBtn>

          {divider}

          {/* Color picker */}
          <div className="flex items-center gap-1">
            <input
              type="color"
              id="colorPicker"
              onInput={(e) =>
                editor
                  .chain()
                  .focus()
                  .setColor((e.target as HTMLInputElement).value)
                  .run()
              }
              value={editor.getAttributes('textStyle').color || '#000000'}
              className="opacity-0 absolute w-0 h-0"
            />
            <Label
              htmlFor="colorPicker"
              title="Chọn màu chữ"
              className="w-8 h-8 rounded border border-gray-300 cursor-pointer flex items-center justify-center text-base"
              style={{ backgroundColor: editor.getAttributes('textStyle').color || '#000000' }}
            >
              🎨
            </Label>
            <button
              type="button"
              title="Xóa màu chữ"
              onClick={() => editor.chain().focus().unsetColor().run()}
              className="px-2 py-1 border rounded text-xs hover:bg-gray-50"
            >
              Xóa màu
            </button>
          </div>

          {divider}

          {/* Insert YouTube */}
          <button
            type="button"
            title="Chèn video YouTube"
            onClick={() => setYtOpen(true)}
            className="px-2 py-1 border rounded bg-red-50 hover:bg-red-100 text-red-600 flex items-center gap-1 text-sm"
          >
            <YoutubeIcon size={16} />
            <span className="hidden sm:inline">YouTube</span>
          </button>
        </div>

        {/* Nội dung editor + bố cục mẫu */}
        <div className="flex flex-col lg:flex-row gap-4 relative">
          <div className="w-full relative">
            {/* Nút bố cục mẫu */}
            <button
              onClick={() => setIsShowFormat((v) => !v)}
              type="button"
              title="Xem bố cục mẫu"
              className="absolute right-2 top-2 z-10 bg-yellow-400 hover:bg-yellow-500 active:scale-95 transition-transform p-1.5 rounded-md flex items-center gap-1 text-xs text-white font-medium shadow-sm"
            >
              <Lightbulb size={14} />
              <span className="hidden sm:inline">Bố cục mẫu</span>
            </button>
            <EditorContent editor={editor} className="ProseMirror" />
          </div>

          {isShowFormat && <IntroductionArticle setIsShowFormat={setIsShowFormat} />}
        </div>

        <Separator className="my-4 border-gray-200" />

        {/* Upload ảnh */}
        <div className="flex flex-col items-center gap-2 py-2">
          <Label className="text-primary font-semibold flex items-center gap-1.5">
            <ImageIcon size={15} />
            Tải hình ảnh vào bài viết
          </Label>
          <UploadButton
            endpoint="singleImageUploader"
            onClientUploadComplete={(res) => {
              if (res?.length) {
                res.forEach((file) => editor.chain().focus().setImage({ src: file.ufsUrl }).run());
                addToast(`Đã chèn ${res.length} ảnh vào bài viết`, 'success');
              }
            }}
            onUploadError={(error) => addToast(`Lỗi upload: ${error.message}`, 'error')}
          />
        </div>
      </div>
    </>
  );
};

export default Editor;
