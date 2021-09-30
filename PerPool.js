/*
Search for

URL
USER AGENT
FCP
TTFB
DOM LOAD
WINDOW LOAD
START TIME
---
FILES -> 
IS CACHED CHECK (by checking performance.timing transferSize, if transferSize = 0 ? 1(cached) : 0)
CHECK TYPES, CATEGORIZE TYPE
---
options:
monitor - grafik arayüzü sağ üst
live - listener live datas
done - callback
*/

class PerPool {
  constructor(params = {}) {
    this.params = {
      monitor: false,
      live: false,
      start: () => {},
      done: () => {},
      ...params,
    };

    this.pool = {
      url: null,
      userAgent: null,
      fcp: null,
      ttfb: null,
      domLoad: null,
      windowLoad: null,
      startTime: null,
      files: [],
    };
    this.init();
  }

  convertMicroToSeconds(ms) {
    return ms / 1000;
  }

  findUrl() {
    this.pool.url = window.location.href;
  }

  findUserAgent() {
    this.pool.userAgent = navigator.userAgent;
  }

  fetchFCP() {
    this.pool.fcp = this.convertMicroToSeconds(
      window.performance
        .getEntriesByType("paint")
        .find((time) => time.name == "first-contentful-paint").startTime
    );
  }

  calculateTTFB() {
    this.pool.ttfb = this.convertMicroToSeconds(
      window.performance.timing.responseStart -
        window.performance.timing.requestStart
    );
  }

  calculateDomLoad() {
    this.pool.domLoad = this.convertMicroToSeconds(
      window.performance.timing.domContentLoadedEventEnd -
        window.performance.timing.domContentLoadedEventStart
    );
  }

  calculateWindowLoad() {
    this.pool.windowLoad = this.convertMicroToSeconds(
      Date.now() - window.performance.timing.navigationStart
    );
  }

  fetchStartTime() {
    this.pool.startTime = new Date(window.performance.timing.navigationStart);
  }

  fetchFileDetails() {
    window.performance.getEntriesByType("resource").map((file) => {
      this.pool.files.push({
        name: file.name,
        fileType: file.initiatorType,
        loadTime: this.convertMicroToSeconds(
          file.responseEnd - file.fetchStart
        ),
        isCached:
          this.convertMicroToSeconds(file.responseEnd - file.fetchStart) < 0.4,
      });
    });
  }

  init() {
    this.params.start(true);
    this.findUrl();
    this.findUserAgent();
    this.fetchFCP();
    this.calculateTTFB();
    this.calculateDomLoad();
    this.calculateWindowLoad();
    this.fetchStartTime();
    this.fetchFileDetails();
    this.params.done(this.pool);
  }
}

window.addEventListener("load", () => {
  let a = new PerPool({
    start: () => {
      console.log("Başladı");
    },
    done: (result) => {
      console.log("Sonuç : ", result);
    },
  });
});
