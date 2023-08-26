<template>
  <q-page padding>
    <div>
      <IndexPage />
    </div>
  </q-page>
</template>
<script>
import IndexPage from "./IndexPage.vue";
import { defineComponent } from "vue";

export default defineComponent({
  name: "PageHome",
  components: {
    IndexPage,
  },
});
</script>
