<script setup>
import ShareIcon from "../assets/document-send-icon.svg";
import { serializeList } from "../utils/serialize-list";
import ModalWithButton from "./ModalWithButton.vue";
import { computed } from "vue";
import { ref } from "vue";

let feedback = ref("");

const props = defineProps({
  appData: Object,
});

const serializedList = computed(() => {
  const list = serializeList(props.appData.currentList);

  return (
    window.location.protocol +
    "//" +
    window.location.host +
    window.location.pathname +
    list
  );
});

function onClosed() {
  feedback.value = "";
}

function copyToClipboard() {
  console.log("copying to clipboard");
  navigator.permissions.query({ name: "clipboard-write" }).then((result) => {
    if (result.state === "granted" || result.state === "prompt") {
      navigator.clipboard.writeText(serializedList.value).then(
        () => {
          feedback.value = "URL copied to clipboard";
        },
        () => {
          feedback.value = "failed to copy URL to clipboard";
        }
      );
    }
  });
}
</script>

<template>
  <ModalWithButton
    class="share-modal"
    @closed="onClosed"
    title="Share army list via URL"
  >
    <template v-slot:button>
      <ShareIcon class="modal-button__icon" />
      <span>Share</span>
    </template>
    <template v-slot:content>
      <div class="share-modal__content">
        <input
          :value="serializedList"
          @focus="$event.target.select()"
          class="share-modal__url"
        />
        <button class="share-modal__button" @click="copyToClipboard">
          Copy to Clipboard
        </button>
        <span class="share-modal__feedback"> {{ feedback }} </span>
      </div>
    </template>
  </ModalWithButton>
</template>

<style scoped lang="scss">
.share-modal {
  &__content {
    display: flex;
    flex-direction: column;
    justify-content: center;
    min-height: 100%;
  }

  &__url {
    border-radius: 12px;
    border: 3px solid black;
    font-size: 12px;
    padding: 6px 8px;
    margin-block-end: 16px;
    margin-block-start: 44px;
  }
  &__feedback {
    text-align: center;
    height: 28px;
  }
  &__button {
    background-color: #333;
    border-radius: 12px;
    border: 3px solid black;
    color: white;
    cursor: pointer;
    font-size: 28px;
    margin-block-end: 16px;
    padding: 6px 8px;
    user-select: none;

    &:hover {
      background-color: #444;
    }

    &:active {
      border-top-width: 5px;
      border-bottom-width: 1px;
    }
  }
}
</style>
