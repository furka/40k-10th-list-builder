<script setup>
const NEXT_EDITION_URL = "https://furka.github.io/40k-11th-list-builder/";

defineEmits(["dismiss"]);
</script>

<template>
  <div class="edition-notice">
    <span class="edition-notice__text">
      Warhammer 40K 11th Edition is here!
      <a
        class="edition-notice__link"
        :href="NEXT_EDITION_URL"
        target="_blank"
        rel="noopener"
      >
        Open the 11th edition list builder →
      </a>
    </span>
    <button
      class="edition-notice__close"
      title="Dismiss for this session"
      aria-label="Dismiss"
      @click="$emit('dismiss')"
    >
      ×
    </button>
  </div>
</template>

<style scoped lang="scss">
.edition-notice {
  align-items: center;
  background-color: #222;
  border-bottom: 1px solid #333;
  box-sizing: border-box;
  color: white;
  display: flex;
  font-size: 13px;
  gap: 12px;
  height: 32px;
  justify-content: center;
  padding: 0 40px 0 8px;
  position: relative;

  &__text {
    align-items: center;
    display: flex;
    gap: 6px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__link {
    color: #f59e0b;
    font-weight: 600;
    text-decoration: underline;

    &:hover {
      color: #fbbf24;
    }
  }

  &__close {
    background: transparent;
    border: none;
    color: #999;
    cursor: pointer;
    font-size: 22px;
    line-height: 1;
    padding: 0 8px;
    position: absolute;
    right: 4px;
    top: 50%;
    transform: translateY(-50%);

    &:hover {
      color: white;
    }
  }
}
</style>
