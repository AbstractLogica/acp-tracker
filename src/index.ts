import cron from 'node-cron'
import { fetchTransactions } from './fetch'
import axios from 'axios'
import dotenv from 'dotenv'
dotenv.config()

const url = process.env.DISCORD_WEBHOOK_URL
const map = {
    AHF: {
        AXR: "0x0b3e328455c4059EEb9e3f84b5543F74E24e7E1b",
        AIXBT: "0x9023dbe89FDD60851468eb8CD050B5cA1751C635",
        TRUST: "0x9B1c65eE0Fb8dC52ca331faAFb85Ac03332f951E",
        LOKY: "0xB7e36a77997Ac866A542Bd83cBc390D143897a01",
        WACH: "0xAd7FA8369417E2e608A1e215486cfb0D1Da90191",
        ATHENA: "0x0699646D95Aad629fB56202f14e2B61d07AD9D1c",
        SNAI: "0xa17b17F999Baa5E572B75fd916A66c58b4ED6dE4",
        VU: "0x665B253678765c5c53d73d9e7B0480a61f8F4D62",
        CERTAI: "0xBf5f46ABebCE87346fE2c8789b8B743940E98083",
        BRAIN: "0xa51AC6fE439ba7c29AD978a92Ef29BBeF2C313dd"
    },
    AMH: {
        LUNA: "0xE7f4fF72122B0040eB31d6470D75cb2bFe4c32c5",
        AIKEK: "0xb4c999e1cc0941b48e7589f7e85d677787C3Abd0",
        MAYA: "0x2E72fa7C2F6EE084dde88eeD79CC6a49d0A788ba",
        LUCIEN: "0xeee9Cb0fafF1D9e7423BF87A341C70F58A1A0cc7",
        MUSIC: "0x52D84Ac5c95d665f66F43F5379904F5FF1Cdc0a8",
        ACOLYTE: "0xeDaf82727b14faB44F3A9DBFD6500719b230D1C6"
    }
}

async function send(map: { name: string, value: string }[], timeframe: '24h' | '1w' | '1m', cluster: string) {
    const summary = map.map(agent => `${agent.name}: *${agent.value} $VIRTUAL*`).join('\n')

    let timeframeString;
    switch (timeframe) {
        case '24h':
            timeframeString = 'Daily'
            break
        case '1w':
            timeframeString = 'Weekly'
            break
        case '1m':
            timeframeString = 'Monthly'
            break
    }

    const message = `**${timeframeString} ${cluster} summary**\n\n${summary}`

    if (url) {
        try {
            await axios.post(url, {
                content: message,
            })
            console.log('Successfully sent message to Discord webhook')
        } catch (error) {
            console.error('Error sending message to Discord webhook:', error)
        }
    } else {
        console.error('DISCORD_WEBHOOK_URL is not set')
    }
}

async function executeAndSendTransactionSummary(timeframe: '24h' | '1w' | '1m') {
    try {
        console.log(`Fetching AHF ${timeframe}`)
    
        let AHF: { name: string, value: string }[] = []
        for (const [agentName, agentAddress] of Object.entries(map.AHF)) {
            console.log(`Fetching ${agentName}: ${agentAddress}`)
            const value = await fetchTransactions(timeframe, agentAddress)
            AHF.push({ name: agentName, value: value })
        }

        AHF.sort((a, b) => parseFloat(b.value) - parseFloat(a.value))
        send(AHF, timeframe, 'AHF')
    } catch (error) {
        console.error('Error fetching AHF:', error)
    }

    try {
        console.log(`Fetching AMH ${timeframe}`)
        let AMH: { name: string, value: string }[] = []
        for (const [agentName, agentAddress] of Object.entries(map.AMH)) {
            console.log(`Fetching ${agentName}: ${agentAddress}`)
            const value = await fetchTransactions(timeframe, agentAddress)
            AMH.push({ name: agentName, value: value })
        }

        AMH.sort((a, b) => parseFloat(b.value) - parseFloat(a.value))
        send(AMH, timeframe, 'AMH')
    } catch (error) {
        console.error('Error fetching AMH:', error)
    }
}

async function main() {
    // Run once immediately on startup
    await executeAndSendTransactionSummary('24h')
    await executeAndSendTransactionSummary('1w')
    await executeAndSendTransactionSummary('1m')

    // Schedule daily run at midnight UTC
    cron.schedule('0 0 * * *', async () => await executeAndSendTransactionSummary('24h'), {
        timezone: 'UTC'
    })

    // Schedule weekly run every Monday at midnight UTC
    cron.schedule('0 0 * * 1', async () => await executeAndSendTransactionSummary('1w'), {
        timezone: 'UTC'
    })

    // Schedule monthly run on the 1st of each month at midnight UTC
    cron.schedule('0 0 1 * *', async () => await executeAndSendTransactionSummary('1m'), {
        timezone: 'UTC'
    })

    console.log('Scheduler started...')
}

main()
