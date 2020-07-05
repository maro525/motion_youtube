<template>
  <section class="container indexcontainer">
    <SearchBar
      :showTitle="showTitle"
      class="centering"
    />
    <HumanPose :videoId="videoId" />
  </section>
</template>

<script>
import HumanPose from "~/components/layouts/HumanPose.vue";
import SearchBar from "~/components/layouts/SearchBar.vue";

export default {
  data() {
    return {
      videoId: "wgZcoo-eQO0",
      showTitle: false
    };
  },
  components: {
    HumanPose,
    SearchBar
  },
};
</script>

<style>
.centering {
  margin: auto 10px;
}
.indexcontainer {
  margin-bottom: 100px;
}
</style>

