<script setup>
import RiskIcon from "../assets/risk-icon.svg";
import ModalWithButton from "./ModalWithButton.vue";
import { MFM_VERSION } from "../utils/data-reader";

const props = defineProps({
  appData: Object,
});

function onConfirmClicked() {
  upgradeMFMVersion(props.appData.currentList);
}

function upgradeMFMVersion(list) {
  if (list.mfm_version === MFM_VERSION) {
    return; // already using the correct version
  }

  try {
    list.units.forEach((unit) => {
      const points = getPoints(unit);
    });

    list.mfm_version = MFM_VERSION;
  } catch (e) {
    console.error(`Failed to upgrade list to ${MFM_VERSION}`, e);
  }
}

function getPoints(unit) {
  const data_sheet = props.appData.compendium.find((d) => d.name === unit.name);
  let option;

  if (unit.optionName) {
    option = data_sheet.sizes.find((s) => s.name === unit.optionName.trim());
  } else if (unit.models) {
    option = data_sheet.sizes.find((s) => s.models === unit.models);
  }

  if (option) {
    unit.points = option.points;
  } else {
    unit.error = true;
  }
}
</script>

<template>
  <ModalWithButton class="update-modal">
    <template v-slot:button>
      <RiskIcon class="modal-button__icon" /> <span> Update </span>
    </template>
    <template v-slot:content>
      <h2>Upgrade to Minutorum Field Manual {{ MFM_VERSION }}?</h2>
      <p>
        This list was crated using the Minutorum Field Manual
        <b>{{ props.appData.currentList.mfm_version || "1.0" }}</b> but the
        latest version is <b>{{ MFM_VERSION }}</b
        >.
      </p>
      <p>
        Do you wish to automatically update the units in your army list to their
        latest point values?
      </p>
      <br />
      <br />
      <br />
      <form method="dialog">
        <button @click="onConfirmClicked" class="update-modal__yes">
          Update Points
        </button>
      </form>
    </template>
  </ModalWithButton>
</template>

<style scoped lang="scss">
.update-modal {
  &__yes {
    background-color: transparent;
    font-size: 24px;
    border-radius: 8px;
    cursor: pointer;

    &:hover {
      background-color: rgba(0, 0, 0, 0.1);
    }
  }
}
</style>
