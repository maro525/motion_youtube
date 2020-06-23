<template>
  <section class="container">
    <SearchBar @search-event="searchVideo" />
    <VideoList :results="videos" />
  </section>
</template>

<script>
import SearchBar from "~/components/layouts/SearchBar.vue";
import VideoList from "~/components/layouts/VideoList.vue";
import axios from "axios";

export default {
  data() {
    return {
      videos: [],
      params: {
        q: "",
        part: "snippet",
        type: "video",
        maxResults: "5",
        key: "AIzaSyB6ZuYvQ1x6ZQqcKL3ctnS9EE7IvMmyivI"
      }
    };
  },
  components: {
    SearchBar,
    VideoList
  },
  methods: {
    searchVideo(searchTerm) {
      this.params.q = searchTerm;
      var self = this;
      axios
        .get("https://www.googleapis.com/youtube/v3/search", {
          params: this.params
        })
        .then(function(res) {
          self.videos = res.data.items;
        });
    }
  }
};
</script>

<style>
</style>

