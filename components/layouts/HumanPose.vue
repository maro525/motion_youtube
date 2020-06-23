<template>
  <section class="content">
    <div id="loading" ref="loading" v-show="loading" :style="{ height: windowHeight + 'px' }">
      <div class="sk-spinner sk-spinner-pulse"></div>
    </div>
    <div id="main" v-show="!loading" ref="pose">
      <video
        id="video"
        ref="video"
        playsinline
        style="-moz-transform: scaleX(-1); -o-transform: scaleX(-1); -webkit-transform: scaleX(-1);transform: scaleX(-1); display: none;"
      ></video>
      <canvas id="outut" ref="output" />
      <youtube :video-id="videoId" width="480" height="320" id="youtube" ref="youtube" />
    </div>
  </section>
</template>

<script>
import * as posenet from "@tensorflow-models/posenet";
import * as bodyPix from "@tensorflow-models/body-pix";
import Vue from "vue";
import VueYoutube from "vue-youtube";

Vue.use(VueYoutube);

export default {
  name: "HumanPose",
  data() {
    return {
      net: {},
      video: {},
      cameras: [],
      cameraIndex: 0,
      changingCamera: false,
      loading: true,
      windowHeight: 0,
      framenum: 0,
      lastPosition: []
    };
  },
  props: {
    videoId: null
  },
  computed: {
    player() {
      return this.$refs.youtube.player;
    }
  },
  methods: {
    async changeCamera() {
      if (this.changingCamera) {
        return;
      }

      this.changingCamera = true;
      this.cameraIndex++;
      if (this.cameraIndex >= this.cameras.length) {
        this.cameraIndex = 0;
      }
      await this.loadVideo();
    },
    async loadNet() {
      this.net = await bodyPix.load();
    },
    async loadVideo() {
      this.video = await this.setupCamera();
      this.video.play();
    },
    async setupCamera() {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error(
          "Browser API navigator.mediaDevices.getUserMedia not available"
        );
      }

      const video = this.$refs.video;
      video.width = this.videoWidth;
      video.height = this.videoHeight;
      this.stopExistingVideoCapture();

      // const mobile = this.isAndroid() || this.isiOS();
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          deviceId: this.cameras[this.cameraIndex].deviceId,
          width: this.videoWidth,
          height: this.videoHeight
        }
      });
      window.console.log(
        "using camera: " + this.cameras[this.cameraIndex].label
      );
      video.srcObject = stream;

      return new Promise(resolve => {
        video.onloadedmetadata = () => {
          // let height = video.videoHeight;
          // let width = video.videoWidth;
          // video.width = width;
          // video.height = height;
          resolve(video);
        };
      });
    },
    async getVideoInputs() {
      if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
        window.console.log("enumerateDevices() not supported.");
        return [];
      }

      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(
        device => device.kind === "videoinput"
      );
      return videoDevices;
    },
    stopExistingVideoCapture() {
      if (this.video && this.video.srcObject) {
        this.video.srcObject.getTracks().forEach(track => {
          track.stop();
        });
        this.video.srcObject = null;
      }
    },
    isAndroid() {
      return /Android/i.test(navigator.userAgent);
    },
    isiOS() {
      return /iPhone|iPad|iPod/i.test(navigator.userAgent);
    },
    isMobile() {
      return this.isAndroid() || this.isiOS();
    },
    detctPose() {
      const canvas = this.$refs.output;
      canvas.width = this.videoWidth;
      canvas.height = this.videoHeight;

      const self = this;
      async function updateFrame() {
        // try {
        const segmentation = await self.estimateSegmentation();
        self.drawMask(segmentation, canvas, self.video, {
          r: 0,
          g: 0,
          b: 0,
          a: 0
        });
        self.drawPose(segmentation, canvas);
        // } catch (e) {
        //   window.console.log("Retrying...");
        // } finally {
        requestAnimationFrame(updateFrame);
        // }
      }
      updateFrame();
    },
    drawMask(segmentation, canvas, video, color) {
      const mask = bodyPix.toMask(
        segmentation,
        color,
        { r: 0, g: 0, b: 0, a: 0 },
        false
      );
      bodyPix.drawMask(canvas, video, mask, 0.3, 0, true);
    },
    drawPose(segmentation, canvas) {
      const ctx = canvas.getContext("2d");
      const scale = 1;
      const size = 5;
      const color = "aqua";
      const minScore = 0.1;

      segmentation.forEach(personSegmentation => {
        let pose = personSegmentation.pose;
        pose = bodyPix.flipPoseHorizontal(pose, personSegmentation.width);
        this.judgeMovement(pose.keypoints, minScore);
        for (let i = 0; i < pose.keypoints.length; i++) {
          const keypoint = pose.keypoints[i];
          if (keypoint.score < minScore) {
            continue;
          }

          const { y, x } = keypoint.position;
          this.drawPoint(ctx, y * scale, x * scale, size, color);
        }

        const adjacentKeyPoints = posenet.getAdjacentKeyPoints(
          pose.keypoints,
          minScore
        );
        adjacentKeyPoints.forEach(keypoints => {
          this.drawSegment(
            this.toTuple(keypoints[0].position),
            this.toTuple(keypoints[1].position),
            scale,
            size / 2,
            color,
            ctx
          );
        });
      });
    },
    drawPoint(ctx, y, x, r, color) {
      ctx.beginPath();
      ctx.arc(x, y, r, 0, 2 * Math.PI);
      ctx.fillStyle = color;
      ctx.fill();
    },
    drawSegment([ay, ax], [by, bx], scale, size, color, ctx) {
      ctx.beginPath();
      ctx.moveTo(ax * scale, ay * scale);
      ctx.lineTo(bx * scale, by * scale);
      ctx.lineWidth = 5;
      ctx.strokeStyle = color;
      ctx.stroke();
    },
    toTuple({ y, x }) {
      return [y, x];
    },
    async estimateSegmentation() {
      return await this.net.segmentMultiPerson(this.video, {
        internalResolution: "medium",
        segmentationThreshold: 0.7,
        maxDetections: 5,
        scoreThreshold: 0.2,
        nmsRadius: 20,
        numKeypointForMatching: 17,
        refineSteps: 10
      });
    },
    judgeMovement(keypoints, minScore) {
      this.framenum += 1;
      if (this.framenum > 20) this.framenum = 0;
      if (this.framenum % 20 != 0) return;
      const keypoint = keypoints[10];
      if (keypoint.score > minScore) {
        const kx = keypoint.position.x;
        const ky = keypoint.position.y;
        if (this.lastPosition.length != 0) {
          const dx = kx - this.lastPosition[0];
          const dy = ky - this.lastPosition[1];
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > 5) this.playYoutubeVideo(false);
          else this.playYoutubeVideo(true);
        }
        this.lastPosition[0] = kx;
        this.lastPosition[1] = ky;
      }
    },
    playYoutubeVideo(bPlay) {
      if (bPlay) this.player.playVideo();
      else this.player.pauseVideo();
    }
  },
  async mounted() {
    this.windowHeight = window.innerHeight;
    this.videoHeight = 320;
    this.videoWidth = 400;
    this.$refs.youtube.player.width = 400;
    this.$refs.youtube.player.height = 300;
    this.loading = true;
    console.log(this.videoId);

    await this.loadNet();
    this.cameras = await this.getVideoInputs();
    await this.loadVideo();

    this.loading = false;
    this.detctPose();
  }
};
</script>

<style>
.content {
  width: 100%;
  overflow: hidden;
}

#main {
  width: 100%;
  margin: 10px;
}

canvas {
  margin: 0 30px;
}

iframe {
  max-width: 650px;
}

#menu {
  position: absolute;
  text-align: center;
  bottom: 3em;
  left: 0;
  right: 0;
}
#menu ul {
  border-radius: 2px;
  background-color: rgba(255, 255, 255, 0.3);
}
#menu li {
  cursor: pointer;
  user-select: none;
}
#menu .material-icons {
  font-size: 30px;
}
/*
  *  The following loading spinner CSS is from SpinKit project
  *  https://github.com/tobiasahlin/SpinKit
  */
.sk-spinner-pulse {
  width: 60px;
  height: 60px;
  margin: 40px auto;
  float: left;
  background-color: #333;
  border-radius: 100%;
  -webkit-animation: sk-pulseScaleOut 1s infinite ease-in-out;
  animation: sk-pulseScaleOut 1s infinite ease-in-out;
}
@-webkit-keyframes sk-pulseScaleOut {
  0% {
    -webkit-transform: scale(0);
    transform: scale(0);
  }
  100% {
    -webkit-transform: scale(1);
    transform: scale(1);
    opacity: 0;
  }
}
@keyframes sk-pulseScaleOut {
  0% {
    -webkit-transform: scale(0);
    transform: scale(0);
  }
  100% {
    -webkit-transform: scale(1);
    transform: scale(1);
    opacity: 0;
  }
}
</style>