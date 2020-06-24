<template>
  <div v-bind:class="{listcenter: showTitle}">
    <table cellspacing="0" cellpadding="5" v-show="results">
      <tr v-for="movie in results" v-bind:key="movie.id.videoId">
        <!-- Video -->
        <td class="v1" valign="top">
          <img v-bind:src="movie.snippet.thumbnails.medium.url" />
        </td>
        <!-- titleとdescription -->
        <td class="v2" align="left" valign="top" @click="onVideoSelect(movie.id.videoId)">
          <font size="1" color="#010101">
            <b>{{ movie.snippet.title }}</b>
          </font>
          <br />
          <div class="videodesc">{{ movie.snippet.description}}</div>
        </td>
      </tr>
    </table>
  </div>
</template>

<script>
export default {
  name: "VideoList",
  props: {
    results: null,
    showTitle: true
  },
  methods: {
    onVideoSelect(id) {
      this.$emit("selectVideo", id);
    }
  }
};
</script>

<style>
.tile.is-child:hover {
  cursor: pointer;
}
table {
  margin: auto;
  width: 60%;
}
td {
  margin: 10px 20px;
  padding: 15px 10px 15px 15px;
}
.listcenter {
  text-align: center;
}
.v1 {
  width: 35%;
  padding-left: 50px;
}
.videodesc {
  font-size: 10px;
}
</style>
