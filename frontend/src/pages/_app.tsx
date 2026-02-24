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
        const head = document.getElementsByTagName('head')[0];
        const existing = document.querySelector('script[src="https://tracker.metricool.com/resources/be.js"]');
        if (existing) {
          // If script already present, call callback asynchronously
          setTimeout(callback, 0);
          return;
        }
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = 'https://tracker.metricool.com/resources/be.js';
        script.onload = callback;
        script.onerror = () => console.error('Metricool script failed to load');
        head.appendChild(script);
      }
      const HASH = '8cc6a4ba2e515faa79e7a2f8032a1d47';
      loadScript(function () {
        // Debug logs to help verify script and hash
        // @ts-ignore
        console.log('Metricool: load callback', { beTracker: (window as any).beTracker });
        // @ts-ignore
        if ((window as any).beTracker && (window as any).beTracker.t) {
          // @ts-ignore
          (window as any).beTracker.t({ hash: HASH });
          console.log('Metricool: tracker invoked with hash', HASH);
        } else {
          console.warn('Metricool: beTracker object not available after load');
        }

        // Inject a meta tag into <head> so you can easily verify the hash in Elements
        let meta = document.querySelector('meta[name="metricool-hash"]') as HTMLMetaElement | null;
        if (!meta) {
          meta = document.createElement('meta');
          meta.name = 'metricool-hash';
          document.getElementsByTagName('head')[0].appendChild(meta);
        }
        meta.content = HASH;
      });
    }, []);

  return <Component {...pageProps} />
}
