import { Request, Response } from "express";
import { channelCreateSchema } from "../schemas/channel";
import prisma from "../db/prisma";
import { ZodError } from "zod";
import { CustomRequest } from "../middleware/authenticate";

export const createChannel = async (req: CustomRequest, res: Response) => {
  try {
    // Validate request body
    const { name, description, slug } = channelCreateSchema.parse(req.body);

    // Check if user already has a channel
    const existingChannel = await prisma.channel.findUnique({
      where: { userId: req.user!.id },
    });

    if (existingChannel) {
      res.status(411).json({ message: "User already has a channel" });
      return;
    }

    // Check if slug already exists
    const existingSlug = await prisma.channel.findUnique({
      where: { slug },
    });

    if (existingSlug) {
      res.status(409).json({ message: "Slug already exists" });
      return;
    }

    // Create channel
    const newChannel = await prisma.channel.create({
      data: {
        name,
        description,
        slug,
        userId: req.user!.id,
      },
    });

    res.status(201).json({
      message: "Channel successfully created",
      channel: newChannel,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      console.log(error.errors);
      res.status(400).json({
        message: "Validation errors",
        error: error.errors.map((error) => error.message),
      });
    } else {
      res.status(500).json({ message: "Internal Sever Error" });
    }
  }
};

export const getChannelDetails = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;

    // Fetch channel details and associated videos
    const channel = await prisma.channel.findUnique({
      where: { slug },
      include: {
        videos: {
          select: {
            id: true,
            title: true,
            thumbnailUrl: true,
          },
        },
      },
    });

    if (!channel) {
      res.status(404).json({ message: "Channel not found" });
      return;
    }

    // Construct response
    const response = {
      id: channel.id,
      name: channel.name,
      description: channel.description,
      subscriber_count: channel.subscribers,
      videos: channel.videos,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("Error fetching channel details:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
