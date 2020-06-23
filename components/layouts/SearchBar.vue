<template>
  <div>
    <section class="section">
      <div class="field">
        <div class="control has-icon-left">
          <input class="input is-success" type="test" v-model="searchTerm" placeholder="検索" />
          <button @click="searchVideo">検索</button>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
export default {
  name: "SearchBar",
  data() {
    return {
      results: null,
      searchTerm: "keyword"
    };
  },
  methods: {
    searchVideo() {
      this.$emit("search-event", this.searchTerm);
    }
  }
};
</script>

<style>
</style>