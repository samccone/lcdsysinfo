export enum TextLines {
  LINE_1 = 1 << 0,
  LINE_2 = 1 << 1,
  LINE_3 = 1 << 2,
  LINE_4 = 1 << 3,
  LINE_5 = 1 << 4,
  LINE_6 = 1 << 5,
  ALL = LINE_1 + LINE_2 + LINE_3 + LINE_4 + LINE_5 + LINE_6
}

/**
 * @param screen
 * @param icon number betweeen 1 - 43
 * @param position number between 0 to 47 (0 is top left 47 is bottom right)
 */
export async function displayIcon(
  screen: USBDevice,
  icon: number,
  position: number
) {
  const v = await screen.controlTransferOut(
    {
      requestType: "vendor",
      recipient: "device",
      request: 27,
      value: position * 512 + icon,
      index: 25600
    },
    new ArrayBuffer(0)
  );
  if (v.status !== "ok") {
    throw new Error("Unable to display icon");
  }
}

export async function displayIconAtPosition(
  screen: USBDevice,
  x: number,
  y: number,
  icon: number
) {
  x = Math.min(Math.max(0, x), 320);
  y = Math.min(Math.max(0, y), 240);
  const packed = new Uint8Array([y >> 8, y & 0xff, x >> 8, x & 0xff]);
  const v = await screen.controlTransferOut(
    {
      requestType: "vendor",
      recipient: "device",
      request: 29,
      value: (icon << 8) + icon,
      index: (icon << 8) + icon
    },
    packed
  );

  if (v.status != "ok") {
    throw new Error("Error writing to device");
  }
}

export async function setScreenBrightness(screen: USBDevice, val: number) {
  const v = await screen.controlTransferOut(
    {
      requestType: "vendor",
      recipient: "device",
      request: 13,
      value: val,
      index: val
    },
    new ArrayBuffer(0)
  );

  if (v.status != "ok") {
    throw new Error("Error writing to device");
  }
}

export async function clearLines(
  screen: USBDevice,
  lines: number,
  color: number
) {
  const v = await screen.controlTransferOut(
    {
      requestType: "vendor",
      recipient: "device",
      request: 26,
      value: lines,
      index: color
    },
    new ArrayBuffer(0)
  );

  if (v.status != "ok") {
    throw new Error("Error writing to device");
  }
}

export async function fillRect(
  screen: USBDevice,
  x: number,
  y: number,
  width: number,
  height: number,
  color: number
) {
  const v = await screen.controlTransferOut(
    {
      requestType: "vendor",
      recipient: "device",
      request: 95,
      value: 1,
      index: color
    },
    new Uint8Array([
      Number(y / 256),
      y % 256,
      Number(x / 256),
      x % 256,
      Number((y + height) / 256),
      Number((y + height) % 256),
      Number((x + width) / 256),
      Number((x + width) % 256),
      0,
      0
    ])
  );

  if (v.status != "ok") {
    throw new Error("Error writing to device");
  }
}
