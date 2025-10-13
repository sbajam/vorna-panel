<template>
  <ImageP
    :show="imagePopup"
    @close_popup="imagePopup = false"
    @choose="
      (src) => {
        setImage(src);
        imagePopup = false;
      }
    "
  />

  <div
    class="border border-solid border-gray-100 rounded-lg overflow-hidden textarea"
  >
    <!-- Toolbar -->
    <div
      v-if="editor"
      class="editor"
      :class="disabled ? 'opacity-60 pointer-events-none' : ''"
    >
      <button class="editor-btn" @click="cmd('undo')" :disabled="!can('undo')">
        <Icon name="fa6-solid:rotate-left" />
      </button>
      <button class="editor-btn" @click="cmd('redo')" :disabled="!can('redo')">
        <Icon name="fa6-solid:rotate-right" />
      </button>

      <button
        class="editor-btn"
        :class="{ 'is-active': isActive('bold') }"
        @click="toggle('toggleBold')"
        :disabled="!can('toggleBold')"
      >
        <Icon name="fa6-solid:bold" />
      </button>
      <button
        class="editor-btn"
        :class="{ 'is-active': isActive('italic') }"
        @click="toggle('toggleItalic')"
        :disabled="!can('toggleItalic')"
      >
        <Icon name="fa6-solid:italic" />
      </button>
      <button
        class="editor-btn"
        :class="{ 'is-active': isActive('strike') }"
        @click="toggle('toggleStrike')"
        :disabled="!can('toggleStrike')"
      >
        <Icon name="fa6-solid:strikethrough" />
      </button>
      <button
        class="editor-btn"
        :class="{ 'is-active': isActive('code') }"
        @click="toggle('toggleCode')"
        :disabled="!can('toggleCode')"
      >
        <Icon name="fa6-solid:code" />
      </button>

      <button
        class="editor-btn"
        :class="{ 'is-active': isActive('paragraph') }"
        @click="cmd('setParagraph')"
      >
        <Icon name="fa6-solid:paragraph" />
      </button>
      <button
        class="editor-btn"
        :class="{ 'is-active': isHeading(1) }"
        @click="cmd('toggleHeading', { level: 1 })"
      >
        <span class="text-secondary font-bold">H1</span>
      </button>
      <button
        class="editor-btn"
        :class="{ 'is-active': isHeading(2) }"
        @click="cmd('toggleHeading', { level: 2 })"
      >
        <span class="text-secondary font-bold">H2</span>
      </button>
      <button
        class="editor-btn"
        :class="{ 'is-active': isHeading(3) }"
        @click="cmd('toggleHeading', { level: 3 })"
      >
        <span class="text-secondary font-bold">H3</span>
      </button>
      <button
        class="editor-btn"
        :class="{ 'is-active': isHeading(4) }"
        @click="cmd('toggleHeading', { level: 4 })"
      >
        <span class="text-secondary font-bold">H4</span>
      </button>

      <button
        class="editor-btn"
        :class="{ 'is-active': isActive('bulletList') }"
        @click="cmd('toggleBulletList')"
      >
        <Icon name="fa6-solid:list-ul" />
      </button>
      <button
        class="editor-btn"
        :class="{ 'is-active': isActive('orderedList') }"
        @click="cmd('toggleOrderedList')"
      >
        <Icon name="fa6-solid:list-ol" />
      </button>

      <button
        class="editor-btn"
        :class="{ 'is-active': isActive('blockquote') }"
        @click="cmd('toggleBlockquote')"
      >
        <Icon name="fa6-solid:quote-right" />
      </button>
      <button class="editor-btn" @click="cmd('setHorizontalRule')">
        <Icon name="fa6-solid:minus" />
      </button>
      <button class="editor-btn" @click="cmd('setHardBreak')">
        <Icon name="fa6-solid:turn-down" />
      </button>

      <button
        class="editor-btn"
        :class="{ 'is-active': isActive('link') }"
        @click="setLink"
      >
        <Icon name="fa6-solid:link" />
      </button>
      <button
        class="editor-btn"
        @click="cmd('unsetLink')"
        :disabled="!editor?.isActive('link')"
      >
        <Icon name="fa6-solid:link-slash" />
      </button>

      <button class="editor-btn" v-if="image" @click="imagePopup = true">
        <Icon name="fa6-solid:image" />
      </button>
    </div>

    <editor-content
      :editor="editor"
      class="tiptap max-h-[60vh] overflow-auto"
      :data-name="name"
    />
  </div>
</template>

<script setup>
import {
  ref,
  useCookie,
  useNuxtApp,
  useRoute,
  navigateTo,
  useRouter,
  useRuntimeConfig,
  computed,
  onBeforeMount,
  watch,
  nextTick,
  onMounted,
  onBeforeUnmount,
} from "#imports";

import { Editor, EditorContent } from "@tiptap/vue-3";
import StarterKit from "@tiptap/starter-kit";
import Document from "@tiptap/extension-document";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";
import Code from "@tiptap/extension-code";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
// (اختیاری) شمارنده کاراکتر: import CharacterCount from '@tiptap/extension-character-count';

const props = defineProps({
  modelValue: { type: String, default: "" },
  image: { type: Boolean, default: true },
  placeholder: { type: String, default: "" },
  disabled: { type: Boolean, default: false },
  name: { type: String, default: "" },
  maxChars: { type: Number, default: 0 }, // 0 یعنی بدون محدودیت
});

const emit = defineEmits(["update:modelValue", "focus", "blur"]);

const editor = ref(null);
const imagePopup = ref(false);

const can = (action) => {
  if (!editor.value) return false;
  const chain = editor.value.can().chain().focus();
  switch (action) {
    case "undo":
      return chain.undo().run();
    case "redo":
      return chain.redo().run();
    case "toggleBold":
      return chain.toggleBold().run();
    case "toggleItalic":
      return chain.toggleItalic().run();
    case "toggleStrike":
      return chain.toggleStrike().run();
    case "toggleCode":
      return chain.toggleCode().run();
    default:
      return true;
  }
};
const toggle = (cmdName) => editor.value?.chain().focus()[cmdName]().run();
const cmd = (cmdName, arg) => editor.value?.chain().focus()[cmdName](arg).run();

const isActive = (name, attrs) => editor.value?.isActive(name, attrs);
const isHeading = (level) => editor.value?.isActive("heading", { level });

watch(
  () => props.modelValue,
  (value) => {
    if (!editor.value) return;
    const current = editor.value.getHTML();
    if (current !== value) {
      editor.value.commands.setContent(value || "", false);
    }
  }
);

watch(
  () => props.disabled,
  (d) => {
    if (editor.value) editor.value.setOptions({ editable: !d });
  },
  { immediate: true }
);

onMounted(() => {
  editor.value = new Editor({
    editable: !props.disabled,
    extensions: [
      StarterKit,
      Document,
      Paragraph,
      Text,
      Code,
      Link.configure({ openOnClick: false }),
      Image,
      Placeholder.configure({
        placeholder: props.placeholder || "",
        emptyNodeClass:
          "before:content-[attr(data-placeholder)] before:text-gray-400 before:pointer-events-none before:absolute before:rtl:pr-4 before:ltr:pl-4",
      }),
      // props.maxChars ? CharacterCount.configure({ limit: props.maxChars }) : null,
    ].filter(Boolean),
    content: props.modelValue,
    onUpdate: ({ editor: ed }) => {
      if (props.maxChars > 0) {
        const plain = ed.getText();
        if (plain.length > props.maxChars) {
          // اگر خواستی سخت‌گیرانه باشه، برگردون به قبلی
          // اینجا فقط اجازه نمی‌دیم از limit بیشتر شه
          ed.commands.setTextSelection({
            from: 0,
            to: ed.state.doc.content.size,
          });
        }
      }
      emit("update:modelValue", ed.getHTML());
    },
    onFocus: () => emit("focus"),
    onBlur: () => emit("blur"),
  });
});

function setLink() {
  const prev = editor.value?.getAttributes("link").href || "";
  const url = window.prompt("URL", prev);
  if (url === null) return;
  if (url === "") {
    editor.value?.chain().focus().extendMarkRange("link").unsetLink().run();
    return;
  }
  editor.value
    ?.chain()
    .focus()
    .extendMarkRange("link")
    .setLink({ href: url })
    .run();
}

function setImage(src) {
  editor.value?.chain().focus().setImage({ src }).run();
}

onBeforeUnmount(() => {
  editor.value?.destroy();
});
</script>

<style lang="scss">
.tiptap {
  @apply relative outline-none px-4 py-2 min-h-[4rem];

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
  @apply grid grid-cols-5 md:flex flex-wrap items-stretch gap-1 border border-solid border-gray-100 bg-gray-100 p-1;

  .editor-btn {
    @apply flex items-center  justify-center border border-solid border-gray-100 py-1 px-3 cursor-pointer duration-300 rounded-lg text-xl text-secondary-100 bg-white;
    &:disabled {
      @apply opacity-50 cursor-not-allowed;
    }
    &.is-active {
      @apply bg-white ring-1 ring-secondary-30;
    }
  }
}
</style>
