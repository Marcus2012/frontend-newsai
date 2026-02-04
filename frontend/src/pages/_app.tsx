import type { AppProps } from 'next/app'
import '../styles/globals.css'
import React, { useEffect } from 'react'

export default function MyApp({ Component, pageProps }: AppProps) {
  useEffect(() => {
    const setVh = () => {
      // Set --vh to 1% of the viewport height to avoid 100vh issues on mobile browsers
      const vh = window.innerHeight * 0.01
      document.documentElement.style.setProperty('--vh', `${vh}px`)
    }
    setVh()
    window.addEventListener('resize', setVh)
    window.addEventListener('orientationchange', setVh)
    return () => {
      window.removeEventListener('resize', setVh)
      window.removeEventListener('orientationchange', setVh)
    }
  }, [])

    useEffect(() => {
      function loadScript(callback: () => void) {
        const head = document.getElementsByTagName("head")[0];
        const script = document.createElement("script");
        script.type = "text/javascript";
        script.src = "https://tracker.metricool.com/resources/be.js";
        script.onload = callback;
        head.appendChild(script);
      }
      loadScript(function () {
        // @ts-ignore
        if (window.beTracker && window.beTracker.t) {
          // @ts-ignore
          window.beTracker.t({ hash: "8cc6a4ba2e515faa79e7a2f8032a1d47" });
        }
      });
    }, []);

  return <Component {...pageProps} />
}
