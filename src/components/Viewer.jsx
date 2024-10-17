import React, { useEffect, useRef, useState } from "react";
import img1 from "../test_images/newjeans-minji.jpg";
import img2 from "../test_images/won-young.jpg";

const default_position = {
  x: 0,
  y: 0,
};

const Viewer = () => {
  const canvasRef = useRef(null);
  const scaleRef = useRef(1);
  const imageRef = useRef(new Image());
  const images = [img1, img2];
  const panningRef = useRef(false);
  const viewPositionRef = useRef(default_position);
  const startPosRef = useRef(default_position);
  const rotationRef = useRef(0);
  const [zoom, setZoom] = useState(0);
  const [currentImg, setCurrentImg] = useState(0);

  const loadImage = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    canvas.width = 1920;
    canvas.height = 1080;

    const imgWidth = canvas.width;
    const imgHeight = canvas.height;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.setTransform(
      scaleRef.current,
      0,
      0,
      scaleRef.current,
      viewPositionRef.current.x,
      viewPositionRef.current.y
    );

    ctx.translate(canvas.width / 2, canvas.height / 2);

    ctx.rotate((rotationRef.current * Math.PI) / 180);

    ctx.drawImage(
      imageRef.current,
      -imgWidth / 2,
      -imgHeight / 2,
      imgWidth,
      imgHeight
    );
    ctx.restore();
  };

  const handleReset = () => {
    scaleRef.current = 1;
    rotationRef.current = 0;
    setZoom(0);
    viewPositionRef.current = default_position;
    requestAnimationFrame(() => {
      loadImage();
    });
  };

  const handleNextImage = () => {
    setCurrentImg((prevIndex) => (prevIndex + 1) % images.length);
    handleReset();
  };

  const handlePreviousImage = () => {
    setCurrentImg(
      (prevIndex) => (prevIndex - 1 + images.length) % images.length
    );
    handleReset();
  };

  const handleRotate = (direc) => {
    rotationRef.current += direc;
    requestAnimationFrame(() => {
      loadImage();
    });
  };

  const handleMouseDown = (e) => {
    const { offsetX, offsetY } = e.nativeEvent;
    startPosRef.current = {
      x: offsetX - viewPositionRef.current.x,
      y: offsetY - viewPositionRef.current.y,
    };
    panningRef.current = true;
  };

  const handleMouseUp = (e) => {
    panningRef.current = false;
  };

  const handleMouseMove = (e) => {
    const { offsetX, offsetY } = e.nativeEvent;
    if (!panningRef.current) {
      return;
    }
    viewPositionRef.current = {
      x: offsetX - startPosRef.current.x,
      y: offsetY - startPosRef.current.y,
    };
    requestAnimationFrame(() => {
      loadImage();
    });
  };

  const handleWheel = (e) => {
    const { offsetX, offsetY } = e.nativeEvent;
    const xs = (offsetX - viewPositionRef.current.x) / scaleRef.current;
    const ys = (offsetY - viewPositionRef.current.y) / scaleRef.current;
    const delta = -e.deltaY;
    const newScale =
      delta > 0 ? scaleRef.current * 1.05 : scaleRef.current / 1.05;
    setZoom(newScale);
    console.log({ newScale });
    if (newScale >= 1 && newScale <= 40) {
      scaleRef.current = newScale;
      viewPositionRef.current = {
        x: offsetX - xs * scaleRef.current,
        y: offsetY - ys * scaleRef.current,
      };
    }
    requestAnimationFrame(() => {
      loadImage();
    });
  };

  const handleZoom = (zoomValue) => {
    const canvas = canvasRef.current;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    const xs = (centerX - viewPositionRef.current.x) / scaleRef.current;
    const ys = (centerY - viewPositionRef.current.y) / scaleRef.current;

    const newScale = scaleRef.current + zoomValue;
    console.log({ newScale });
    setZoom(newScale);
    if (newScale >= 1 && newScale <= 40) {
      scaleRef.current = newScale;
      viewPositionRef.current = {
        x: centerX - xs * scaleRef.current,
        y: centerY - ys * scaleRef.current,
      };
    } else if (newScale < 0) {
      scaleRef.current = 1;
      viewPositionRef.current = {
        x: 0,
        y: 0,
      };
    }
    requestAnimationFrame(() => {
      loadImage();
    });
  };

  useEffect(() => {
    imageRef.current.src = images[currentImg];
    imageRef.current.onload = () => {
      loadImage();
    };
  }, [currentImg]);

  return (
    <div>
      <div>
        <canvas
          ref={canvasRef}
          onMouseDown={(e) => handleMouseDown(e)}
          onMouseMove={(e) => handleMouseMove(e)}
          onMouseUp={(e) => handleMouseUp(e)}
          onWheel={(e) => handleWheel(e)}
        ></canvas>
      </div>
      <div>
        <button onClick={() => handleReset()}>Reset Button</button>
        <button onClick={() => handleRotate(30)}>Rotate 30°</button>
        <button onClick={() => handleRotate(-30)}>Rotate -30°</button>
        <button onClick={() => handleZoom(5)} disabled={zoom >= 40}>
          Zoom In
        </button>
        <button onClick={() => handleZoom(-5)} disabled={zoom <= 1}>
          Zoom Out
        </button>
        <button onClick={handlePreviousImage}>이전</button>
        <button onClick={handleNextImage}>다음</button>
      </div>
    </div>
  );
};
export default Viewer;
