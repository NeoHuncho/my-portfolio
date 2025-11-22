import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { FaLinkedin } from 'react-icons/fa';
import { useMediaQuery } from '../hooks/useMediaQuery';

export default function Header() {
  const [isLoaded, setIsLoaded] = useState(false);
  const isSmall = useMediaQuery('(max-width: 850px)');
  const [menuOpen, setMenuOpen] = useState(false);
  const [imagesLoaded, setImagesLoaded] = useState(0);
  const totalImages = 2; // Email and Github are images, LinkedIn is an icon

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  if (!isLoaded) {
    return null;
  }

  const handleImageLoad = () => {
    setImagesLoaded((prev) => prev + 1);
  };

  const allLoaded = imagesLoaded >= totalImages;

  return (
    <div className="fixed z-10 w-[99%] px-[1%] py-[0.5%] grid grid-cols-12 items-center">
        <div className="col-span-4">
          <Link passHref href="/">
            <h2
              className={`font-medium text-white cursor-pointer text-2xl ${isSmall ? 'pt-1' : ''}`}
              style={{ color: 'white' }}
            >
              W.G
            </h2>
          </Link>
        </div>
        <div className={isSmall ? 'col-span-6' : 'col-span-4'}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: allLoaded ? 1 : 0 }}
            transition={{ duration: 0.5 }}
            className={`flex gap-4 items-center ${isSmall ? 'pt-2 justify-start' : 'justify-center'}`}
          >
            <a
              className="cursor-pointer"
              href="https://github.com/NeoHuncho"
              target="_blank"
              rel="noreferrer"
            >
              <Image
                src="/assets/socials/github_white.svg"
                alt="Github link"
                height={25}
                width={25}
                onLoadingComplete={handleImageLoad}
              />
            </a>

            <a
              className="cursor-pointer"
              href="https://www.linkedin.com/in/william-guinaudie/" 
              target="_blank"
              rel="noreferrer"
            >
               <FaLinkedin size={25} color="white" />
            </a>

            <a className="cursor-pointer" href="mailto:william.guinaudie@gmail.com">
              <Image 
                height={25} 
                width={25} 
                src="/assets/socials/email.png" 
                alt="Email" 
                onLoadingComplete={handleImageLoad}
              />
            </a>
          </motion.div>
        </div>
        {isSmall && (
          <div className="col-span-2 flex justify-end relative">
            <button onClick={() => setMenuOpen(!menuOpen)}>
                <Image src="/assets/ui_img/hamburger.svg" alt="menu" width={23} height={23} />
            </button>
            {menuOpen && (
                <div className="absolute top-full right-0 mt-2 bg-white rounded shadow-lg py-2 w-40 text-black">
                    <Link href="/my-projects" passHref>
                        <div className="px-4 py-2 hover:bg-gray-100 cursor-pointer">My Projects</div>
                    </Link>
                    <Link href="/about-me" passHref>
                        <div className="px-4 py-2 hover:bg-gray-100 cursor-pointer">About Me</div>
                    </Link>
                </div>
            )}
          </div>
        )}
      </div>
    );
}
