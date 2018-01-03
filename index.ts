import * as hue from "node-hue-api";
import { IUpnpSearchResultItem } from "node-hue-api";
import { BridgeController } from "./bridge-controller";

function interactWithBridge(bridge: IUpnpSearchResultItem[]) {
  if (bridge.length === 0) throw new Error("No bridges found");
  if (bridge.length > 1)
    throw new Error(`Multiple bridges found: ${JSON.stringify(bridge)}`);

  const controller = new BridgeController(bridge[0].ipaddress);

  process.on("SIGINT", function() {
    console.log("Exiting... Resetting the lamp to default.");
    controller.resetLamp().then(() => process.exit());
  });

  return controller.run();
}

async function run() {
  await hue.nupnpSearch().then(interactWithBridge);
}

run()
  .then(() => console.log("Done"))
  .catch(err => console.error(err));
