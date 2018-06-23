const elm = document.querySelector("#auth")!;
const brightnessController = document.querySelector(
  "#range"
) as HTMLInputElement;
import * as driver from "../driver";

let device: USBDevice | null = null;

brightnessController!.addEventListener("input", async e => {
  await driver.setScreenBrightness(
    device!,
    Number((e.target as HTMLInputElement).value) || 0
  );
});

window.onload = async () => {
  device = await grabDevice();
};

async function claimInterface(screen: USBDevice) {
  for (const config of screen.configurations) {
    for (const iface of config.interfaces) {
      if (!iface.claimed) {
        await screen.claimInterface(iface.interfaceNumber);
        return true;
      }
    }
  }

  return false;
}

async function grabDevice() {
  const d = await navigator.usb.getDevices();
  const selectedDevice = d[0];
  if (!selectedDevice.opened) {
    await selectedDevice.open();
  }

  if (selectedDevice.configuration == null) {
    await selectedDevice.selectConfiguration(1);
  }

  await claimInterface(selectedDevice);

  return selectedDevice;
}

elm.addEventListener("click", async () => {
  let d = await navigator.usb.getDevices();

  if (d.length === 0) {
    await navigator.usb.requestDevice({
      filters: [
        {
          vendorId: 0x16c0,
          productId: 0x05dc
        }
      ]
    });
  }
  device = await grabDevice();
});

(window as any).displayIcon = async (iconIndex: number, position: number) => {
  await driver.displayIcon(device!, iconIndex, position);
};

(window as any).displayIconAtPosition = async (
  iconIndex: number,
  x: number,
  y: number
) => {
  await driver.displayIconAtPosition(device!, x, y, iconIndex);
};

(window as any).setBrightness = async (val: number) => {
  await driver.setScreenBrightness(device!, val);
};

(window as any).clearScreen = async (lines: number, color: number = 0) => {
  ctx.clearRect(0, 0, 320, 240);
  await driver.clearLines(device!, 63, color);
};

(window as any).fillRect = async (
  x: number,
  y: number,
  width: number,
  height: number,
  color: number
) => {
  await driver.fillRect(device!, x, y, width, height, color);
};

const canvas = document.querySelector("canvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d")!;
let pointerDown = false;
canvas.onpointerdown = e => {
  pointerDown = true;
};

canvas.onpointerup = e => {
  pointerDown = false;
};

canvas.onpointermove = async e => {
  if (pointerDown === false) {
    return;
  }
  ctx.fillStyle = "red";
  ctx.fillRect(e.layerX, e.layerY, 5, 5);
  await driver.fillRect(device!, e.layerX, e.layerY, 5, 5, 0xf800);
};
