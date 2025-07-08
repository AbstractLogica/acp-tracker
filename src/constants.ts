import Bottleneck from "bottleneck";
import { ethers } from "ethers";
import dotenv from 'dotenv'
dotenv.config()

export const discordUrl = process.env.DISCORD_WEBHOOK_URL ?? null
export const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN ?? null
export const telegramChatId = process.env.TELEGRAM_CHAT_ID ?? null

export const virtuals = '0x0b3e328455c4059EEb9e3f84b5543F74E24e7E1b';
export const baseRpcUrl = process.env.BASE_RPC_URL || 'https://mainnet.base.org';
export const provider = new ethers.JsonRpcProvider(baseRpcUrl);
export const transferEventSignature = 'Transfer(address,address,uint256)';

export const limiter = new Bottleneck({
    minTime: 1000, // 1 request per second
    maxConcurrent: 1,
});

export const TIMEFRAMES = {
    ONE_DAY: 24 * 60 * 60,       // 24 hours
    ONE_WEEK: 7 * 24 * 60 * 60,  // 1 week
};

export const map = {
    AHF: {
        AXR: {
            contract: "0x01fD30172Cb08A4b8BcD031cb69f45E6eB4693A4",
            tokenCa: "0x58Db197E91Bc8Cf1587F75850683e4bd0730e6BF"
        },
        AIXBT: {
            contract: "0x9023dbe89FDD60851468eb8CD050B5cA1751C635",
            tokenCa: "0x4F9Fd6Be4a90f2620860d680c0d4d5Fb53d1A825"
        },
        TRUST: {
            contract: "0x9B1c65eE0Fb8dC52ca331faAFb85Ac03332f951E",
            tokenCa: ""
        },
        LOKY: {
            contract: "0xB7e36a77997Ac866A542Bd83cBc390D143897a01",
            tokenCa: "0x1A3e429D2D22149Cc61e0f539B112a227c844aa3"
        },
        WACH: {
            contract: "0xAd7FA8369417E2e608A1e215486cfb0D1Da90191",
            tokenCa: "0xCC9AD02796deC5f4f0710df80C1f011AF85eb9E1"
        },
        SWARM: {
            contract: "0xa17b17F999Baa5E572B75fd916A66c58b4ED6dE4",
            tokenCa: "0xea87169699dabd028a78d4B91544b4298086BAF6"
        },
        VU: {
            contract: "0x665B253678765c5c53d73d9e7B0480a61f8F4D62",
            tokenCa: "0x511ef9Ad5E645E533D15DF605B4628e3D0d0Ff53"
        },
        CERTAI: {
            contract: "0xBf5f46ABebCE87346fE2c8789b8B743940E98083",
            tokenCa: "0xf5f2a79eECcF6e7F4C570c803F529930e29cc96B"
        },
        BRAIN: {
            contract: "0xa51AC6fE439ba7c29AD978a92Ef29BBeF2C313dd",
            tokenCa: "0xCE1eAB31756A48915B7E7bb79C589835aAc6242d"
        }
    },
    AMH: {
        LUNA: {
            contract: "0xE7f4fF72122B0040eB31d6470D75cb2bFe4c32c5",
            tokenCa: "0x55cD6469F597452B5A7536e2CD98fDE4c1247ee4"
        },
        AIKEK: {
            contract: "0xb4c999e1cc0941b48e7589f7e85d677787C3Abd0",
            tokenCa: "0x681A09A902D9C7445b3B1Ab282C38D60c72F1f09"
        },
        MAYA: {
            contract: "0x2E72fa7C2F6EE084dde88eeD79CC6a49d0A788ba",
            tokenCa: "0x072915A43Ac255cdE1Fa568218E5b6b10d0CB10F"
        },
        LUCIEN: {
            contract: "0xeee9Cb0fafF1D9e7423BF87A341C70F58A1A0cc7",
            tokenCa: "0x444600d9fA140E9506D0cBC436Bffad3D5C3Febc"
        },
        ACOLYT: {
            contract: "0xeDaf82727b14faB44F3A9DBFD6500719b230D1C6",
            tokenCa: "0x79dacb99A8698052a9898E81Fdf883c29efb93cb"
        }
    },
    AVC: {
        VADER: {
            contract: "0x89a7843Dc8AFB914f5f23FA1B58d58C5821a6239",
            tokenCa: "0x731814e491571A2e9eE3c5b1F7f3b962eE8f4870"
        },
        ARBUS: {
            contract: "0xE502bAB730Bf3403e944f132B23ee5f1C2cEB653",
            tokenCa: "0xBDC27118Ca76B375C6887b0ff068aFb03DfC21A0"
        },
        BRO: {
            contract: "0x4E3d5DdaB1Ed4f18148c2B376CB58ed990C981F9",
            tokenCa: "0xc796E499CC8f599A2a8280825d8BdA92F7a895e0"
        },
        SWARM: {
            contract: "0xa17b17F999Baa5E572B75fd916A66c58b4ED6dE4",
            tokenCa: "0xea87169699dabd028a78d4B91544b4298086BAF6"
        },
        LOKY: {
            contract: "0xB7e36a77997Ac866A542Bd83cBc390D143897a01",
            tokenCa: "0x1A3e429D2D22149Cc61e0f539B112a227c844aa3"
        },
    }
}