<template>
  <section class="container">
    <div id="loading" ref="loading" v-show="loading" :style="{ height: windowHeight + 'px' }">
      <div class="sk-spinner sk-spinner-pulse"></div>
    </div>
    <div id="main" :style="{ height: windowHeight + 'px' }" v-show="!loading">
      <video
        id="video"
        ref="video"
        playsinline
        style="-moz-transform: scaleX(-1); -o-transform: scaleX(-1); -webkit-transform: scaleX(-1);transform: scaleX(-1); display: none;"
      ></video>
      <canvas id="outut" ref="output" />
      <div id="menu">
        <ul>
          <li v-on:click="changeCamera">
            <i class="material-icons">flip_camera_ios</i>
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>

<script>
import * as posenet from "@tensorflow-models/posenet";
import { flipPoseHorizontal } from "@tensorflow-models/posenet/dist/util";

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
      windowHeight: 0
    };
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
      this.net = await posenet.load({
        architecture: "ResNet50",
        outputStride: 32,
        inputResolution: {
          width: this.videoWidth / 4,
          height: this.videoHeight / 4
        },
        quantBytes: 2
      });
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
      this.stopExistingVideoCapture();

      // const mobile = this.isAndroid() || this.isiOS();
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          deviceId: this.cameras[this.cameraIndex].deviceId
        }
      });
      window.console.log(
        "using camera: " + this.cameras[this.cameraIndex].label
      );
      video.srcObject = stream;

      return new Promise(resolve => {
        video.onloadedmetadata = () => {
          let width = video.videoWidth;
          let height = video.videoHeight;
          video.width = width;
          video.height = height;
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

      const self = this;
      async function updateFrame() {
        let poses = [];
        // try {
        const pose = await self.net.estimatePoses(self.video, {
          flipHorizontal: true,
          decodingMethod: "single-person"
        });
        poses = poses.concat(pose);
        self.drawPose(poses, canvas);
        // } catch (e) {
        //   window.console.log("Retrying...");
        // } finally {
        requestAnimationFrame(updateFrame);
        // }
      }
      updateFrame();
    },
    drawPose(poses, canvas) {
      const ctx = canvas.getContext("2d");
      const scale = 1;
      const size = 3;
      const color = "aqua";
      const minPoseConfidence = 0.1;
      const minPartConfidence = 0.5;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // draw video
      ctx.save();
      ctx.scale(-1, 1);
      ctx.translate(canvas.width, 0);
      ctx.drawImage(this.video, 0, 0, canvas.width, canvas.height);
      ctx.restore();

      poses.forEach(({ score, keypoints }) => {
        if (score >= minPoseConfidence) {
          this.drawKeypoints(
            keypoints,
            minPartConfidence,
            ctx,
            scale,
            size,
            color
          );
        }
      });
    },
    drawKeypoints(keypoints, minConfidence, ctx, scale, size, color) {
      for (let i = 0; i < keypoints.length; i++) {
        const keypoint = keypoints[i];
        if (keypoint.score < minConfidence) {
          continue;
        }

        const { y, x } = keypoint.position;
        this.drawPoint(ctx, y * scale, x * scale, size, color);
      }
    },
    drawPoint(ctx, y, x, r, color) {
      ctx.beginPath();
      ctx.arc(x, y, r, 0, 2 * Math.PI);
      ctx.fillStyle = color;
      ctx.fill();
    }
  },
  async mounted() {
    this.windowHeight = window.innerHeight;
    this.loading = true;

    await this.loadNet();
    this.cameras = await this.getVideoInputs();
    await this.loadVideo();

    this.loading = false;
    this.detctPose();
  }
};
</script>

<style>
.container {
  width: 100%;
  overflow: hidden;
}
#loading,
#main {
  display: flex;
  justify-content: center;
  align-items: center;
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