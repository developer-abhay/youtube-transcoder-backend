import { createClient } from 'redis'

const publisher = createClient()


export async function initRedis() {
    try {
        await publisher.connect()
        console.log('Connected to Redis')
    } catch (error) {
        console.log('Error Connecting to Redis')
    }
}


export async function publishToRedis(videoId: string, timestamp: number) {
    try {
        await publisher.publish(videoId, JSON.stringify({ timestamp }))

    } catch (error: unknown) {
        console.log(error)
    }
}