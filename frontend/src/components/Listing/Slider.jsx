import React, { useState, useEffect } from "react";
import "./Slider.css";

function CustomCarousel({ children }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [slideDone, setSlideDone] = useState(true);
  const [timeID, setTimeID] = useState(null);

  // Convert children to an array using React.Children.toArray
  const childrenArray = React.Children.toArray(children);

  useEffect(() => {
    if (slideDone && childrenArray.length > 1) {
      setSlideDone(false);
      setTimeID(
        setTimeout(() => {
          slideNext();
          setSlideDone(true);
        }, 5000)
      );
    }
  }, [slideDone, childrenArray.length]);

  const slideNext = () => {
    setActiveIndex((val) => {
      if (val >= childrenArray.length - 1) {
        return 0;
      } else {
        return val + 1;
      }
    });
  };

  const slidePrev = () => {
    setActiveIndex((val) => {
      if (val <= 0) {
        return childrenArray.length - 1;
      } else {
        return val - 1;
      }
    });
  };

  const AutoPlayStop = () => {
    if (timeID > 0) {
      clearTimeout(timeID);
      setSlideDone(false);
    }
  };

  const AutoPlayStart = () => {
    if (!slideDone && childrenArray.length > 1) {
      setSlideDone(true);
    }
  };

  return (
    <div
      className="container__slider"
      onMouseEnter={AutoPlayStop}
      onMouseLeave={AutoPlayStart}
    >
      {childrenArray.map((item, index) => (
        <div
          className={"slider__item slider__item-active-" + (activeIndex + 1)}
          key={index}
        >
          {item}
        </div>
      ))}

      {/* Render navigation controls only if there is more than 1 image */}
      {childrenArray.length > 1 && (
        <>
          <div className="container__slider__links">
            {childrenArray.map((item, index) => (
              <button
                key={index}
                className={
                  activeIndex === index
                    ? "container__slider__links-small container__slider__links-small-active"
                    : "container__slider__links-small"
                }
                onClick={(e) => {
                  e.preventDefault();
                  setActiveIndex(index);
                }}
              ></button>
            ))}
          </div>

          <button
            className="slider__btn-next"
            onClick={(e) => {
              e.preventDefault();
              slideNext();
            }}
          >
            {">"}
          </button>
          <button
            className="slider__btn-prev"
            onClick={(e) => {
              e.preventDefault();
              slidePrev();
            }}
          >
            {"<"}
          </button>
        </>
      )}
    </div>
  );
}

export default CustomCarousel;
