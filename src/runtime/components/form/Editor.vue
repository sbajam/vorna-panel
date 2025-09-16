<template>
  <ImageP
    :show="imagePopup"
    @close_popup="imagePopup = false"
    @choose="(src)=>{setImage(src);imagePopup=false}"
  />
  <!-- <VideoP :show="videoPopup" @close_popup="videoPopup = false"  @choose="(src)=>setVideo(src)" /> -->
  <div
    class="border border-solid border-gray-100 rounded-lg overflow-hidden textarea"
  >
    <div v-if="editor" class="editor">
      <div
        class="editor-btn"
        @click="editor.chain().focus().undo().run()"
        :disabled="!editor.can().chain().focus().undo().run()"
      >
        <Icon name="fa6-solid:rotate-left" />
      </div>
      <div
        class="editor-btn"
        @click="editor.chain().focus().redo().run()"
        :disabled="!editor.can().chain().focus().redo().run()"
      >
        <Icon name="fa6-solid:rotate-right" />
      </div>
      <div
        class="editor-btn"
        @click="editor.chain().focus().toggleBold().run()"
        :disabled="!editor.can().chain().focus().toggleBold().run()"
        :class="{ 'is-active': editor.isActive('bold') }"
      >
        <Icon name="fa6-solid:bold" />
      </div>
      <div
        class="editor-btn"
        @click="editor.chain().focus().toggleItalic().run()"
        :disabled="!editor.can().chain().focus().toggleItalic().run()"
        :class="{ 'is-active': editor.isActive('italic') }"
      >
        <Icon name="fa6-solid:italic" />
      </div>
      <div
        class="editor-btn"
        @click="editor.chain().focus().toggleStrike().run()"
        :disabled="!editor.can().chain().focus().toggleStrike().run()"
        :class="{ 'is-active': editor.isActive('strike') }"
      >
        <Icon name="fa6-solid:strikethrough" />
      </div>
      <div
        class="editor-btn"
        @click="editor.chain().focus().toggleCode().run()"
        :disabled="!editor.can().chain().focus().toggleCode().run()"
        :class="{ 'is-active': editor.isActive('code') }"
      >
        <Icon name="fa6-solid:code" />
      </div>
      <!-- <div class="editor-btn" @click="editor.chain().focus().unsetAllMarks().run()">clear marks</div> -->
      <!-- <div class="editor-btn" @click="editor.chain().focus().clearNodes().run()">clear nodes</div> -->
      <div
        class="editor-btn"
        @click="editor.chain().focus().setParagraph().run()"
        :class="{ 'is-active': editor.isActive('paragraph') }"
      >
        <Icon name="fa6-solid:paragraph" />
      </div>
      <div
        class="editor-btn"
        @click="editor.chain().focus().toggleHeading({ level: 1 }).run()"
        :class="{ 'is-active': editor.isActive('heading', { level: 1 }) }"
      >
        <span class="text-secondary font-bold"> H1</span>
      </div>
      <div
        class="editor-btn"
        @click="editor.chain().focus().toggleHeading({ level: 2 }).run()"
        :class="{ 'is-active': editor.isActive('heading', { level: 2 }) }"
      >
        <span class="text-secondary font-bold"> H2</span>
      </div>
      <div
        class="editor-btn"
        @click="editor.chain().focus().toggleHeading({ level: 3 }).run()"
        :class="{ 'is-active': editor.isActive('heading', { level: 3 }) }"
      >
        <span class="text-secondary font-bold"> H3</span>
      </div>
      <div
        class="editor-btn"
        @click="editor.chain().focus().toggleHeading({ level: 4 }).run()"
        :class="{ 'is-active': editor.isActive('heading', { level: 4 }) }"
      >
        <span class="text-secondary font-bold"> H4</span>
      </div>
      <!-- <div class="editor-btn"
        @click="editor.chain().focus().toggleHeading({ level: 5 }).run()"
        :class="{ 'is-active': editor.isActive('heading', { level: 5 }) }"
      >
        h5
      </div>
      <div class="editor-btn"
        @click="editor.chain().focus().toggleHeading({ level: 6 }).run()"
        :class="{ 'is-active': editor.isActive('heading', { level: 6 }) }"
      >
        h6
      </div> -->
      <div
        class="editor-btn"
        @click="editor.chain().focus().toggleBulletList().run()"
        :class="{ 'is-active': editor.isActive('bulletList') }"
      >
        <Icon name="fa6-solid:list-ul" />
      </div>
      <div
        class="editor-btn"
        @click="editor.chain().focus().toggleOrderedList().run()"
        :class="{ 'is-active': editor.isActive('orderedList') }"
      >
        <Icon name="fa6-solid:list-ol" />
      </div>
      <!-- <div class="editor-btn"
        @click="editor.chain().focus().toggleCodeBlock().run()"
        :class="{ 'is-active': editor.isActive('codeBlock') }"
      >
        code block
      </div> -->
      <div
        class="editor-btn"
        @click="editor.chain().focus().toggleBlockquote().run()"
        :class="{ 'is-active': editor.isActive('blockquote') }"
      >
        <Icon name="fa6-solid:quote-right" />
      </div>
      <div
        class="editor-btn"
        @click="editor.chain().focus().setHorizontalRule().run()"
      >
        <Icon name="fa6-solid:minus" />
      </div>
      <div
        class="editor-btn"
        @click="editor.chain().focus().setHardBreak().run()"
      >
        <Icon name="fa6-solid:turn-down" />
      </div>

      <div
        class="editor-btn"
        @click="setLink"
        :class="{ 'is-active': editor.isActive('link') }"
      >
        <Icon name="fa6-solid:link" />
      </div>
      <div
        class="editor-btn"
        @click="editor.chain().focus().unsetLink().run()"
        :disabled="!editor.isActive('link')"
      >
        <Icon name="fa6-solid:link-slash" />
      </div>
      <div class="editor-btn" v-if="props.image" @click="imagePopup = true">
        <Icon name="fa6-solid:image" />
      </div>
      <!-- <div class="editor-btn" @click="videoPopup = true">
        Video
        <Icon name="fa6-solid:camera" />
      </div> -->
    </div>
    <editor-content :editor="editor" class="max-h-[60vh] overflow-auto" />
  </div>
</template>

<script setup>
import Code from "@tiptap/extension-code";
import Document from "@tiptap/extension-document";
import Link from "@tiptap/extension-link";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";
import StarterKit from "@tiptap/starter-kit";
import { Editor, EditorContent } from "@tiptap/vue-3";
import Image from "@tiptap/extension-image";
// import Video from "../Video" from ; // اضافه کردن اکستنشن ویدیو

// Props
const props = defineProps({
  modelValue: {
    type: String,
    default: "",
  },
  image: {
    type: Boolean,
    default: true,
  },
});

// Emits
const emit = defineEmits(["update:modelValue"]);

// Editor instance
const editor = ref(null);

watch(
  () => props.modelValue,
  (value) => {
    if (editor.value) {
      const isSame = editor.value.getHTML() === value;

      if (!isSame) {
        editor.value.commands.setContent(value, false);
      }
    }
  }
);

onMounted(() => {
  editor.value = new Editor({
    extensions: [
      StarterKit,
      Document,
      Paragraph,
      Text,
      Code,
      Link.configure({
        openOnClick: false,
      }),
      Image,
      // Video, // اضافه کردن اکستنشن ویدیو
    ],
    content: props.modelValue,
    onUpdate: () => {
      emit("update:modelValue", editor.value.getHTML());
    },
  });
});

let imagePopup = ref(false);
let videoPopup = ref(false);

function setLink() {
  const previousUrl = editor.value.getAttributes("link").href;
  const url = window.prompt("URL", previousUrl);

  if (url === null) return;
  if (url === "") {
    editor.value.chain().focus().extendMarkRange("link").unsetLink().run();
    return;
  }

  editor.value
    .chain()
    .focus()
    .extendMarkRange("link")
    .setLink({ href: url })
    .run();
}

function setImage(src) {
  editor.value.chain().focus().setImage({ src }).run();
}

function setVideo(src) {
  // editor.value.chain().focus().setVideo({ src }).run();
}

onBeforeUnmount(() => {
  if (editor.value) {
    editor.value.destroy();
  }
});
</script>

<style lang="scss">
/* Basic editor styles */
.tiptap {
  @apply outline-none px-4 py-2 min-h-[4rem];

  > * + * {
    margin-top: 0.75em;
  }
  a {
    color: #68cef8;
  }

  code {
    font-size: 0.9rem;
    padding: 0.25em;
    border-radius: 0.25em;
    background-color: rgba(#616161, 0.1);
    color: #616161;
    box-decoration-break: clone;
  }
  h1 {
    @apply text-3xl;
  }
  h2 {
    @apply text-2xl;
  }
  h3 {
    @apply text-xl;
  }
  h4 {
    @apply text-lg;
  }
  ul {
    list-style: disc;
    padding-right: 1rem;
  }
  ol {
    list-style: decimal;
    padding-right: 1rem;
  }
  img,
  video {
    @apply block max-h-[50vh] max-w-full object-contain mx-auto;
  }
}

.editor {
  @apply flex flex-wrap gap-1 border border-solid border-gray-100  bg-gray-100;
  .editor-btn {
    @apply border border-solid !w-fit border-gray-100 py-1 px-3 cursor-pointer duration-300 rounded-lg  text-xl text-secondary-100;
    &:hover {
      @apply bg-white translate-y-0 shadow-none;
    }
    &.is-active {
      @apply bg-white;
    }
  }
}
</style>
