import React, { useState, useEffect } from 'react';

const KeyPad = ({ onPinSuccess, onPinReset }) => {
  const [pin, setPin] = useState([]);
  const [dots, setDots] = useState([false, false, false, false]);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (pin.length === 4) {
      checkPin();
    }
  }, [pin]); // Dependency on pin state

  const handlePinInput = (input) => {
    if (pin.length < 4) {
      setErrorMessage('');
      setPin([...pin, input]);
      setDots(dots.map((_, index) => index < pin.length + 1));
    }
  };

  const handleDelete = () => {
    if (pin.length > 0) {
      const newPin = [...pin.slice(0, -1)];
      const newDots = [...dots];
      newDots[pin.length - 1] = false;
      setPin(newPin);
      setDots(newDots);
    }
  };

  const checkPin = () => {
    const correctPin = ['1', '1', '1', '1']; // Example correct pin
    if (pin.join('') === correctPin.join('')) {
      onPinSuccess();
    } else {
      setErrorMessage('Incorrect PIN. Try again.');
      setTimeout(() => {
        setErrorMessage('');
      }, 2000); // Clear error message after 2 seconds
      setPin([]);
      setDots([false, false, false, false]);
      onPinReset();
    }
  };

  return (
    <div className={`w-full h-full flex flex-col gap-y-4 justify-center items-center ${errorMessage ? 'animate-shake' : ''}`}>
      <div className="mb-4">
        {dots.map((dot, index) => (
          <span
            key={index}
            className={`inline-block w-4 h-4 rounded-full mx-1 ${
              dot ? 'bg-blue-500' : 'bg-gray-300'
            }`}
          />
        ))}
      </div>
      <div className="grid grid-cols-3 gap-4 justify-center">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((key) => (
          <button
            key={key}
            className="px-2 py-4 rounded-full bg-gray-200 text-xl font-bold text-gray-700 focus:outline-none focus:bg-gray-100 hover:bg-gray-100"
            onClick={() => handlePinInput(key)}
          >
            {key}
          </button>
        ))}
        <button
          key="delete"
          className="px-2 py-4 rounded-full bg-gray-200 text-lg text-gray-700 focus:outline-none focus:bg-gray-100 hover:bg-gray-100 mt-2 col-start-2"
          onClick={handleDelete}
        >
          delete
        </button>
      </div>
      {errorMessage && <p className="text-red-500">{errorMessage}</p>}
    </div>
  );
};

export default KeyPad;
