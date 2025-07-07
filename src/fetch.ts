import { Block, ethers } from 'ethers';
import dotenv from 'dotenv';
import Bottleneck from 'bottleneck';

dotenv.config();

const virtuals = '0x0b3e328455c4059EEb9e3f84b5543F74E24e7E1b';   // ERC-20 token
const baseRpcUrl = process.env.BASE_RPC_URL || 'https://mainnet.base.org';
const provider = new ethers.JsonRpcProvider(baseRpcUrl);
const transferEventSignature = 'Transfer(address,address,uint256)';

const limiter = new Bottleneck({
    minTime: 1000, // 1 request per second
    maxConcurrent: 1,
});

const TIMEFRAMES = {
    ONE_DAY: 24 * 60 * 60,       // 24 hours
    ONE_WEEK: 7 * 24 * 60 * 60,  // 1 week
};

async function findBlockByTimestamp(targetTimestamp: number): Promise<number> {
    const latestBlock = await limiter.schedule(() => provider.getBlock('latest')) as Block;
    const latestBlockNumber = latestBlock.number;
    const latestTimestamp = latestBlock.timestamp;

    if (targetTimestamp >= latestTimestamp) {
        return latestBlockNumber;
    }

    let low = 0;
    let high = latestBlockNumber;

    while (low < high) {
        const mid = Math.floor((low + high) / 2);
        const block = await limiter.schedule(() => provider.getBlock(mid)) as Block;
        if (block.timestamp < targetTimestamp) {
            low = mid + 1;
        } else {
            high = mid;
        }
    }

    return low;
}

function getStartOfMonthTimestamp(): number {
    const now = new Date();
    const year = now.getUTCFullYear();
    const month = now.getUTCMonth();
    const startOfMonth = new Date(Date.UTC(year, month, 1, 0, 0, 0));
    return Math.floor(startOfMonth.getTime() / 1000);
}

async function getBlockNumberForTimeframe(timeframe: '24h' | '1w' | '1m', secondsAgo?: number): Promise<number> {
    if (timeframe === '1m') {
        const targetTimestamp = getStartOfMonthTimestamp();
        return findBlockByTimestamp(targetTimestamp);
    } else if (secondsAgo !== undefined) {
        const latestBlock = await limiter.schedule(() => provider.getBlock('latest')) as Block;
        const targetTimestamp = latestBlock.timestamp - secondsAgo;
        return findBlockByTimestamp(targetTimestamp);
    } else {
        throw new Error('Invalid call to getBlockNumberForTimeframe: secondsAgo is required for 24h/1w.');
    }
}

async function getTransferLogsForTimeframe(agentAddress: string, timeframe: '24h' | '1w' | '1m', timeframeSeconds?: number): Promise<ethers.Log[]> {
    let fromBlock: number;
    if (timeframe === '1m') {
        fromBlock = await getBlockNumberForTimeframe('1m');
    } else if (timeframeSeconds !== undefined) {
        fromBlock = await getBlockNumberForTimeframe(timeframe, timeframeSeconds);
    } else {
        throw new Error('Invalid call to getTransferLogsForTimeframe: timeframeSeconds is required for 24h/1w.');
    }

    const filter = {
        address: virtuals, // ERC-20 token
        topics: [
            ethers.keccak256(ethers.toUtf8Bytes(transferEventSignature)),
            null, // Any sender
            ethers.zeroPadValue(agentAddress, 32) // Recipient (agent)
        ],
        fromBlock: fromBlock,
        toBlock: 'latest'
    };

    return limiter.schedule(() => provider.getLogs(filter));
}

function calculateTotalTokensReceived(logs: ethers.Log[]): string {
    let total = BigInt(0);
    for (const log of logs) {
        const value = BigInt(log.data);
        total = total + value;
    }
    return ethers.formatUnits(total, 18);
}

export async function fetchTransactions(timeframe: '24h' | '1w' | '1m', agent: string): Promise<string> {
    try {
        let timeframeSeconds: number | undefined;
        if (timeframe !== '1m') {
            switch (timeframe) {
                case '24h':
                    timeframeSeconds = TIMEFRAMES.ONE_DAY;
                    break;
                case '1w':
                    timeframeSeconds = TIMEFRAMES.ONE_WEEK;
                    break;
                default:
                    throw new Error('Invalid timeframe. Use "24h", "1w", or "1m".');
            }
        }

        const logs = await getTransferLogsForTimeframe(agent, timeframe, timeframeSeconds);
        const total = calculateTotalTokensReceived(logs);
        return total;
    } catch (error) {
        console.error(`Error fetching transaction logs for ${timeframe}:`, error);
        return 'Error';
    }
}