import hamburger from '@assets/ui/hamburger.svg';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { FaGithub, FaLinkedin } from 'react-icons/fa';
import { MdEmail } from 'react-icons/md';
import { useMediaQuery } from '../hooks/useMediaQuery';

export default function Header() {
  const [isLoaded, setIsLoaded] = useState(false);
  const isSmall = useMediaQuery('(max-width: 850px)');
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  if (!isLoaded) {
    return null;
  }

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
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className={`flex gap-4 items-center ${isSmall ? 'pt-2 justify-start' : 'justify-center'}`}
          >
            <a
              className="cursor-pointer"
              href="https://github.com/NeoHuncho"
              target="_blank"
              rel="noreferrer"
            >
              <FaGithub size={25} color="white" />
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
              <MdEmail size={28} color="white" />
            </a>
          </motion.div>
        </div>
        {isSmall && (
          <div className="col-span-2 flex justify-end relative">
            <button onClick={() => setMenuOpen(!menuOpen)}>
                <Image src={hamburger} alt="menu" width={23} height={23} />
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
