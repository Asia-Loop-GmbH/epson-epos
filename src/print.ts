import {EpsonBuilder, EpsonDevice} from "./epson";


export function resetText(builder: EpsonBuilder) {
  builder.addTextSize(1, 1)
  builder.addTextSmooth(false)
  builder.addTextFont(builder.FONT_A)
  builder.addTextAlign(builder.ALIGN_LEFT)
  builder.addTextStyle()
}

declare const epson: any;

export interface PrintOptions {
  ip: string;
  https: boolean;

  execute(builder: EpsonBuilder): void
}

export function print(opts: PrintOptions) {
  const ePosDev: EpsonDevice = new epson.ePOSDevice();
  const port = opts.https ? 8043 : 8008;
  ePosDev.connect(opts.ip, port, cbConnect);

  function cbConnect(data: string) {
    if (data === 'OK') {
      console.log("EPSON connected")
      ePosDev.createDevice('local_printer', ePosDev.DEVICE_TYPE_PRINTER, {
        'crypto': true,
        'buffer': true
      }, cbCreateDevice_printer);
    } else {
      console.error("Failed to connect EPSON")
      console.log(data);
    }
  }

  function cbCreateDevice_printer(devobj: EpsonBuilder, retcode: string) {
    if (retcode === 'OK') {
      console.log("EPSON got device")
      opts.execute(devobj);
      devobj.send()
    } else {
      console.error("Failed to get EPSON device")
      console.log(retcode);
    }
  }
}