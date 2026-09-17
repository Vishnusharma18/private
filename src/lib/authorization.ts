import { getSession } from "./auth";
import { prisma } from "./prisma";

export interface AuthorizationResult {
  authorized: boolean;
  user?: any;
  membership?: any;
  error?: string;
  status?: number;
}

export async function authorizeSpaceAccess(
  spaceId: string,
  requiredRoles: string[] = ["OWNER", "ADMIN", "MEMBER"]
): Promise<AuthorizationResult> {
  const session = await getSession();

  if (!session) {
    return { authorized: false, error: "Authentication required.", status: 401 };
  }

  const membership = await prisma.membership.findUnique({
    where: {
      spaceId_userId: {
        spaceId,
        userId: session.id,
      },
    },
    include: {
      user: {
        select: { id: true, email: true, displayName: true, username: true, avatarUrl: true },
      },
      space: true,
    },
  });

  if (!membership || membership.status !== "ACTIVE") {
    return { authorized: false, error: "Access denied. You are not an active member of this space.", status: 403 };
  }

  if (!requiredRoles.includes(membership.role)) {
    return { authorized: false, error: "You do not have required permissions in this space.", status: 403 };
  }

  return { authorized: true, user: session, membership };
}
