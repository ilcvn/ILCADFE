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
  List,
  ListOrdered,
  Redo2,
  StrikethroughIcon,
  UnderlineIcon,
  Undo2,
  YoutubeIcon,
} from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Color } from '@tiptap/extension-color';
import TextStyle from '@tiptap/extension-text-style';
import TextAlign from '@tiptap/extension-text-align';
import Youtube from '@tiptap/extension-youtube';
import { Separator } from './ui/separator';
import { UploadButton } from '@/lib/uploadthing';
import { useEffect, useState } from 'react';
import { CustomImage } from './ImageCustom';

const Editor = ({ value, onChange }: { value: string; onChange: (content: string) => void }) => {
  const [isSticky, setIsSticky] = useState(false);
  const [isShowFormat, setIsShowFormat] = useState(false);

  const [height, setHeight] = useState('480');
  const [width, setWidth] = useState('640');

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      // Image,
      CustomImage,
      TextStyle,
      Color,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Youtube.configure({
        controls: false,
        nocookie: true,
      }),
    ],
    content: value || `<h2>Tiêu đề</h2><p>Giới thiệu ngắn về bài viết</p>`,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          'h-full cursor-text rounded-md border p-5 ring-offset-background focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2',
        spellcheck: 'false',
      },
    },
    immediatelyRender: false,
  });

  const addYoutubeVideo = () => {
    const url = prompt('Nhập đường dẫn Youtube');

    if (url) {
      editor?.commands.setYoutubeVideo({
        src: url,
        width: Math.max(320, parseInt(width, 10)) || 640,
        height: Math.max(180, parseInt(height, 10)) || 480,
      });
    }
  };

  // Cập nhật nội dung editor khi giá trị value thay đổi
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }

    const handleScroll = () => {
      if (window.scrollY > 600) {
        setIsSticky(true);
      } else {
        setIsSticky(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [value, editor]);

  if (!editor) return null;

  return (
    <div className="p-4 border rounded-lg">
      <h2 className="text-lg font-bold mb-2 text-primary">Trình soạn thảo</h2>
      <div className={`space-x-2 flex flex-wrap ${isSticky ? 'fixed top-12 left-0 w-full bg-white shadow-lg z-50' : ''}`}>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`px-2 py-1 border rounded ${editor.isActive('bold') ? 'ring-2 ring-primary text-primary' : ''}`}
        >
          <BoldIcon size={18} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`px-2 py-1 border rounded ${editor.isActive('italic') ? 'ring-2 ring-primary text-primary' : ''}`}
        >
          <ItalicIcon size={18} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`px-2 py-1 border rounded ${editor.isActive('underline') ? 'ring-2 ring-primary text-primary' : ''}`}
        >
          <UnderlineIcon size={18} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`px-2 py-1 border rounded ${editor.isActive('strike') ? 'ring-2 ring-primary text-primary' : ''}`}
        >
          <StrikethroughIcon size={18} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`px-2 py-1 border rounded ${
            editor.isActive('heading', { level: 1 }) ? 'ring-2 ring-primary text-primary' : ''
          }`}
        >
          H1
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`px-2 py-1 border rounded ${
            editor.isActive('heading', { level: 2 }) ? 'ring-2 ring-primary text-primary' : ''
          }`}
        >
          H2
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`px-2 py-1 border rounded ${
            editor.isActive('heading', { level: 3 }) ? 'ring-2 ring-primary text-primary' : ''
          }`}
        >
          H3
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
          className={`px-2 py-1 border rounded ${
            editor.isActive('heading', { level: 4 }) ? 'ring-2 ring-primary text-primary' : ''
          }`}
        >
          H4
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 5 }).run()}
          className={`px-2 py-1 border rounded ${
            editor.isActive('heading', { level: 5 }) ? 'ring-2 ring-primary text-primary' : ''
          }`}
        >
          H5
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 6 }).run()}
          className={`px-2 py-1 border rounded ${
            editor.isActive('heading', { level: 6 }) ? 'ring-2 ring-primary text-primary' : ''
          }`}
        >
          H6
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          className={`px-2 py-1 border rounded ${
            editor.isActive({ textAlign: 'left' }) ? 'ring-2 ring-primary text-primary' : ''
          }`}
        >
          <AlignLeft className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          className={`px-2 py-1 border rounded ${
            editor.isActive({ textAlign: 'center' }) ? 'ring-2 ring-primary text-primary' : ''
          }`}
        >
          <AlignCenter className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          className={`px-2 py-1 border rounded ${
            editor.isActive({ textAlign: 'right' }) ? 'ring-2 ring-primary text-primary' : ''
          }`}
        >
          <AlignRight className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`px-2 py-1 border rounded ${editor.isActive('bulletList') ? 'ring-2 ring-primary text-primary' : ''}`}
        >
          <List size={18} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`px-2 py-1 border rounded ${editor.isActive('orderedList') ? 'ring-2 ring-primary text-primary' : ''}`}
        >
          <ListOrdered size={18} />
        </button>
        <button type="button" onClick={() => editor.chain().focus().undo().run()} className="px-2 py-1 border rounded">
          <Undo2 size={18} />
        </button>
        <button type="button" onClick={() => editor.chain().focus().redo().run()} className="px-2 py-1 border rounded">
          <Redo2 size={18} />
        </button>

        <div className="flex items-center space-x-2">
          <input
            type="color"
            id="colorPicker"
            onInput={(event) =>
              editor &&
              editor
                .chain()
                .focus()
                .setColor((event.target as HTMLInputElement).value)
                .run()
            }
            value={editor?.getAttributes('textStyle').color || '#000000'}
            className="opacity-0 absolute w-0 h-0"
          />
          <Label
            htmlFor="colorPicker"
            className="w-10 h-10 rounded-full border-2 border-gray-300 cursor-pointer flex items-center justify-center"
            style={{
              backgroundColor: editor?.getAttributes('textStyle').color || '#000000',
            }}
          >
            🎨
          </Label>

          <button type="button" onClick={() => editor.chain().focus().unsetColor().run()} className="px-2 py-1 border rounded">
            Reset color
          </button>
        </div>
      </div>

      <div className="py-2">
        <div className="flex-col lg:flex lg:flex-row lg:items-center gap-2">
          <div className="flex flex-col">
            <label>Chiều dài</label>
            <input
              id="width"
              type="number"
              min="320"
              max="1024"
              placeholder="Width"
              value={width}
              onChange={(event) => setWidth(event.target.value)}
              className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brandPrimary"
            />
          </div>
          <div className="flex flex-col">
            <label>Chiều rộng</label>
            <input
              id="height"
              type="number"
              min="180"
              max="720"
              placeholder="Height"
              value={height}
              onChange={(event) => setHeight(event.target.value)}
              className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brandPrimary"
            />
          </div>
          <div className="flex flex-col">
            <label>Đường dẫn URL</label>
            <div>
              <button
                type="button"
                id="add"
                onClick={addYoutubeVideo}
                className="px-4 py-2 bg-red-500 text-black font-semibold rounded-md shadow-md hover:bg-opacity-90 transition-all"
              >
                <div className="flex gap-1 text-white">
                  <span>Youtube</span>
                  <YoutubeIcon className="text-white text-center block" />
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-col space-y-4 lg:flex lg:flex-row lg:gap-x-4 py-3 lg:space-y-0 relative">
        {/* Trình soạn thảo */}

        <div className="w-full relative">
          <button
            onClick={() => setIsShowFormat(!isShowFormat)}
            type="button"
            className="bg-yellow-500 p-2 rounded-md w-max absolute right-[-6px] -translate-x-1/2 top-6 -translate-y-1/2 z-40 
             transition transform active:scale-90 focus:bg-yellow-600 hover:bg-yellow-600"
          >
            <Lightbulb className="w-4 h-4 text-white" />
          </button>
          <EditorContent editor={editor} className="ProseMirror" />
        </div>

        {/* Bố cục mẫu */}

        {isShowFormat && (
          <div className="border rounded-lg p-4 bg-gray-100 sticky top-4 w-full lg:w-max">
            <h2 className="text-lg font-bold mb-2 text-primary">Bố cục mẫu</h2>
            <hr className="mb-1 border-muted-foreground" />
            <article>
              <h1 className="text-xl font-bold">Tiêu đề bài viết</h1>
              <p className="italic">Giới thiệu ngắn gọn về nội dung bài viết.</p>

              <h2 className="text-lg font-bold mt-3">Mục 1: Giới thiệu</h2>
              <p>Đây là phần giới thiệu về bài viết.</p>

              <h2 className="text-lg font-bold mt-3">Mục 2: Nội dung chính</h2>
              <p>Chi tiết nội dung bài viết.</p>
              <img src="https://placehold.co/800x400/6A00F5/white" alt="Mô tả hình ảnh" className="rounded-lg my-2" />
              <p className="text-sm text-gray-500">Chú thích ảnh: Hình minh họa.</p>

              <h2 className="text-lg font-bold mt-3">Mục 3: Kết luận</h2>
              <p>Tóm tắt nội dung chính.</p>
              <img src="https://placehold.co/800x400/6A00F5/white" alt="Hình ảnh minh họa" className="rounded-lg my-2" />
              <p className="text-sm text-gray-500">Chú thích ảnh: Hình minh họa.</p>
            </article>
          </div>
        )}
      </div>

      <Separator className=" border-gray-300" />
      {/* Upload nhiều ảnh */}
      <div className="flex flex-col gap-2 items-center py-4">
        <Label className="text-primary font-bold">Tải hình ảnh lên trình soạn thảo</Label>
        <UploadButton
          endpoint="singleImageUploader"
          onClientUploadComplete={(res) => {
            if (res && res.length > 0) {
              res.forEach((file) => {
                editor.chain().focus().setImage({ src: file.ufsUrl }).run();
              });
            }
          }}
          onUploadError={(error) => alert(`Lỗi: ${error.message}`)}
        />
      </div>
    </div>
  );
};

export default Editor;
