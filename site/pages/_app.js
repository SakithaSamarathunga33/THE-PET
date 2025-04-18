import "../styles/globals.css";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Footer from "../components/Footer";
import NProgress from "nprogress";
import "../public/nprogress.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Script from "next/script";

export default function App({ Component, pageProps }) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleStart = () => {
      setIsLoading(true);
      NProgress.start();
    };
    const handleComplete = () => {
      setIsLoading(false);
      NProgress.done();
    };

    router.events.on("routeChangeStart", handleStart);
    router.events.on("routeChangeComplete", handleComplete);
    router.events.on("routeChangeError", handleComplete);

    return () => {
      router.events.off("routeChangeStart", handleStart);
      router.events.off("routeChangeComplete", handleComplete);
      router.events.off("routeChangeError", handleComplete);
    };
  }, []);

  // Pages where Footer should be hidden
  const hideElementsPages = ["/dashboard"];

  return (
    <>
      {/* Google Analytics Script */}
      <Script strategy="lazyOnload" src={`https://www.googletagmanager.com/gtag/js?id=G-WYTYXQXVK6`} />
      <Script strategy="lazyOnload">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-WYTYXQXVK6', {
            page_path: window.location.pathname,
          });
        `}
      </Script>

      {/* Page Content */}
      <Component {...pageProps} />

      {/* Toast Notifications */}
      <ToastContainer />

      {/* Loading Indicator */}
      {isLoading && <div className="nprogress-custom-parent"><div className="nprogress-custom-bar"/></div>}

      {/* Conditionally Render Footer */}
      {!hideElementsPages.includes(router.pathname) && <Footer />}
    </>
  );
}
