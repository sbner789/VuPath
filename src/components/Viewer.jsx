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
  const isDrawingRectRef = useRef(false);
  const rectPosRef = useRef(default_position);
  const svgRectCoordRef = useRef(default_position);
  const [zoom, setZoom] = useState(1);
  const [currentImg, setCurrentImg] = useState(0);
  const [isMove, setIsMove] = useState(true);
  const [isDrawRect, setIsDrawRect] = useState(false);
  const [saveRect, setSaveRect] = useState([]);
  const [transcoord, setTransCoord] = useState(default_position);
  const [rotateValue, setRotateValue] = useState(0);

  const rotatePoint = (x, y, angle, centerX, centerY) => {
    const radians = (angle * Math.PI) / 180;
    const cos = Math.cos(radians);
    const sin = Math.sin(radians);
    const dx = x - centerX;
    const dy = y - centerY;

    return {
      x: dx * cos - dy * sin + centerX,
      y: dx * sin + dy * cos + centerY,
    };
  };

  const getSvgCoordinates = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();

    const mouseX = (e.clientX - rect.left) / scaleRef.current;
    const mouseY = (e.clientY - rect.top) / scaleRef.current;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    const { x: offsetSvgX, y: offsetSvgY } = rotatePoint(
      mouseX,
      mouseY,
      -rotationRef.current,
      centerX,
      centerY
    );

    return { offsetSvgX, offsetSvgY };
  };

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
    setRotateValue(0);
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
    setRotateValue(rotationRef.current);
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
      setTransCoord({
        x: viewPositionRef.current.x,
        y: viewPositionRef.current.y,
      });
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
      setTransCoord({
        x: viewPositionRef.current.x,
        y: viewPositionRef.current.y,
      });
    });
  };

  const handleZoom = (zoomValue) => {
    const canvas = canvasRef.current;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    const xs = (centerX - viewPositionRef.current.x) / scaleRef.current;
    const ys = (centerY - viewPositionRef.current.y) / scaleRef.current;

    const newScale = scaleRef.current + zoomValue;
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
      setTransCoord({
        x: viewPositionRef.current.x,
        y: viewPositionRef.current.y,
      });
    });
  };

  const drawRectStart = (e) => {
    const canvas = canvasRef.current;
    const { offsetX, offsetY } = e.nativeEvent;
    const { offsetSvgX, offsetSvgY } = getSvgCoordinates(e);

    isDrawingRectRef.current = true;
    rectPosRef.current = {
      x: offsetX,
      y: offsetY,
    };
    svgRectCoordRef.current = {
      x: offsetSvgX,
      y: offsetSvgY,
    };
    console.log({ offsetX }, { offsetY }, { offsetSvgX }, { offsetSvgY });
    const context = canvas.getContext("2d");
    context.beginPath();
  };

  const drawRect = (e) => {
    if (!isDrawingRectRef.current) return;
    const canvas = canvasRef.current;
    const { offsetX, offsetY } = e.nativeEvent;

    const context = canvas.getContext("2d");
    requestAnimationFrame(() => {
      loadImage();
      context.save();
      context.strokeStyle = "red";
      context.strokeRect(
        rectPosRef.current.x,
        rectPosRef.current.y,
        offsetX - rectPosRef.current.x,
        e.shiftKey
          ? offsetX - rectPosRef.current.x
          : offsetY - rectPosRef.current.y
      );
      context.restore();
    });
  };

  const drawEndRect = (e) => {
    isDrawingRectRef.current = false;
    drawConvertToSVGRect(e);
  };

  const drawConvertToSVGRect = (e) => {
    const { offsetX, offsetY } = e.nativeEvent;
    const svgPathX = rectPosRef.current.x;
    const svgPathY = rectPosRef.current.y;
    const svgRotatePathX = svgRectCoordRef.current.x;
    const svgRotatePathY = svgRectCoordRef.current.y;

    const rectX = svgRotatePathX;
    const rectY = svgRotatePathY;
    const rectWidth = offsetX - svgPathX;
    const rectHeight = e.shiftKey ? offsetX - svgPathX : offsetY - svgPathY;

    if (rectWidth > 0 && rectHeight > 0) {
      const newSvgRect = (
        <rect
          key={saveRect.length}
          x={rectX - viewPositionRef.current.x}
          y={rectY - viewPositionRef.current.y}
          width={Math.abs(rectWidth)}
          height={Math.abs(rectHeight)}
          stroke="red"
          strokeWidth="2"
          fill="none"
          transform={`rotate(${-rotationRef.current},${svgRotatePathX},${svgRotatePathY})`}
        />
      );
      setSaveRect((prev) => [
        ...prev,
        {
          img_id: currentImg,
          key: newSvgRect.key,
          type: newSvgRect.type,
          props: newSvgRect.props,
        },
      ]);
    }
  };

  useEffect(() => {
    imageRef.current.src = images[currentImg];
    imageRef.current.onload = () => {
      loadImage();
    };
  }, [currentImg]);

  return (
    <div>
      <div
        style={{
          position: "relative",
          border: "2px solid red",
          width: "1920px",
          height: "1080px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "relative",
            width: "1920px",
            height: "1080px",
            // transform: `scale(${scaleRef.current})`,
          }}
        >
          <canvas
            ref={canvasRef}
            onMouseDown={(e) => {
              isMove && handleMouseDown(e);
              isDrawRect && drawRectStart(e);
            }}
            onMouseMove={(e) => {
              isMove && handleMouseMove(e);
              isDrawRect && drawRect(e);
            }}
            onMouseUp={(e) => {
              isMove && handleMouseUp(e);
              isDrawRect && drawEndRect(e);
            }}
            onWheel={(e) => handleWheel(e)}
          ></canvas>
          <svg
            width={1920}
            height={1080}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              pointerEvents: "none",
              transform: `scale(${scaleRef.current}) translate(${transcoord.x}px ,${transcoord.y}px) rotate(${rotationRef.current}deg)`,
            }}
          >
            {saveRect.map((el) => {
              if (el.img_id === currentImg)
                return (
                  <rect
                    key={el.key}
                    width={el.props.width}
                    height={el.props.height}
                    x={el.props.x}
                    y={el.props.y}
                    stroke={el.props.stroke}
                    strokeWidth={el.props.strokeWidth}
                    fill={el.props.fill}
                    transform={el.props.transform}
                  />
                );
            })}
          </svg>
        </div>
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
        <button
          onClick={() => {
            setIsDrawRect(!isDrawRect);
            isDrawRect ? setIsMove(true) : setIsMove(false);
          }}
        >
          {isDrawRect ? "Stop Rect" : "Start Rect"}
        </button>
      </div>
    </div>
  );
};
export default Viewer;
