<template>
  <VueDatePicker
    v-model="model"
    class="ui-date-time-picker"
    auto-apply
    clearable
    :formats="datePickerFormats"
    :locale="datePickerLocale"
    :time-config="datePickerTimeConfig"
    :placeholder="placeholder"
    teleport
  />
</template>

<script setup>
import { computed } from 'vue'
import { zhCN as datePickerLocale } from 'date-fns/locale'
import { VueDatePicker } from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'

const props = defineProps({
  modelValue: {
    type: [Date, null],
    default: null
  },
  placeholder: {
    type: String,
    default: '选择时间'
  }
})

const emit = defineEmits(['update:modelValue'])

const datePickerFormats = {
  input: 'yyyy/MM/dd HH:mm:ss'
}

const datePickerTimeConfig = {
  enableTimePicker: true,
  enableSeconds: true,
  is24: true
}

const model = computed({
  get() {
    return props.modelValue
  },
  set(value) {
    emit('update:modelValue', value)
  }
})
</script>
