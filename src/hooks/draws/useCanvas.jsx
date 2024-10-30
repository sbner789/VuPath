const useCanvas = ({
  canvasCurrent,
  useImg,
  images,
  currentImg,
  scale,
  rotate,
  imgSizeW,
  imgSizeH,
  setSvgSize,
}) => {
  const getCanvasElements = (imgW, imgH) => {
    const canvas = canvasCurrent.current;
    const context = canvas.getContext("2d");
    const imageWidth = imgW;
    const imageHeight = imgH;

    return {
      canvas,
      context,
      imageWidth,
      imageHeight,
    };
  };

  const imageSetup = () => {
    const { canvas, context, imageWidth, imageHeight } = getCanvasElements(
      imgSizeW,
      imgSizeH
    );

    const newWidth = Math.sqrt(imgSizeW ** 2 + imgSizeH ** 2);
    const newHeight = Math.sqrt(imgSizeW ** 2 + imgSizeH ** 2);

    canvas.width = newWidth;
    canvas.height = newHeight;

    setSvgSize({
      w: canvas.width,
      h: canvas.height,
    });

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.save();
    context.translate(canvas.width / 2, canvas.height / 2);
    context.rotate((rotate * Math.PI) / 180);
    context.drawImage(
      useImg.current,
      -imageWidth / 2,
      -imageHeight / 2,
      imageWidth,
      imageHeight
    );
    context.restore();
  };

  const loadImage = () => {
    useImg.current.src = images[currentImg];
    useImg.current.onload = () => {
      imageSetup();
    };
  };

  const getCanvasCoordinates = (e) => {
    const { canvas } = getCanvasElements();
    const rect = canvas.getBoundingClientRect();

    const offsetX = (e.clientX - rect.left) / scale;
    const offsetY = (e.clientY - rect.top) / scale;

    return { offsetX, offsetY };
  };

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
    const { canvas } = getCanvasElements();
    const rect = canvas.getBoundingClientRect();

    const mouseX = (e.clientX - rect.left) / scale;
    const mouseY = (e.clientY - rect.top) / scale;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    const { x: offsetSvgX, y: offsetSvgY } = rotatePoint(
      mouseX,
      mouseY,
      -rotate,
      centerX,
      centerY
    );

    return { offsetSvgX, offsetSvgY };
  };

  return {
    getCanvasElements,
    imageSetup,
    loadImage,
    getCanvasCoordinates,
    getSvgCoordinates,
    rotatePoint,
  };
};
export default useCanvas;
