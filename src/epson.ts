export interface EpsonDevice {
  DEVICE_TYPE_PRINTER: string;
  connect(ip: string, port: number, cb: (result: string) => void): void;
  createDevice(name: string, type: string, opts: any, cb: (devobj: EpsonBuilder, retcode: string) => void): void;
}

export interface EpsonBuilder {
  FONT_A: string;
  FONT_C: string;
  ALIGN_CENTER: string;
  ALIGN_RIGHT: string;
  ALIGN_LEFT: string;
  CUT_FEED: string;
  CUT_NO_FEED: string;
  FEED_CUTTING: string;
  addTextSize(width: number, height: number): void;
  addTextSmooth(smooth: boolean): void;
  addTextFont(font: string): void;
  addTextStyle(reverse?: boolean, ul?: boolean, em?: boolean, color?: boolean): void;
  addFeed(): void;
  addFeedPosition(pos: string): void;
  addTextAlign(align: string): void;
  addText(text: string): void;
  addCut(type: string): void;
  send(id?: string): void
}