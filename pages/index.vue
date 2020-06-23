<template>
  <section class="container">
    <SearchBar class="centering" @search-event="searchVideo" />
    <div class="column is-three-quarters" v-if="bSearch">
      <VideoList :results="videos" @selectVideo="selectVideo" />
    </div>
    <div v-else>
      <HumanPose :videoId="videoId" />
    </div>
  </section>
</template>

<script>
import SearchBar from "~/components/layouts/SearchBar.vue";
import VideoList from "~/components/layouts/VideoList.vue";
import HumanPose from "~/components/layouts/HumanPose.vue";
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
      },
      videoId: "",
      bSearch: true
    };
  },
  components: {
    SearchBar,
    VideoList,
    HumanPose
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
    },
    selectVideo(id) {
      this.videoId = id;
      console.log(this.videoId);
      this.bSearch = false;
    }
  }
};
</script>

<style>
.centering {
  margin: auto 10px;
}
</style>

