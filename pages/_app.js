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
      </Head>
      <Component {...pageProps} />
    </>
  );
}

export default App;
