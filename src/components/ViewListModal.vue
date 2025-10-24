<script setup>
import DocumentIcon from "../assets/text-document-line-icon.svg";
import ModalWithButton from "./ModalWithButton.vue";
import PrintableArmyList from "./PrintableArmyList.vue";

const props = defineProps({
  appData: Object,
});
</script>

<template>
  <ModalWithButton class="print-modal" title="View printable army list">
    <template v-slot:button>
      <DocumentIcon class="modal-button__icon" />
      <span>View</span>
    </template>
    <template v-slot:content>
      <PrintableArmyList :app-data="props.appData" />
    </template>
  </ModalWithButton>
</template>

<style scoped lang="scss"></style>
