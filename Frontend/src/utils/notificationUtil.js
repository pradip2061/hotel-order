// utils/notificationUtils.js
export const requestNotificationPermission = () => {
  if (!("Notification" in window)) {
    console.log("This browser does not support notifications.");
    return;
  }

  if (Notification.permission === "default") {
    Notification.requestPermission().then((permission) => {
      console.log("Notification permission:", permission);
    });
  }
};

export const showNotification = (title, options = {}) => {
  if (Notification.permission === "granted") {
    new Notification(title, options);
  }
};
