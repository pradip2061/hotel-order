import { useEffect, useState } from "react";

/**
 * Custom hook to detect page reloads using Performance API
 * Returns true if the page was reloaded (not navigated from another page)
 */
export const useReloadDetection = () => {
  const [isReload, setIsReload] = useState(false);

  useEffect(() => {
    const checkReload = () => {
      try {
        const navEntries = performance.getEntriesByType("navigation");
        const navType = navEntries[0]?.type; // 'reload', 'navigate', 'back_forward', etc.

        if (navType === "reload") {
          console.log("🔄 User reloaded the page!");
          setIsReload(true);
        } else {
          setIsReload(false);
        }
      } catch (error) {
        console.error("Error detecting reload:", error);
        setIsReload(false);
      }
    };

    // Use window load event as specified
    window.addEventListener("load", checkReload);
    
    return () => {
      window.removeEventListener("load", checkReload);
    };
  }, []);

  return isReload;
};
