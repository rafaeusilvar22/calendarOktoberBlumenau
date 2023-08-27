<template>
  <q-page padding>
    <div>
      <AgendaTest />
      <Agenda />
    </div>
  </q-page>
</template>
<script>
import Agenda from "./Agenda.vue";
import AgendaTest from "src/components/AgendaTest.vue";
import { defineComponent } from "vue";

export default defineComponent({
  name: "PageHome",
  components: {
    Agenda,
    AgendaTest,
  },
});
</script>
