(function () {
  var hlsLoaderPromise = null;

  function loadHlsLibrary() {
    if (window.Hls) {
      return Promise.resolve(window.Hls);
    }

    if (hlsLoaderPromise) {
      return hlsLoaderPromise;
    }

    hlsLoaderPromise = new Promise(function (resolve, reject) {
      var script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.20/dist/hls.min.js';
      script.async = true;
      script.onload = function () {
        resolve(window.Hls);
      };
      script.onerror = function () {
        reject(new Error('播放组件加载失败'));
      };
      document.head.appendChild(script);
    });

    return hlsLoaderPromise;
  }

  function playWithNative(video, source) {
    video.src = source;
    return video.play();
  }

  function playWithHls(video, source) {
    return loadHlsLibrary().then(function (Hls) {
      if (Hls && Hls.isSupported()) {
        if (video._hlsInstance) {
          video._hlsInstance.destroy();
        }

        var hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true
        });

        video._hlsInstance = hls;
        hls.loadSource(source);
        hls.attachMedia(video);

        return new Promise(function (resolve, reject) {
          hls.on(Hls.Events.MANIFEST_PARSED, function () {
            video.play().then(resolve).catch(reject);
          });
          hls.on(Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              reject(new Error('播放初始化失败'));
            }
          });
        });
      }

      return playWithNative(video, source);
    });
  }

  function setupPlayers() {
    var buttons = Array.prototype.slice.call(document.querySelectorAll('[data-player-trigger]'));

    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        var source = button.getAttribute('data-video-src');
        var videoId = button.getAttribute('data-video-id');
        var video = document.getElementById(videoId);
        var box = button.closest('[data-player]');
        var status = box ? box.querySelector('[data-player-status]') : null;

        if (!source || !video) {
          if (status) {
            status.textContent = '播放源缺失，无法播放。';
          }
          return;
        }

        button.disabled = true;

        if (status) {
          status.textContent = '正在加载播放源…';
        }

        var nativeHls = video.canPlayType('application/vnd.apple.mpegurl');
        var playTask = nativeHls ? playWithNative(video, source) : playWithHls(video, source);

        playTask.then(function () {
          if (box) {
            box.classList.add('is-playing');
          }
          button.disabled = false;
        }).catch(function (error) {
          button.disabled = false;
          if (status) {
            status.textContent = error && error.message ? error.message : '播放初始化失败，请刷新重试。';
          }
        });
      });
    });
  }

  document.addEventListener('DOMContentLoaded', setupPlayers);
})();
