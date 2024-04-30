import React, { useState, useEffect } from "react";
import Head from "next/head";
import Image from "next/legacy/image";
import Pusher from 'pusher-js';

const ImageCarousel = ({ images, currentImageIndex }) => {

  return (
    <>
      <div className="relative w-11/12 mt-4 h-2/3">
        {images.map((image, index) => (
          <Image
            key={index}
            src={image.imageUrl}
            alt="image"
            layout="fill"
            objectFit="contain"
            className={`absolute drop-shadow-[0_3px_10px_rgb(0,0,0,0.2)] top-0 left-0 transition-opacity duration-500 ${
              index === currentImageIndex ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ))}
      </div>

      {images[currentImageIndex].title && (
        <div className='flex flex-col items-center justify-center w-64 p-4 text-center bg-white gap-y-2 min-h-24 drop-shadow-md'>
          <p className='font-bold text-black'>{images[currentImageIndex].title}</p>
          {images[currentImageIndex].date && (
            <p className='text-xs text-black'>{images[currentImageIndex].creator} ({images[currentImageIndex].date})</p>
          )}
          <p className='text-black text-[0.6rem] italic'>{images[currentImageIndex].partner}</p>
        </div>
      )}
    </>
  );
};

export default function GalleryPage() {
  const [images, setImages] = useState([]);
  const [palette, setPalette] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handleFavorite = async (image) => {
    try {
      const { creator = '', title = '', imageUrl = '' } = image;
      const response = await fetch('/api/favorite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ creator, title, imageUrl }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to mark as favorite');
      }
  
      const result = await response.json();
      console.log('Favorite saved:', result);
    } catch (error) {
      console.error('Error saving favorite:', error);
    }
  };

  const fetchPaletteData = async (id) => {
    try {
        const response = await fetch(`/api/fetchImages?id=${id}`);
        if (!response.ok) {
            throw new Error('Failed to fetch palette data');
        }
        const data = await response.json();
        setImages(JSON.parse(data.data));
        setPalette(data.hex_codes);
    } catch (error) {
        console.error('Error fetching palette data:', error);
    }
};

  useEffect(() => {
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER
    });
  
    const channel = pusher.subscribe('palette-channel');
    channel.bind('palette-update', function(data) {
      fetchPaletteData(data.id);
    });
  
    return () => {
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, []);


  useEffect(() => {
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER
    });

    const channel = pusher.subscribe('carousel');
    channel.bind('carousel-update', function({ action }) {
      if (action === 'next') {
        const nextIndex = currentImageIndex === images.length - 1 ? 0 : currentImageIndex + 1;
        setCurrentImageIndex(nextIndex);
      } 
      else if (action === 'prev') {
        const prevIndex = currentImageIndex === 0 ? images.length - 1 : currentImageIndex - 1;
        setCurrentImageIndex(prevIndex);
      } 
      else if (action === 'favorite') {
        let currentImage = images[currentImageIndex];
        handleFavorite(currentImage);
      }
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, [currentImageIndex]);


  return (
    <>
      <Head>
        <title>Palette Gallery</title>
        <meta name="description" content="Choose a palette from the gallery" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><text y='20' font-size='20'>🎨</text></svg>" />
      </Head>
      <div className={`flex flex-col items-center justify-between h-screen ${images.length > 0 ? 'bg-amber-50 bg-groove-paper' : 'bg-black'}`}>
        {images.length > 0 ? (
          <ImageCarousel images={images} currentImageIndex={currentImageIndex} />
        ) : (
          // <div className="relative w-full h-full">
          //     <div className="absolute h-32 bg-no-repeat bg-contain w-52 bg-cloud animate-clouds-move" style={{ top: '10%', left: '10%' }}></div>
          //     <div className="absolute h-32 bg-no-repeat bg-contain w-52 bg-cloud animate-clouds-move" style={{ top: '30%', left: '50%' }}></div>
          //     <div className="absolute h-32 bg-no-repeat bg-contain w-52 bg-cloud animate-clouds-move" style={{ top: '50%', left: '20%' }}></div>
          //     <div className="absolute h-32 bg-no-repeat bg-contain w-52 bg-cloud animate-clouds-move" style={{ top: '70%', left: '70%' }}></div>
          //     <div className="absolute h-32 bg-no-repeat bg-contain w-52 bg-cloud animate-clouds-move" style={{ top: '85%', left: '0%' }}></div>
          // </div>
          <div className="relative w-full h-full">
            <div className="absolute w-1/2 bg-no-repeat bg-contain h-1/2 bg-cloud animate-clouds-move" style={{ top: '40%', left: '10%' }}></div>
          </div>
        )}
      <div className="flex w-full h-16">
        {palette.split('-').map((color, index) => (
          <div key={index} style={{ backgroundColor: `#${color}`, flex: 1 }} />
        ))}
      </div>
    </div>
    </>

  );
}
