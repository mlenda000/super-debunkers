import { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import CarouselSlide from "@/components/molecules/carouselSlide/CarouselSlide";
import type { ExtendedCarouselProps } from "@/types/types";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const Carousel = ({ slides, onSlideChange }: ExtendedCarouselProps) => {
  const [swiper, setSwiper] = useState<SwiperType | null>(null);
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);

  const handleSlideChange = (swiper: SwiperType) => {
    setIsBeginning(swiper.isBeginning);
    setIsEnd(swiper.isEnd);
    onSlideChange?.(swiper.isEnd);
  };

  return (
    <div className="carousel-container">
      <Swiper
        modules={[Navigation, Pagination]}
        spaceBetween={0}
        slidesPerView={1}
        onSwiper={setSwiper}
        onSlideChange={handleSlideChange}
        pagination={{
          clickable: true,
          dynamicBullets: false,
          bulletClass: "carousel-pagination-bullet",
          bulletActiveClass: "carousel-pagination-bullet-active",
        }}
        className="carousel-swiper"
      >
        {slides.map((slide) => (
          <SwiperSlide key={slide.id}>
            <CarouselSlide
              header={slide.header}
              image={slide.image}
              imageAlt={slide.imageAlt}
              imageType={slide.imageType}
              description={slide.description}
            />
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Navigation Arrows */}
      {!isBeginning && (
        <button
          className="carousel-arrow carousel-arrow-left"
          onClick={() => swiper?.slidePrev()}
          aria-label="Previous slide"
        >
          <img
            src="/images/buttons/back.webp"
            alt="Left Arrow"
            style={{ width: "100%" }}
          />
        </button>
      )}

      {!isEnd && (
        <button
          className="carousel-arrow carousel-arrow-right"
          onClick={() => swiper?.slideNext()}
          aria-label="Next slide"
        >
          <img
            src="/images/buttons/next.webp"
            alt="Right Arrow"
            style={{ width: "100%" }}
          />
        </button>
      )}
    </div>
  );
};

export default Carousel;
