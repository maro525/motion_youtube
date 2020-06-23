<template>
  <div>
    <section class="section">
      <div class="center">
        <div class="logo">
          <img src="~/assets/logo.svg" width="32" height="32" />
        </div>
        <div class="subtitle is-3 titlediv">
          <p class="has-text-weight-normal">動きを止めると再生される動画サイト。</p>
        </div>
      </div>
      <div class="field is-grouped is-grouped-centered searchdiv">
        <div class="control expanded">
          <input class="input" type="test" v-model="searchTerm" placeholder="検索" />
        </div>
        <div class="control">
          <button class="button" @click="searchVideo">
            <span class="icon">
              <i class="fas fa-search"></i>
            </span>
          </button>
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
      searchTerm: null
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
.expanded {
  flex-grow: 0.3;
}
.center {
  text-align: center;
}
.logo {
  margin: 100px auto 50px;
}
.title {
  font-size: 400;
}
.titlediv {
  margin: 50px auto;
}
.searchdiv {
  margin: 70px auto;
}
</style>