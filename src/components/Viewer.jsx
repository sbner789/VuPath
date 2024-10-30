import { useEffect, useRef, useState } from "react";
import img1 from "../test_images/newjeans-minji.jpg";
import img2 from "../test_images/won-young.jpg";
import useDrawRect from "../hooks/draws/useDrawRect";
import useMovements from "../hooks/movements/useMovements";
import useCanvas from "../hooks/draws/useCanvas";

const default_position = {
  x: 0,
  y: 0,
};

const default_size = {
  x: 0,
  y: 0,
};

const Viewer = ({ imgSizeW, imgSizeH }) => {
  const canvasRef = useRef(null);
  const imageRef = useRef(new Image());
  const images = [img1, img2];
  const containerRef = useRef(null);
  const trackerRef = useRef(null);
  const miniMapRef = useRef(null);
  const [translateValue, setTranslateValue] = useState(default_position);
  const [currentImg, setCurrentImg] = useState(0);
  const [rotateValue, setRotateValue] = useState(0);
  const [scaleValue, setScaleValue] = useState(1);
  const [svgSize, setSvgSize] = useState(default_size);
  const [isDrawRect, setIsDrawRect] = useState(false);
  const [isMove, setIsMove] = useState(true);
  const [miniMapPosition, setMiniMapPosition] = useState(default_position);

  const { loadImage } = useCanvas({
    canvasCurrent: canvasRef,
    useImg: imageRef,
    images: images,
    currentImg: currentImg,
    rotate: rotateValue,
    scale: scaleValue,
    imgSizeW: imgSizeW,
    imgSizeH: imgSizeH,
    setSvgSize: setSvgSize,
  });

  const { drawStartRect, drawRect, drawEndRect, saveRect } = useDrawRect({
    canvasCurrent: canvasRef,
    useImg: imageRef,
    currentImg: currentImg,
    rotate: rotateValue,
    scale: scaleValue,
    setSvgSize: setSvgSize,
    imgSizeW: imgSizeW,
    imgSizeH: imgSizeH,
  });

  const {
    handleWheel,
    handleZoom,
    handleClickZoom,
    handleStartMove,
    handleMove,
    handleMoveStop,
    handleRotate,
    handleNext,
    handlePrev,
    handleFullscreen,
  } = useMovements({
    container: containerRef,
    images: images,
    currentImg: currentImg,
    setCurrentImg: setCurrentImg,
    scale: scaleValue,
    setScale: setScaleValue,
    setRotate: setRotateValue,
    moveOffset: translateValue,
    setMoveOffset: setTranslateValue,
  });

  useEffect(() => {
    loadImage();
  }, [rotateValue, currentImg]);

  // const offsetTracker = (e) => {
  //   const rect = trackerRef.current.getBoundingClientRect();
  //   const offsetTrackerX = (((e.clientX - rect.left) / 250) * 48) / scaleValue;
  //   const offsetTrackerY = (((e.clientY - rect.top) / 250) * 48) / scaleValue;
  // const offsetTrackerX =
  //   (((e.clientX - rect.left) / miniMapRect.width) * 32.6) / scaleValue;
  // const offsetTrackerY =
  //   (((e.clientY - rect.top) / miniMapRect.height) * 32.6) / scaleValue;

  //   setMiniMapPosition({
  //     x: offsetTrackerX,
  //     y: offsetTrackerY,
  //   });
  // };

  const offsetTracker = (e) => {
    const rect = trackerRef.current.getBoundingClientRect();
    const miniMapRect = miniMapRef.current.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const offsetTrackerX =
      (((e.clientX - rect.left) / miniMapRect.width) * 32.6) / scaleValue;
    const offsetTrackerY =
      (((e.clientY - rect.top) / miniMapRect.height) * 32.6) / scaleValue;
    // const offsetTrackerX =
    //   (e.clientX - rect.left) / miniMapRect.width / scaleValue;
    // const offsetTrackerY =
    //   (e.clientY - rect.top) / miniMapRect.height / scaleValue;

    setMiniMapPosition({
      x: offsetTrackerX,
      y: offsetTrackerY,
    });
  };

  return (
    <div>
      <div
        ref={containerRef}
        style={{
          position: "relative",
          border: "2px solid magenta",
          width: "1920px",
          height: "1080px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            top: 0,
            left: 0,
            transform: `translate(${translateValue.x}px, ${translateValue.y}px) scale(${scaleValue})`,
            transformOrigin: "0 0",
          }}
        >
          <div
            ref={trackerRef}
            style={{
              position: "absolute",
              width: `${imgSizeW}px`,
              height: `${imgSizeH}px`,
              border: "2px solid black",
              boxSizing: "border-box",
              pointerEvents: "none",
              transform: `rotate(${rotateValue}deg)`,
            }}
          />
          <canvas
            ref={canvasRef}
            onWheel={(e) => {
              handleWheel(e);
              offsetTracker(e);
            }}
            onMouseDown={(e) => {
              isDrawRect && drawStartRect(e);
              isMove && handleStartMove(e);
              offsetTracker(e);
            }}
            onMouseMove={(e) => {
              isDrawRect && drawRect(e);
              isMove && handleMove(e);
              offsetTracker(e);
            }}
            onMouseUp={(e) => {
              isDrawRect && drawEndRect(e);
              isMove && handleMoveStop(e);
              offsetTracker(e);
            }}
            onClick={(e) => {
              !isDrawRect && handleClickZoom(e);
            }}
          ></canvas>
          <svg
            width={svgSize.w}
            height={svgSize.h}
            style={{
              position: "absolute",
              pointerEvents: "none",
              transform: `rotate(${rotateValue}deg)`,
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
        <div
          style={{
            position: "absolute",
            top: "10px",
            left: "10px",
            display: "flex",
            gap: "10px",
          }}
        >
          <button
            onClick={() => handleZoom("+5")}
            style={{
              fontSize: "20px",
            }}
            disabled={scaleValue >= 40}
          >
            +
          </button>
          <button
            onClick={() => handleZoom("-5")}
            style={{ fontSize: "20px" }}
            disabled={scaleValue <= 1}
          >
            -
          </button>
          <button
            onClick={(e) => {
              handleFullscreen(e);
            }}
          >
            fullscreen
          </button>
          <button
            onClick={() => {
              handleRotate(30);
            }}
            style={{ fontSize: "20px" }}
          >
            +30&#186;
          </button>
          <button
            onClick={() => {
              handleRotate(-30);
            }}
            style={{ fontSize: "20px" }}
          >
            -30&#186;
          </button>
          <button
            onClick={handlePrev}
            style={{ fontSize: "20px" }}
            disabled={currentImg < 1}
          >
            Prev
          </button>
          <button
            onClick={handleNext}
            style={{ fontSize: "20px" }}
            disabled={images.length - 1 == currentImg}
          >
            Next
          </button>
          <button
            onClick={() => {
              setIsDrawRect(!isDrawRect);
              isDrawRect ? setIsMove(true) : setIsMove(false);
            }}
            style={{ fontSize: "20px" }}
          >
            {isDrawRect ? "Stop Rect" : "Start Rect"}
          </button>
        </div>
        <div
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            width: "500px",
            height: "500px",
            background: "rgba(0, 0, 0, 0.7)",
            overflow: "hidden",
          }}
        >
          <div
            ref={miniMapRef}
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              border: "1px solid green",
              boxSizing: "border-box",
            }}
          >
            <div
              style={{
                position: "relative",
                width: "auto",
                height: "auto",
                border: "1px solid magenta",
                boxSizing: "border-box",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: `${0}px`,
                  left: `${0}px`,
                  width: "50px",
                  height: "50px",
                  border: `${scaleValue}px solid red`,
                  boxSizing: "border-box",
                  transform: `translate(${miniMapPosition.x}px, ${
                    miniMapPosition.y
                  }px) scale(${1 / scaleValue})`,
                  transformOrigin: "0 0",
                }}
              />
              <img
                style={{
                  width: "100%",
                }}
                src={images[currentImg]}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Viewer;
