import { setTimeout } from "timers";
import { promisify } from "util";
import { username } from "./username";
import { HueApi, lightState } from "node-hue-api";

async function sleep(milliseconds = 1000) {
  await promisify(setTimeout)(milliseconds);
}

export class BridgeController {
  private api: HueApi;
  private officeLightId: string;

  constructor(private ip: string) {
    this.api = new HueApi(ip, username);
  }

  async run() {
    await this.initOfficeLightId();

    await this.disco();
    await sleep();

    await this.randomDisco(3);

    this.turnOff();
    await sleep(2000);

    this.turnOn(255, 0, 0);
    await sleep();
    this.turnOn(0, 255, 0);
    await sleep();
    this.turnOn(0, 0, 255);
    await sleep();
    this.turnOff();
    await sleep();

    this.resetLamp();
  }

  async resetLamp() {
    await this.initOfficeLightId();
    await this.turnOn(255, 255, 150);
  }

  private async disco() {
    for (let i = 0; i < 10; i++) {
      this.turnOnInstantly(255, 0, 0);
      await sleep(60);
      this.turnOnInstantly(0, 255, 0);
      await sleep(60);
      this.turnOnInstantly(0, 0, 255);
      await sleep(60);
    }
  }

  private async randomDisco(durationInSeconds: number) {
    const frameRate = 100;
    const numIterations = durationInSeconds * 1000 / frameRate;
    for (let i = 0; i < numIterations; i++) {
      this.turnOnInstantly(
        Math.round(Math.random() * 255),
        Math.round(Math.random() * 255),
        Math.round(Math.random() * 255)
      );
      await sleep(frameRate);
    }
  }

  private async initOfficeLightId() {
    if (this.officeLightId) return;

    const lights = await this.api.lights();
    const officeLight = lights.lights.find(
      light => light.name === "Office lamp"
    );
    if (!officeLight) throw new Error("Office light not found");
    const officeLightId = officeLight.id;
    if (!officeLightId) throw new Error("Office light has no ID");
    this.officeLightId = officeLightId;
  }

  private turnOn(r: number, g: number, b: number) {
    return this.api.setLightState(
      this.officeLightId,
      lightState
        .create()
        .turnOn()
        .rgb(r, g, b)
        .bri(254)
    );
  }

  private turnOnInstantly(r: number, g: number, b: number) {
    return this.api.setLightState(
      this.officeLightId,
      lightState
        .create()
        .turnOn()
        .rgb(r, g, b)
        .bri(254)
        .transitionInstant()
    );
  }

  private turnOff() {
    return this.api.setLightState(
      this.officeLightId,
      lightState.create().turnOff()
    );
  }
}
