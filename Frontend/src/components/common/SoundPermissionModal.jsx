import { useState, useEffect } from "react";

export default function SoundPermissionModal({ onSoundAllowed }) {
  const [showModal, setShowModal] = useState(true);



  const handleAllow = () => {
    // Unlock audio
    const audio = new Audio("/notification.mp3"); // path to your sound
    audio.play().then(() => {
      audio.pause();
      audio.currentTime = 0;
    });

    // Save flag in sessionStorage
    sessionStorage.setItem("soundAllowed", "true");

    // Call parent callback if needed
    if (onSoundAllowed) onSoundAllowed();

    // Close modal
    setShowModal(false);
  };

  const handleDeny = () => {
    // Optionally close modal without saving flag
    setShowModal(false);
  };

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full text-center space-y-4">
        <h2 className="text-lg font-semibold">Enable Sound Notifications</h2>
        <p className="text-sm text-gray-600">
          To hear notifications when new orders arrive, please allow sound.
        </p>
        <div className="flex justify-center gap-4 mt-4">
          <button
            onClick={handleAllow}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
          >
            OK
          </button>
          <button
            onClick={handleDeny}
            className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400 transition"
          >
            Deny
          </button>
        </div>
      </div>
    </div>
  );
}
