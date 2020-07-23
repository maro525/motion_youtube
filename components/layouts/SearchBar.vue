<template>
  <div>
    <section>
      <div v-if="showTitle" class="center">
        <div class="logo">
          <img src="~/assets/logo.svg" width="100" height="32" />
        </div>
        <div class="subtitle is-3 titlediv">
          <img src="~/assets/title.png" width="600" />
        </div>
      </div>
      <div class="searchlogo" @click="backToTop" v-bind:class="{ displaynone: showTitle  }">
        <img src="~/assets/logo.svg" width="100" height="32" />
      </div>
      <div v-if="showSearchBar" class="field is-grouped inputbar" v-bind:class="{ searchdiv: showTitle}">
        <div class="control expanded">
          <input class="input" type="test" v-model="searchTerm" placeholder="検索" />
        </div>
        <div class="control">
          <button class="button" @click="searchVideo">
            <span class="icon">
              <img src="~/assets/glass.svg" width="32" height="32" />
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
  props: {
    showTitle: true,
    showSearchBar: true 
  },
  data() {
    return {
      results: null,
      searchTerm: null
    };
  },
  methods: {
    searchVideo() {
      this.$emit("search-event", this.searchTerm);
    },
    backToTop() {
      this.$emit("back-to-top-event", this.showTitle);
    }
  }
};
</script>

<style>
section {
  margin: 20px;
  padding-bottom: 10px;
}
.expanded {
  flex-grow: 0.3;
}
.center {
  text-align: center;
}
.logo {
  margin: 230px auto 50px;
}
.title {
  font-size: 400;
}
.titlediv {
  margin: 50px auto;
}
.searchdiv {
  margin: 70px auto;
  justify-content: center !important;
}
.searchlogo {
  float: left;
  width: 90px;
  padding-top: 9px;
  margin-right: 25px;
}
.inputbar {
  margin-left: 30px;
}
.displaynone {
  display: none;
}
</style>