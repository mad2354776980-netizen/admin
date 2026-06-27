<template>
  <div class="header-logo" :class="{ 'is-compact': compact, 'is-preview': preview }">
    <img
      class="header-logo-image"
      :src="compact ? logoAssets[variant].icon : logoAssets[variant].full"
      :alt="logoAssets[variant].alt"
    >
  </div>
</template>

<script setup>
import compassFull from '../assets/header-logos/compass.png'
import compassIcon from '../assets/header-logos/compass-icon.png'
import geomFull from '../assets/header-logos/geom.png'
import geomIcon from '../assets/header-logos/geom-icon.png'
import gridFull from '../assets/header-logos/grid.png'
import gridIcon from '../assets/header-logos/grid-icon.png'
import shieldFull from '../assets/header-logos/shield.png'
import shieldIcon from '../assets/header-logos/shield-icon.png'

defineProps({
  variant: {
    type: String,
    default: 'geom'
  },
  compact: {
    type: Boolean,
    default: false
  },
  preview: {
    type: Boolean,
    default: false
  }
})

const logoAssets = {
  geom: {
    full: geomFull,
    icon: geomIcon,
    alt: 'MAX Admin 几何 M 标识'
  },
  grid: {
    full: gridFull,
    icon: gridIcon,
    alt: 'MAX Admin 栅格 M 标识'
  },
  shield: {
    full: shieldFull,
    icon: shieldIcon,
    alt: 'MAX Admin 盾牌数据标识'
  },
  compass: {
    full: compassFull,
    icon: compassIcon,
    alt: 'MAX Admin 指南针标识'
  }
}
</script>

<style scoped>
.header-logo {
  min-width: 0;
  display: inline-flex;
  align-items: center;
}

.header-logo-image {
  display: block;
  width: auto;
  height: 30px;
  object-fit: contain;
}

.header-logo.is-preview .header-logo-image {
  height: 24px;
}

.header-logo.is-compact .header-logo-image {
  height: 28px;
}
</style>
