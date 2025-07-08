import cron from 'node-cron'
import { fetchTransactions } from './fetch'
import axios from 'axios'
import { discordUrl, telegramBotToken, telegramChatId, map } from './constants'

async function send(
    map: {
        name: string,
        details: { contract: string, tokenCa: string },
        value: string 
    }[],
    timeframe: '24h' | '1w' | '1m',
    cluster: string,
    total?: boolean
) {
    let message: { dc: string, tg: string } = { dc: '', tg: '' }

    if (total) {
        let totalValue = 0
        for (const agent of map) {
            totalValue += parseFloat(agent.value || '0')
        }

        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)
        const month = (yesterday.getMonth() + 1).toString().padStart(2, '0')
        const day = yesterday.getDate().toString().padStart(2, '0')
        const year = yesterday.getFullYear().toString().slice(-2)
        const formattedDate = `${month}/${day}/${year}`
        message.dc = `**${formattedDate} Total Transaction Value (Unique Agents):\n**${totalValue.toFixed(4)}`
        message.tg = `*${formattedDate} Total Transaction Value (Unique Agents):\n*${totalValue.toFixed(4)}`
    }
    
    else {
        const summary = {
            dc: map.map(agent => `[${agent.name}](<https://www.dexscreener.com/base/${agent.details.tokenCa}>): *${agent.value}*`).join('\n'),
            tg: map.map(agent => `[${agent.name}](https://www.dexscreener.com/base/${agent.details.tokenCa}): _${agent.value}_`).join('\n')
        }

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

        message.dc = `**${timeframeString} ${cluster} Summary**\n${summary.dc}\n`
        message.tg = `*${timeframeString} ${cluster} Summary*:\n${summary.tg}\n`
    }

    if (discordUrl) {
        try {
            await axios.post(discordUrl, {
                content: message.dc,
                suppress_embeds: true
            })
            console.log('Successfully sent message to Discord webhook')
        } catch (error) {
            console.error('Error sending message to Discord webhook:', error)
        }
    } else {
        console.error('DISCORD_WEBHOOK_URL is not set')
    }

    if (telegramBotToken && telegramChatId) {
        try {
            await axios.post(`https://api.telegram.org/bot${telegramBotToken}/sendMessage`, {
                chat_id: telegramChatId,
                text: message.tg,
                parse_mode: 'Markdown',
                disable_web_page_preview: true
            })
            console.log('Successfully sent message to Telegram')
        } catch (error) {
            console.error('Error sending message to Telegram:', error)
        }
    } else {
        console.error('Telegram BOT_TOKEN or CHAT_ID is not set')
    }
}

async function executeAndSendTransactionSummary(timeframe: '24h' | '1w' | '1m') {
    let allAgents: { name: string, details: { contract: string, tokenCa: string }, value: string }[] = []
    let sendPromises: Promise<void>[] = []
    
    try {   // Automated Hedge Fund
        console.log(`Fetching AHF ${timeframe}`)
    
        let AHF: { name: string, details: { contract: string, tokenCa: string }, value: string }[] = []
        for (const [agentName, agentAddress] of Object.entries(map.AHF)) {
            console.log(`Fetching ${agentName}: ${agentAddress.contract}`)
            const value = await fetchTransactions(timeframe, agentAddress.contract)
            AHF.push({
                name: agentName,
                details: {
                    contract: agentAddress.contract,
                    tokenCa: agentAddress.tokenCa
                },
                value: value
            })
        }

        AHF.sort((a, b) => parseFloat(b.value) - parseFloat(a.value))
        sendPromises.push(send(AHF, timeframe, 'Hedge Fund'))
        allAgents.push(...AHF)
    } catch (error) {
        console.error('Error fetching AHF:', error)
    }

    try {   // Automated Media House
        console.log(`Fetching AMH ${timeframe}`)
        let AMH: { name: string, details: { contract: string, tokenCa: string }, value: string }[] = []
        for (const [agentName, agentAddress] of Object.entries(map.AMH)) {
            console.log(`Fetching ${agentName}: ${agentAddress.contract}`)
            const value = await fetchTransactions(timeframe, agentAddress.contract)
            AMH.push({
                name: agentName,
                details: {
                    contract: agentAddress.contract,
                    tokenCa: agentAddress.tokenCa
                },
                value: value
            })
        }

        AMH.sort((a, b) => parseFloat(b.value) - parseFloat(a.value))
        sendPromises.push(send(AMH, timeframe, 'Media House'))
        allAgents.push(...AMH)
    } catch (error) {
        console.error('Error fetching AMH:', error)
    }

    try {   // Automated Venture Capital
        console.log(`Fetching AVC ${timeframe}`)
        let AVC: { name: string, details: { contract: string, tokenCa: string }, value: string }[] = []
        for (const [agentName, agentAddress] of Object.entries(map.AVC)) {
            console.log(`Fetching ${agentName}: ${agentAddress.contract}`)
            const value = await fetchTransactions(timeframe, agentAddress.contract)
            AVC.push({
                name: agentName,
                details: {
                    contract: agentAddress.contract,
                    tokenCa: agentAddress.tokenCa
                },
                value: value
            })
        }

        AVC.sort((a, b) => parseFloat(b.value) - parseFloat(a.value))
        sendPromises.push(send(AVC, timeframe, 'Venture Capital'))
        allAgents.push(...AVC)

        
    } catch (error) {
        console.error('Error fetching AVC:', error)
    }

    if (timeframe === '24h') {
        // Remove duplicate agents
        const uniqueAgents = new Map<string, { name: string, details: { contract: string, tokenCa: string }, value: string }>()
        for (const agent of allAgents) {
            if (!uniqueAgents.has(agent.details.tokenCa)) {
                uniqueAgents.set(agent.details.tokenCa, agent)
            }
        }
        const finalUniqueAgents = Array.from(uniqueAgents.values())
        await Promise.all(sendPromises)
        await send(finalUniqueAgents, timeframe, 'Total', true)
    }    
}

async function main() {
    // Run once immediately on startup
    await executeAndSendTransactionSummary('24h')
    // await executeAndSendTransactionSummary('1w')
    // await executeAndSendTransactionSummary('1m')

    // Schedule monthly run on the 1st of each month at midnight UTC
    cron.schedule('0 0 1 * *', async () => await executeAndSendTransactionSummary('1m'), {
        timezone: 'UTC'
    })

    // Schedule weekly run every Monday at midnight UTC
    cron.schedule('0 0 * * 1', async () => await executeAndSendTransactionSummary('1w'), {
        timezone: 'UTC'
    })

    // Schedule daily run at midnight UTC
    cron.schedule('0 0 * * *', async () => await executeAndSendTransactionSummary('24h'), {
        timezone: 'UTC'
    })

    console.log('Scheduler started...')
}

main()