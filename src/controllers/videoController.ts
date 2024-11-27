import { Request, Response } from "express";
import { videoFeedQuerySchema } from "../schemas/video";
import prisma from "../db/prisma";
import { ZodError } from "zod";

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