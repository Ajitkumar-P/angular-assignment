/// <reference lib="webworker" />

addEventListener("message", ({ data }) => {
  const startTime = new Date();

  setInterval(() => {
    const currentTime = new Date();
    const elapsed = currentTime.getTime() - startTime.getTime();
    const minutes = Math.floor(elapsed / 60000);
    const seconds = Math.floor((elapsed % 60000) / 1000);

    if (minutes > 0) {
      postMessage(
        `${minutes} minute${minutes > 1 ? "s" : ""} and ${seconds} second${seconds > 1 ? "s" : ""}`
      );
    } else {
      postMessage(`${seconds} second${seconds > 1 ? "s" : ""}`);
    }
  }, 1000);
});
