<script setup>
import DocumentIcon from "../assets/text-document-line-icon.svg";
import ModalWithButton from "./ModalWithButton.vue";
import PrintableArmyList from "./PrintableArmyList.vue";

const props = defineProps({
  currentMFM: Object,
  currentList: Object,
  detachmentDisplayName: String,
});
</script>

<template>
  <ModalWithButton class="print-modal" title="View printable army list">
    <template v-slot:button>
      <DocumentIcon class="modal-button__icon" />
      <span>View</span>
    </template>
    <template v-slot:content>
      <PrintableArmyList
        :current-m-f-m="props.currentMFM"
        :current-list="props.currentList"
        :detachment-display-name="props.detachmentDisplayName"
      />
    </template>
  </ModalWithButton>
</template>

<style scoped lang="scss"></style>
