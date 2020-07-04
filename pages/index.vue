<template>
  <section class="container indexcontainer">
    <SearchBar
      :showTitle="showTitle"
      class="centering"
      @search-event="searchVideo"
      @back-to-top-event="backToTop"
    />
    <div v-if="bSearch">
      <VideoList :results="videos" :showTitle="showTitle" @selectVideo="selectVideo" />
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
        key: "AIzaSyD2vHwGGPmoCplXrgcG5zYRl-Dy9t5d2o4"
      },
      videoId: "",
      bSearch: true,
      showTitle: true
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
      this.bSearch = true;
      var self = this;
      axios
        .get("https://www.googleapis.com/youtube/v3/search", {
          params: this.params
        })
        .then(function(res) {
          console.log(res);
          self.videos = res.data.items;
        });
      console.log(self.videos);
    },
    selectVideo(id) {
      this.videoId = id;
      this.bSearch = false;
      this.showTitle = false;
    },
    backToTop(flag) {
      this.videos = [];
      this.showTitle = true;
      this.bSearch = true;
    }
  }
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

