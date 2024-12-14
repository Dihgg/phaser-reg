import ImageFrameConfig = Phaser.Types.Loader.FileTypes.ImageFrameConfig;

type MapType = { name: string; tileset: string; tilemap: object };
type AtlasType = { name: string; data: object; image: string };
type SpritesheetType = {
  name: string;
  image: string;
  data: ImageFrameConfig;
}
