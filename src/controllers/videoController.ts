import { Request, Response } from "express";
import { videoFeedQuerySchema } from "../schemas/video";
import prisma from "../db/prisma";
import { ZodError } from "zod";
import { upload } from "../services/S3";
import { CustomRequest } from "../middleware/authenticate";
import { publishToRedis } from "../services/redis";

// Get videos for the feed
export const getVideoFeed = async (req: Request, res: Response) => {
    try {
        // Validate query parameters
        const queryParams = videoFeedQuerySchema.parse(req.query);

        const { page, limit, category } = queryParams;

        // Prepare the filtering and pagination logic
        const skip = (page - 1) * limit;
        const whereFilter = category ? { category } : {};

        const totalVideos = await prisma.video.count({
            where: whereFilter,
        });

        const videos = await prisma.video.findMany({
            where: whereFilter,
            skip,
            take: limit,
            include: {
                creator: {
                    select: {
                        id: true,
                        username: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        // Response structure
        let totalPages = Math.ceil(totalVideos / limit);

        totalPages = totalPages === 0 ? 1 : totalPages;

        res.status(200).json({
            videos: videos.map((video) => ({
                id: video.id,
                title: video.title,
                thumbnail_url: video.thumbnailUrl,
                creator: {
                    id: video.creator.id,
                    username: video.creator.username,
                },
                view_count: video.viewCount,
                created_at: video.createdAt.toISOString(),
            })),
            total_pages: totalPages,
            current_page: page,
        });
    } catch (error) {
        if (error instanceof ZodError) {
            res.status(400).json({ message: 'Invalid query parameters', error: error.message });
        } else {
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }
}

// Uplaod a video
export const uploadVideo = async (req: CustomRequest, res: Response) => {
    upload(req, res, async (err) => {
        if (err) {
            console.error('Error uploading file:', err);
            return res.status(400).json({ message: err.message });
        }

        try {
            const { title, description, category } = req.body;
            const file = (req as any).file;

            // Validation
            if (!file || !title || !description || !category) {
                return res.status(400).json({ message: 'All fields are required' });
            }

            const user = await prisma.user.findUnique({
                where: {
                    id: req.user!.id
                },
                select: {
                    channels: {
                        select: {
                            id: true
                        }
                    }
                }
            })

            if (!user?.channels || !user?.channels?.id) {
                res.status(400).json({ message: 'Create a channel first' });
                return;
            }

            // Save video data in the database
            const video = await prisma.video.create({
                data: {
                    creatorId: req.user!.id,
                    channelId: user.channels.id,
                    title,
                    description,
                    category,
                    file_path: file.location,
                    status: 'PROCESSING',
                    qualities: ['240p', '480p', '720p'],
                },
            });

            // Return the response
            res.status(201).json({
                id: video.id,
                title: video.title,
                processing_status: video.status,
                qualities: video.qualities,
            });
        } catch (error) {
            console.error('Error saving video - ', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    });
};

// Get video details for a partivular video 
export const getVideoDetails = async (req: Request, res: Response) => {
    try {
        const { videoId } = req.params;

        // Fetch the video details from the database using Prisma
        const video = await prisma.video.findUnique({
            where: { id: videoId },
            include: {
                creator: true,
            },
        });

        if (!video) {
            res.status(404).json({ message: 'Video not found' });
            return
        }

        // If video is still processing, return the processing status
        if (video.status === 'PROCESSING') {
            res.status(200).json({
                id: video.id,
                title: video.title,
                description: video.description,
                creator: {
                    id: video.creator.id,
                    username: video.creator.username,
                },
                status: video.status,
            });
            return;
        }

        // If video has been transcoded, return transcoded URLs and other details
        if (video.status === 'COMPLETED' && video.videoUrls) {
            res.status(200).json({
                id: video.id,
                title: video.title,
                description: video.description,
                creator: {
                    id: video.creator.id,
                    username: video.creator.username,
                },
                video_urls: video.videoUrls,
                current_timestamp: video.status,
                view_count: video.viewCount,
                status: video.status,
            });
            return
        }

        // In case the video has an unexpected status
        res.status(400).json({ message: 'Unexpected video status' });
        return
    } catch (error) {
        console.error('Error fetching video details:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

// Update TimeStamp of a video
export const updateTimestamp = async (req: Request, res: Response) => {
    try {
        const { videoId } = req.params;
        const { timestamp } = req.body;

        // Validate the timestamp value
        if (timestamp < 0) {
            res.status(400).json({ message: 'Time cannot be negative' });
            return
        }

        // Fetch the video details to check its duration
        const video = await prisma.video.findUnique({
            where: { id: videoId },
            select: {
                duration: true
            }
        });

        if (!video) {
            res.status(404).json({ message: 'Video not found' });
            return
        }

        // Validate that the timestamp is not longer than the video duration
        if (video.duration && timestamp > video.duration) {
            res.status(400).json({ message: 'Timestamp cannot be longer than the video duration' });
            return
        }

        // Publish the updated Time to the pub sub 
        await publishToRedis(videoId, timestamp)

        res.status(201).json({ message: 'Timestamp updated' });
        return
    } catch (error) {
        console.error('Error updating timestamp:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}