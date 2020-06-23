<template>
  <table cellspacing="0" cellpadding="5" v-show="results">
    <tr v-for="movie in results" v-bind:key="movie.id.videoId">
      <!-- Video -->
      <td valign="top" width="300">
        <img width="300" height="200" v-bind:src="movie.snippet.thumbnails.medium.url" />
      </td>
      <!-- titleとdescription -->
      <td align="left" valign="top" width="700">
        <font size="5" color="#c71585">
          <b>{{ movie.snippet.title }}</b>
        </font>
        <br />
        {{ movie.snippet.description}}
      </td>
    </tr>
  </table>
</template>

<script>
export default {
  name: "VideoList",
  props: {
    results: null
  }
};
</script>

<style>
.tile.is-child:hover {
  cursor: pointer;
}
</style>
