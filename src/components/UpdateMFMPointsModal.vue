<script setup>
import RiskIcon from "../assets/risk-icon.svg";
import ModalWithButton from "./ModalWithButton.vue";
import { MFM } from "../utils/mfm";
import { computed } from "vue";
import {
  upgradeMFMVersion,
  changes as getMFMChanges,
} from "../utils/update-list-mfm";

const props = defineProps({
  appData: Object,
});

function onConfirmClicked() {
  upgradeMFMVersion(props.appData.currentList);
}

function mfmVersion(version) {
  return (version || "").replace("VERSION ", "");
}

const changes = computed(() => {
  return getMFMChanges(props.appData.currentList);
});
</script>

<template>
  <ModalWithButton class="update-modal">
    <template v-slot:button>
      <RiskIcon class="modal-button__icon" /> <span> Update </span>
    </template>
    <template v-slot:content>
      <h2>
        Upgrade List to Munitorum Field Manual
        {{ mfmVersion(MFM.CURRENT.MFM_VERSION) }}?
      </h2>
      <p>
        This list was created using MFM
        <b>{{ mfmVersion(props.appData.currentList.mfm_version || "1.0") }}</b
        >, but the latest version is MFM
        <b>{{ mfmVersion(MFM.CURRENT.MFM_VERSION) }}</b
        >.
      </p>
      <template v-if="changes.length">
        <ul>
          <li
            v-for="(change, index) in changes"
            :class="{ error: change.new < 0, up: change.up }"
          >
            <template v-if="change.difference > 0">▲ </template>
            <template v-if="change.difference < 0">▼ </template>
            <template v-if="change.optionName">
              {{ change.optionName }} —
            </template>
            <template v-else> ({{ change.models }})</template>
            {{ change.name }}:
            <b>
              <template v-if="change.new < 0">
                Option no longer valid
              </template>
              <template v-else>
                {{ change.old }} pts -> {{ change.new }} pts
              </template>
            </b>
          </li>
        </ul>
      </template>
      <template v-else>
        <ul>
          <li>
            <b> No points changes in this list 👍 </b>
          </li>
        </ul>
      </template>

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
    border-radius: 8px;
    cursor: pointer;
    font-size: 24px;

    &:hover {
      background-color: rgba(0, 0, 0, 0.1);
    }
  }

  ul {
    list-style: none;
    margin-top: 64px;
    padding: 0;
  }

  li {
    color: rgb(0 89 46);

    &.up {
      color: rgb(89, 0, 0);
    }

    &.error {
      color: rgb(89, 76, 0);
    }
  }
}
</style>
