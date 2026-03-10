import Document, { Head, Html, Main, NextScript } from "next/document";

class MyDocument extends Document {
  render() {
    return (
      <Html lang="es">
        <Head>
          <link rel="icon" type="image/png" href="/Logo_aeef.png" />
          <link rel="icon" href="/Logo_aeef.png" />
          <link rel="apple-touch-icon" href="/Logo_aeef.png" />
          <link rel="manifest" href="/manifest.webmanifest" />
          <script
            dangerouslySetInnerHTML={{
              __html:
                "(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':" +
                "new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0]," +
                "j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=" +
                "'https://www.googletagmanager.com/gtm.js?id='+i+dl;" +
                "f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','GTM-KT9K2HGS');",
            }}
          />
          <script
            async
            src="https://www.googletagmanager.com/gtag/js?id=G-JL7XMQJYYN"
          />
          <script
            dangerouslySetInnerHTML={{
              __html:
                "window.dataLayer = window.dataLayer || [];" +
                "function gtag(){dataLayer.push(arguments);}" +
                "gtag('js', new Date());" +
                "gtag('config', 'G-JL7XMQJYYN');",
            }}
          />
        </Head>
        <body>
          <noscript>
            <iframe
              src="https://www.googletagmanager.com/ns.html?id=GTM-KT9K2HGS"
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
            />
          </noscript>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
