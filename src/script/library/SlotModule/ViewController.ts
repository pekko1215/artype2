import { SlotModule } from "./SlotModule";
import { SlotEventPayload } from "./SlotEventListener";
import { PanelData } from "./PanelData";

export interface ReelChipData {
  width: number;
  height: number;
  blank: number;
}

export class SlotViewController {
  slotModule: SlotModule;
  panelData: PanelData;
  width: number;
  height: number;
  app: PIXI.Application;
  stage: PIXI.Container;
  frame: number = 0;
  reelChipData: ReelChipData | null = null;
  reelChips: PIXI.Sprite[][] | null = null;
  blankGraphics: any;
  path: string;
  updateDate = new Date();
  constructor(
    slotModule: SlotModule,
    element: Element,
    path = "img/reelchip.png"
  ) {
    this.slotModule = slotModule;
    this.panelData = slotModule.panelData;
    this.app = new PIXI.Application(this.panelData.PIXIOptions);
    this.width = this.app.view.width;
    this.height = this.app.view.height;
    this.stage = this.app.stage;
    this.path = path;
    element.appendChild(this.app.view);
  }
  async loadReelChip() {
    // let loader = new PIXI.Loader;
    // loader.add(path);
    this.reelChipData = {
      blank: this.slotModule.panelData.reel.blank,
      width: 0,
      height: 0,
    }; //リールチップ共通の情報を記憶

    const loader = new PIXI.Loader();
    loader.add("reel", this.path);

    const reelResource: PIXI.LoaderResource = await new Promise((r) => {
      loader.load((_loader, resource) => {
        r(resource.reel);
      });
    });
    const reelTexture: PIXI.BaseTexture = reelResource.texture.baseTexture;
    const reelWidth = reelTexture.width;
    const reelHeight = reelTexture.height;

    const Frames: PIXI.Texture[] = [];

    let c = this.slotModule.reelControl.controlData.typeCount;
    let chipHeight = reelHeight / c;

    this.reelChipData.width = reelWidth;
    this.reelChipData.height = chipHeight;

    for (let i = 0; i < c; i++) {
      Frames.push(
        new PIXI.Texture(
          reelTexture,
          new PIXI.Rectangle(0, chipHeight * i, reelWidth, chipHeight)
        )
      );
    }
    this.reelChips = this.slotModule.reelControl.controlData.reelArray.map(
      (arr: any[], reelIndex: number) => {
        return arr.map((c: number, i: number) => {
          let s = new PIXI.Sprite(Frames[c]);
          let obj = this.stage.addChild(s);
          obj.position.x =
            (this.reelChipData!.width + this.reelChipData!.blank) * reelIndex;
          obj.position.y = this.reelChipData!.height * i;
          return obj;
        });
      }
    );

    this.blankGraphics = new PIXI.Graphics();
    this.blankGraphics.zIndex = 32;

    this.stage.addChildAt(this.blankGraphics, 0);

    let x = this.reelChipData.width + 1;

    this.blankGraphics.beginFill(this.slotModule.panelData.reel.blank);

    this.blankGraphics.drawRect(
      x,
      0,
      this.reelChipData.blank,
      this.slotModule.panelData.PIXIOptions.height
    );
    x += this.reelChipData.width + this.reelChipData.blank;

    this.blankGraphics.drawRect(
      x,
      0,
      this.reelChipData.blank,
      this.slotModule.panelData.PIXIOptions.height
    );
    this.slotModule.emit(
      "resourceLoaded",
      new (class implements SlotEventPayload {
        data: PIXI.Container;
        constructor(stage: PIXI.Container) {
          this.data = stage;
        }
      })(this.stage)
    );
    this.slotModule.flashController.init();
  }
  draw() {
    let { reelChipData } = this;
    //ここにかく

    let diffDate = new Date().valueOf() - this.updateDate.valueOf();
    let diffOf60Hz = diffDate / (1000 / 60);
    this.slotModule.reelController!.next(diffOf60Hz);
    this.slotModule.update();
    this.slotModule.flashController.draw();
    this.reelChips!.forEach((arr: PIXI.Sprite[], i: number) => {
      let reel = this.slotModule.reelController!.reels[i];

      arr.forEach((chip: { position: { y: number } }, chipIndex: number) => {
        chip.position.y = -reel.reelPosition + reelChipData!.height * chipIndex;

        if (chip.position.y >= this.height) {
          chip.position.y -= reelChipData!.height * reel.length;
        }
        if (
          chip.position.y <=
          -reelChipData!.height * reel.length + this.height
        ) {
          chip.position.y += reelChipData!.height * reel.length;
        }
      });
    });

    // フレーム数をインクリメント
    this.frame++;
    this.app.render(); // 描画する
    this.updateDate = new Date();
    requestAnimationFrame(() => this.draw()); // 次の描画タイミングでanimateを呼び出す
  }
}
