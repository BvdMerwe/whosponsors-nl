/* eslint-disable no-console */
import vpnLocation from "../data/vpn-location.json";
import { exec } from "node:child_process";
import Random from "@/lib/random";

export default async function switchVpnLocation(): Promise<void> {
    const randomVpnLocation = vpnLocation[Random.randomBetween(0, vpnLocation.length - 1)];

    execute(`mullvad relay set location ${randomVpnLocation}`);
}

function execute(command: string): void {
    console.log(command);
    exec(command);
}
