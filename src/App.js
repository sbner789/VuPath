import CanvasWithImage from './components/CanvasWithImage';
import Viewer from './components/Viewer';

function App() {
  return (
    <div className="App">
      <Viewer imgSizeW={1920} imgSizeH={1080} />
      {/* <CanvasWithImage /> */}
    </div>
  );
}

export default App;
