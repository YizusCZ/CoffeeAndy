import React from 'react'
import { assets, footerLinks } from '../assets/assets';

const Footer = () => {

    return (
        <div className="px-6 md:px-16 lg:px-24 xl:px-32 mt-24 bg-gradient-to-b from-primary/10 to-primary/5">
            <div className="flex flex-col md:flex-row items-start justify-between gap-10 py-12 border-b border-gray-300/40 text-gray-600">
                <div className="flex-1 max-w-md">
                    <img 
                        className="w-32 md:w-36 mb-4 transition-transform hover:scale-105 duration-300" 
                        src={assets.logo_amarillo} 
                        alt="logo" 
                    />
                    <p className="text-sm md:text-base leading-relaxed text-gray-500 mt-4">
                        Disfruta tu tiempo...
                    </p>
                </div>
                
                <div className="flex flex-wrap justify-between w-full md:w-[50%] gap-8">
                    {footerLinks.map((section, index) => (
                        <div key={index} className="min-w-[140px]">
                            <h3 className="font-bold text-lg text-gray-800 mb-3 pb-2 border-b-3 border-amber-400 inline-block">
                                {section.title}
                            </h3>
                            <ul className="space-y-3 mt-4">
                                {section.links.map((link, i) => (
                                    <li key={i}>
                                        <a 
                                            href={link.url} 
                                            className="text-gray-600 hover:text-amber-500 hover:translate-x-1 transition-all duration-300 ease-in-out block text-sm md:text-base"
                                        >
                                            {link.text}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
            
            {/* Sección inferior del footer */}
            <div className="py-6 flex flex-col md:flex-row items-center justify-between text-gray-500">
                <div className="text-sm mb-4 md:mb-0">
                    © {new Date().getFullYear()} Todos los derechos reservados.
                </div>
            </div>
        </div>
    );
}

export default Footer;