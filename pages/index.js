import Head from "next/head";
import KeyPad from "./keypad";
import ChoosePalette from "./choosePalette";
import { useState } from "react";

const Home = () => {
  const [validated, setValidated] = useState(false);

  const handlePinSuccess = () => {
    setValidated(true);
  };

  const handlePinReset = () => {
    setValidated(false);
  };

  return (
    <>
      <Head>
        <title>Palette Gallery</title>
        <meta name="description" content="Choose a palette from the gallery" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><text y='20' font-size='20'>🎨</text></svg>" />
      </Head>
      <main className="flex flex-col h-screen bg-amber-50 bg-fuzz">
        {
          validated 
          ? <ChoosePalette /> 
          : <KeyPad onPinSuccess={handlePinSuccess} onPinReset={handlePinReset} />
        }
      </main>
    </>
  );
};

export default Home;
