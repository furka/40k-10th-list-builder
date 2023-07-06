<script setup>
import RiskIcon from "../assets/risk-icon.svg";
import ModalWithButton from "./ModalWithButton.vue";
import { MFM_VERSION } from "../utils/data-reader";
import { computed } from "vue";

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

      if (points < 0) {
        unit.error = true;
      } else {
        unit.points = points;
      }
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
    return option.points;
  }

  return -1;
}

const changes = computed(() => {
  return props.appData.currentList.units
    .map((u) => {
      const points = getPoints(u);

      return {
        name: u.name,
        old: u.points,
        new: points,
        models: u.models,
        optionName: u.optionName,
      };
    })
    .filter((i) => i.new !== i.old);
});
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
      <ul>
        <li
          v-for="(change, index) in changes"
          :class="{ error: change.new < 0 }"
        >
          <template v-if="change.optionName">
            {{ change.optionName }} —
          </template>
          <template v-else> ({{ change.models }})</template>
          {{ change.name }}:
          <b>
            <template v-if="change.new < 0"> Option no longer valid </template>
            <template v-else>
              {{ change.old }} pts -> {{ change.new }} pts
            </template>
          </b>
        </li>
      </ul>
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

    &.error {
      color: rgb(89, 0, 0);
    }
  }
}
</style>
