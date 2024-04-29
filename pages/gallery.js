import React, { useState, useEffect } from "react";
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
        <div className='flex flex-col items-center text-center gap-y-2 justify-center w-64 min-h-24 p-4 bg-white drop-shadow-md'>
          <p className='font-bold text-black'>{images[currentImageIndex].title}</p>
          {images[currentImageIndex].date && (
            <p className='text-black text-xs'>{images[currentImageIndex].creator} ({images[currentImageIndex].date})</p>
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
    <div className="flex flex-col justify-between items-center h-screen bg-amber-50 bg-groove-paper">
        {images.length > 0 ? (
          <ImageCarousel images={images} currentImageIndex={currentImageIndex} />
        ) : (
          <p>Loading images...</p>
        )}
      <div className="w-full h-16 flex">
        {palette.split('-').map((color, index) => (
          <div key={index} style={{ backgroundColor: `#${color}`, flex: 1 }} />
        ))}
      </div>
    </div>
  );
}
