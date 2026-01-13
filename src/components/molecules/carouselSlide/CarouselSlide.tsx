import type { CarouselSlideProps } from "@/types/types";
import TacticCards from "@/components/molecules/tacticCards/TacticCards";

const CarouselSlide = ({
  header,
  image,
  imageType,
  imageAlt = "",
  description,
  children,
}: CarouselSlideProps) => {
  return (
    <div
      className={`carousel-slide ${
        imageType === "multiple" ? "carousel-slide-with-tactics" : ""
      }`}
    >
      {header && <h2 className="carousel-slide-header">{header}</h2>}

      {image && (
        <div className="carousel-slide-image-wrapper">
          <img src={image} alt={imageAlt} className="carousel-slide-image" />
        </div>
      )}
      {imageType === "multiple" && <TacticCards />}

      {description && (
        <p className="carousel-slide-description">{description}</p>
      )}

      {children && <div className="carousel-slide-content">{children}</div>}
    </div>
  );
};

export default CarouselSlide;
