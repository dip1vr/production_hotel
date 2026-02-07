"use client";

import React, { useState, useEffect, useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

import type { EmblaCarouselType } from 'embla-carousel';

interface RoomImageCarouselProps {
    images: string[];
    name: string;
    className?: string;
    onClick?: () => void;
}

export function RoomImageCarousel({ images, name, className = "", onClick }: RoomImageCarouselProps) {
    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
    const [current, setCurrent] = useState(0);

    const scrollPrev = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        if (emblaApi) emblaApi.scrollPrev();
    }, [emblaApi]);

    const scrollNext = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        if (emblaApi) emblaApi.scrollNext();
    }, [emblaApi]);

    const onSelect = useCallback((api: EmblaCarouselType) => {
        setCurrent(api.selectedScrollSnap());
    }, []);

    useEffect(() => {
        if (!emblaApi) return;

        // Use setTimeout to avoid synchronous state update warning during strict mode/initialization
        setTimeout(() => {
            onSelect(emblaApi);
        }, 0);

        emblaApi.on("select", onSelect);
        emblaApi.on("reInit", onSelect);
    }, [emblaApi, onSelect]);

    return (
        <div className={`relative group ${className}`}>
            <div className="overflow-hidden h-full" ref={emblaRef}>
                <div className="flex h-full touch-pan-y">
                    {images.map((src, index) => (
                        <div className="relative flex-[0_0_100%] min-w-0 h-full" key={index}>
                            <div className="relative w-full h-full cursor-pointer" onClick={onClick}>
                                <Image
                                    src={src}
                                    alt={`${name} - Image ${index + 1}`}
                                    fill
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                    className="object-cover transition-transform duration-700 hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Navigation Buttons (visible on hover) */}
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <Button
                    variant="secondary"
                    className="h-8 w-8 rounded-full bg-white/80 backdrop-blur-sm shadow-sm pointer-events-auto hover:bg-white p-0"
                    onClick={scrollPrev}
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                    variant="secondary"
                    className="h-8 w-8 rounded-full bg-white/80 backdrop-blur-sm shadow-sm pointer-events-auto hover:bg-white p-0"
                    onClick={scrollNext}
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>

            {/* Dots */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 pointer-events-none">
                {images.map((_, index) => (
                    <div
                        key={index}
                        className={`w-1.5 h-1.5 rounded-full transition-all shadow-sm ${index === current ? "bg-white w-3" : "bg-white/60"
                            }`}
                    />
                ))}
            </div>
        </div>
    );
}
