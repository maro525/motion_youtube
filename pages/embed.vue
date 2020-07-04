<template>
  <section class="container indexcontainer">
    <HumanPose :videoId="videoId" />
  </section>
</template>

<script>
import HumanPose from "~/components/layouts/HumanPose.vue";

export default {
  data() {
    return {
      videoId: "wgZcoo-eQO0",
    };
  },
  components: {
    HumanPose
  },
};
</script>

<style>
.centering {
  margin: auto 10px;
}
.indexcontainer {
  margin-bottom: 140px;
}
</style>

