

import React from 'react';
import { SparklesIcon } from './icons/SparklesIcon';
import { ScrollDownIcon } from './icons/ScrollDownIcon';
import { ScissorIcon } from './icons/ScissorIcon';
import { PlusCircleIcon } from './icons/PlusCircleIcon';
import { ColorSwatchIcon } from './icons/ColorSwatchIcon';
import { ShirtIcon } from './icons/ShirtIcon';
import { UploadIcon } from './icons/UploadIcon';

interface HomePageProps {
  onStartEditing: () => void;
  onStartGenerating: () => void;
}

const features = [
    {
        icon: <ScissorIcon className="w-8 h-8 text-pink-400" />,
        title: 'Remove Background',
        description: 'Instantly cut out the subject of your photo from its background with a simple command.'
    },
    {
        icon: <PlusCircleIcon className="w-8 h-8 text-pink-400" />,
        title: 'Add Anything',
        description: 'Seamlessly add new elements, objects, or even people into your images.'
    },
    {
        icon: <ColorSwatchIcon className="w-8 h-8 text-pink-400" />,
        title: 'Change Colors',
        description: 'Modify the color of hair, clothing, or any object just by describing the change.'
    },
    {
        icon: <ShirtIcon className="w-8 h-8 text-pink-400" />,
        title: 'Swap Outfits',
        description: 'Magically change the clothing on a person in your photo to a different style or color.'
    }
]

export const HomePage: React.FC<HomePageProps> = ({ onStartEditing, onStartGenerating }) => {
  return (
    <main className="flex-1 w-full overflow-y-auto animate-fade-in">
        <div className="absolute top-0 left-0 w-full h-full bg-gray-900 -z-20"></div>
        <div 
            className="absolute top-0 left-0 w-full h-full -z-10 opacity-40"
            style={{
                backgroundImage: 'radial-gradient(circle at 20% 25%, #581c87 0%, transparent 40%), radial-gradient(circle at 80% 70%, #86198f 0%, transparent 40%)'
            }}
        ></div>
        
        {/* Hero Section */}
        <section className="h-screen min-h-[700px] flex flex-col items-center justify-center p-4 text-center relative">
            <div className="absolute top-10 left-1/2 -translate-x-1/2 px-4 py-2 bg-gray-800/50 backdrop-blur-sm border border-purple-500/20 rounded-full">
                <p className="text-xs text-purple-300 font-semibold tracking-wider uppercase">
                    Uses Google's most advanced image generation
                </p>
            </div>

            <div className="max-w-3xl">
                <div className="text-8xl mb-6 logo-rainbow-glow">
                    🐦‍🔥
                </div>
                <h1 className="text-5xl md:text-7xl mb-4 font-black tracking-wider bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-500 bg-clip-text text-transparent logo-rainbow-glow">
                    Krrish Kreations
                </h1>
                <p className="mt-6 text-lg md:text-xl text-gray-300 max-w-2xl mx-auto">
                    Transform your images with the power of generative AI. Describe any edit, and watch it come to life in seconds.
                </p>
            </div>

            <div className="mt-12 w-full max-w-md space-y-4">
                <button
                    onClick={onStartEditing}
                    className="group relative w-full p-6 bg-gray-800/30 backdrop-blur-lg border border-purple-500/30 rounded-2xl text-left transition-all duration-300 hover:border-purple-500/80 hover:bg-gray-800/50 transform hover:-translate-y-1"
                >
                    <div className="flex items-center gap-6">
                        <div className="p-4 bg-gradient-to-br from-sky-600 to-teal-600 rounded-xl shadow-lg">
                            <UploadIcon className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-white">Edit an Image with AI</h3>
                            <p className="mt-1 text-gray-400">Upload a picture and start a new session.</p>
                        </div>
                    </div>
                </button>
                 <button
                    onClick={onStartGenerating}
                    className="group relative w-full p-6 bg-gray-800/30 backdrop-blur-lg border border-purple-500/30 rounded-2xl text-left transition-all duration-300 hover:border-purple-500/80 hover:bg-gray-800/50 transform hover:-translate-y-1"
                >
                    <div className="flex items-center gap-6">
                        <div className="p-4 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl shadow-lg">
                            <SparklesIcon className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-white">Generate an Image</h3>
                            <p className="mt-1 text-gray-400">Start with a text prompt to create art.</p>
                        </div>
                    </div>
                </button>
            </div>
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-gray-500">
                <span className="text-xs font-semibold">Learn More</span>
                <ScrollDownIcon className="w-6 h-6 animate-bounce" />
            </div>
        </section>

        {/* Features Section */}
        <section className="py-24 bg-gray-950/50">
            <div className="max-w-5xl mx-auto px-4">
                <div className="text-center mb-16">
                    <h3 className="text-4xl font-extrabold text-white">What Can You Do?</h3>
                    <p className="mt-4 text-lg text-gray-400">The possibilities are endless. Here are a few ideas to get you started.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {features.map((feature, index) => (
                        <div key={index} className="bg-gray-800/40 p-8 rounded-2xl border border-purple-500/20 transition-all duration-300 hover:border-purple-500/50 hover:bg-gray-800/70 transform hover:-translate-y-1">
                            <div className="flex items-center gap-4">
                               <div className="p-3 bg-gray-900/50 rounded-lg border border-purple-500/20">
                                {feature.icon}
                               </div>
                                <h4 className="text-2xl font-bold text-white">{feature.title}</h4>
                            </div>
                            <p className="mt-4 text-gray-400">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    </main>
  );
};
