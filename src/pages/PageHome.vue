<template>
  <q-page padding>
    <div>
      <Agenda />
    </div>
  </q-page>
</template>
<script>
import Agenda from "src/components/Agenda.vue";
import { defineComponent } from "vue";

export default defineComponent({
  name: "PageHome",
  components: {
    Agenda,
  },
});
</script>
