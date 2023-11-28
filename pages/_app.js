import "../styles/globals.css";
import Head from "next/head";

function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>Beat Odyssey</title>
        <meta
          name="description"
          content="Beat Odyssey is a virtual drum machine where you can have fun playing different electronic music genres."
        ></meta>

        {/* Open Graph / Facebook Meta Tags */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://beatodyssey.com/" />
        <meta property="og:title" content="Beat Odyssey" />
        <meta
          property="og:description"
          content="Beat Odyssey is a virtual drum machine where you can have fun playing different electronic music genres."
        />
        <meta
          property="og:image"
          content="https://www.yourwebsiteurl.com/path/to/your/image.jpg"
        />

        {/* You might also want to add Twitter specific tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta property="twitter:domain" content="beatodyssey.com" />
        <meta
          property="twitter:url"
          content="https://www.yourwebsiteurl.com/"
        />
        <meta name="twitter:title" content="Beat Odyssey" />
        <meta
          name="twitter:description"
          content="Beat Odyssey is a virtual drum machine where you can have fun playing different electronic music genres."
        />
        <meta
          name="twitter:image"
          content="https://www.yourwebsiteurl.com/path/to/your/twitter-image.jpg"
        />
      </Head>
      <Component {...pageProps} />
    </>
  );
}

export default App;
