import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Clear existing
  await prisma.notification.deleteMany();
  await prisma.reaction.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.albumMedia.deleteMany();
  await prisma.album.deleteMany();
  await prisma.postMedia.deleteMany();
  await prisma.media.deleteMany();
  await prisma.post.deleteMany();
  await prisma.event.deleteMany();
  await prisma.invitation.deleteMany();
  await prisma.membership.deleteMany();
  await prisma.space.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("password123", 10);

  // Create Users
  const alex = await prisma.user.create({
    data: {
      email: "alex@example.com",
      username: "alex",
      displayName: "Alex Rivera",
      bio: "Photography enthusiast & travel lover.",
      passwordHash,
    },
  });

  const sarah = await prisma.user.create({
    data: {
      email: "sarah@example.com",
      username: "sarah",
      displayName: "Sarah Chen",
      bio: "Exploring nature & writing stories.",
      passwordHash,
    },
  });

  const marcus = await prisma.user.create({
    data: {
      email: "marcus@example.com",
      username: "marcus",
      displayName: "Marcus Vance",
      bio: "Coffee aficionado and foodie.",
      passwordHash,
    },
  });

  // Create Space
  const space = await prisma.space.create({
    data: {
      name: "The Wandering Crew",
      description: "Our private memory journal for weekend road trips and gatherings.",
      ownerId: alex.id,
    },
  });

  // Add Memberships
  await prisma.membership.createMany({
    data: [
      { spaceId: space.id, userId: alex.id, role: "OWNER", status: "ACTIVE" },
      { spaceId: space.id, userId: sarah.id, role: "ADMIN", status: "ACTIVE" },
      { spaceId: space.id, userId: marcus.id, role: "MEMBER", status: "ACTIVE" },
    ],
  });

  // Create Posts / Memories
  const memory1 = await prisma.post.create({
    data: {
      spaceId: space.id,
      authorId: alex.id,
      type: "MEMORY",
      content: "Unforgettable sunset hike at Mount Rainier last weekend! The view was absolutely unreal.",
      status: "PUBLISHED",
    },
  });

  const story1 = await prisma.post.create({
    data: {
      spaceId: space.id,
      authorId: sarah.id,
      type: "STORY",
      title: "The Summer Camping Trip Chronicles",
      content: "It all started when Marcus accidentally packed salt instead of sugar for the morning campfire coffee. Despite the bumpy start, staying under the starry skies reminded us all why we make time for these annual escapes...",
      status: "PUBLISHED",
    },
  });

  // Create Comments
  await prisma.comment.create({
    data: {
      postId: memory1.id,
      authorId: sarah.id,
      body: "Still can't get over how amazing that summit looked!",
    },
  });

  await prisma.comment.create({
    data: {
      postId: memory1.id,
      authorId: marcus.id,
      body: "Next time we need to bring extra hot chocolate for the top!",
    },
  });

  // Create Reactions
  await prisma.reaction.create({
    data: {
      postId: memory1.id,
      userId: sarah.id,
      type: "HEART",
    },
  });

  await prisma.reaction.create({
    data: {
      postId: memory1.id,
      userId: marcus.id,
      type: "LIKE",
    },
  });

  // Create Event
  await prisma.event.create({
    data: {
      spaceId: space.id,
      creatorId: alex.id,
      title: "Annual Autumn Cabin Getaway",
      description: "Renting a cozy cabin by the lake for our group reunion.",
      eventDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  // Create Album
  await prisma.album.create({
    data: {
      spaceId: space.id,
      creatorId: sarah.id,
      name: "Road Trip 2025",
      description: "Collection of all highlights from our coastal drive.",
    },
  });

  console.log("Database seeded successfully!");
  console.log("Test accounts available:");
  console.log("1. Email: alex@example.com | Password: password123");
  console.log("2. Email: sarah@example.com | Password: password123");
  console.log("3. Email: marcus@example.com | Password: password123");
}

main()
  .catch((e) => {
    console.error("Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
