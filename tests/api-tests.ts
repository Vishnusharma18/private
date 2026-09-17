import assert from "assert";
import { prisma } from "../src/lib/prisma";
import bcrypt from "bcryptjs";

async function runTests() {
  console.log("=== Starting Automated PRD Verification Tests ===");

  // Test 1: Verify Seed Users
  console.log("Test 1: Verify Seed Users...");
  const users = await prisma.user.findMany();
  assert(users.length >= 3, "Expected at least 3 seed users");
  console.log("✓ Seed users verified:", users.map((u) => u.username).join(", "));

  // Test 2: Verify Space Membership & Roles
  console.log("Test 2: Verify Space & Memberships...");
  const space = await prisma.space.findFirst({
    include: { memberships: true },
  });
  assert(space, "Expected at least one seed space");
  assert.strictEqual(space.memberships.length, 3, "Expected 3 members in space");
  console.log(`✓ Space '${space.name}' has 3 active members.`);

  // Test 3: Create Post & Add Reaction & Comment
  console.log("Test 3: Post, Comment, Reaction CRUD...");
  const alex = users.find((u) => u.username === "alex")!;
  const newPost = await prisma.post.create({
    data: {
      spaceId: space.id,
      authorId: alex.id,
      type: "MEMORY",
      content: "Automated test memory entry",
      status: "PUBLISHED",
    },
  });

  const comment = await prisma.comment.create({
    data: {
      postId: newPost.id,
      authorId: alex.id,
      body: "Test comment",
    },
  });
  assert.strictEqual(comment.body, "Test comment");

  const reaction = await prisma.reaction.create({
    data: {
      postId: newPost.id,
      userId: alex.id,
      type: "HEART",
    },
  });
  assert.strictEqual(reaction.type, "HEART");

  console.log("✓ Post, Comment, and Reaction created successfully.");

  // Test 4: Invitation Token Generation
  console.log("Test 4: Invitation handling...");
  const inviteToken = `test-token-${Date.now()}`;
  const invite = await prisma.invitation.create({
    data: {
      spaceId: space.id,
      inviterId: alex.id,
      token: inviteToken,
      expiresAt: new Date(Date.now() + 86400000),
    },
  });
  assert.strictEqual(invite.token, inviteToken);
  console.log("✓ Invitation token created successfully.");

  // Cleanup test data
  await prisma.reaction.delete({ where: { id: reaction.id } });
  await prisma.comment.delete({ where: { id: comment.id } });
  await prisma.post.delete({ where: { id: newPost.id } });
  await prisma.invitation.delete({ where: { id: invite.id } });

  console.log("=== All Tests Passed Successfully! ===");
}

runTests()
  .catch((err) => {
    console.error("Test failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
