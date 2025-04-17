import { getContentImageUrl } from '@/app/api/article';
import { deletefileDataUploadthing } from '@/app/api/deleteImageUT';
import { mergeAttributes } from '@tiptap/core';
import Image from '@tiptap/extension-image';
import { toast } from 'sonner';

export const CustomImage = Image.extend({
  draggable: true,
  addAttributes() {
    return {
      ...this.parent?.(),
      class: { default: 'shadow-md' },
      width: { default: 'auto' },
      height: { default: 'auto' },
      src: { default: null },
    };
  },
  renderHTML({ HTMLAttributes }) {
    return ['img', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes)];
  },

  addKeyboardShortcuts() {
    return {
      Backspace: ({ editor }) => {
        const { selection } = editor.state;
        const { from } = selection;
        const node = editor.state.doc.nodeAt(from);

        if (node?.type.name === 'image') {
          const imageUrl = node.attrs.src;

          if (imageUrl) {
            handleDeleteImage(imageUrl);
          }

          //Xoa anh trong trinh soan thao
          editor.commands.deleteNode('image');
        }

        return false;
      },
    };
  },
});

const handleDeleteImage = async (imageUrl: string) => {
  try {
    let request;
    if (imageUrl) {
      const countContentImageUrl = await getContentImageUrl(imageUrl);
      if (countContentImageUrl === 1) {
        request = await deletefileDataUploadthing(imageUrl);
      }
    }
    toast.success(request || 'File và hình ảnh đã được xóa');
  } catch (error: any) {
    toast.error(error);
  }
};
