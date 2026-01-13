let unlocked = false;
export const unlockAudio = () => {
  if (unlocked) return;

  const audio = new Audio("/notification.wav");
  audio.play()
    .then(() => {
      audio.pause();
      audio.currentTime = 0;
      unlocked = true;
      console.log("🔊 Audio unlocked");
    })
    .catch(() => console.log("❌ Audio blocked"));
};
