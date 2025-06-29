// Mock Prisma implementation for WebContainer
// Since native binaries can't run in the browser environment,
// we need to mock the Prisma client to prevent runtime errors.

class MockPrismaClient {
  // Mock data to simulate a database
  private mockData: {
    user: any[];
    conversation: any[];
    message: any[];
    vectorContent: any[];
    culturalInsight: any[];
    userRating: any[];
    qualityAudit: any[];
  } = {
    user: [],
    conversation: [],
    message: [],
    vectorContent: [],
    culturalInsight: [],
    userRating: [],
    qualityAudit: []
  };

  // Mock the user table
  user = {
    findUnique: async () => null,
    findFirst: async () => null,
    findMany: async () => [],
    create: async (args: any) => ({ id: 'mock-user-id', ...args.data }),
    update: async (args: any) => ({ id: 'mock-user-id', ...args.data }),
    upsert: async (args: any) => ({ id: 'mock-user-id', ...args.data }),
    delete: async () => ({ id: 'mock-user-id' })
  };

  // Mock the conversation table
  conversation = {
    findUnique: async () => null,
    findFirst: async () => null,
    findMany: async () => [],
    create: async (args: any) => ({ id: `mock-conversation-${Date.now()}`, ...args.data }),
    update: async (args: any) => ({ id: 'mock-conversation-id', ...args.data }),
    upsert: async (args: any) => ({ id: 'mock-conversation-id', ...args.data }),
    delete: async () => ({ id: 'mock-conversation-id' })
  };

  // Mock the message table
  message = {
    findUnique: async () => null,
    findFirst: async () => null,
    findMany: async () => [],
    create: async (args: any) => ({ id: `mock-message-${Date.now()}`, ...args.data }),
    update: async (args: any) => ({ id: 'mock-message-id', ...args.data }),
    upsert: async (args: any) => ({ id: 'mock-message-id', ...args.data }),
    delete: async () => ({ id: 'mock-message-id' })
  };

  // Mock the vectorContent table
  vectorContent = {
    findUnique: async () => null,
    findFirst: async () => null,
    findMany: async () => [],
    create: async (args: any) => ({ id: `mock-vector-${Date.now()}`, ...args.data }),
    update: async (args: any) => ({ id: 'mock-vector-id', ...args.data }),
    upsert: async (args: any) => ({ id: 'mock-vector-id', ...args.data }),
    delete: async () => ({ id: 'mock-vector-id' }),
    deleteMany: async () => ({ count: 0 }),
    groupBy: async () => []
  };

  // Mock the culturalInsight table
  culturalInsight = {
    findUnique: async () => null,
    findFirst: async () => null,
    findMany: async () => [],
    create: async (args: any) => ({ id: `mock-insight-${Date.now()}`, ...args.data }),
    update: async (args: any) => ({ id: 'mock-insight-id', ...args.data }),
    upsert: async (args: any) => ({ id: 'mock-insight-id', ...args.data }),
    delete: async () => ({ id: 'mock-insight-id' })
  };

  // Mock the userRating table
  userRating = {
    findUnique: async () => null,
    findFirst: async () => null,
    findMany: async () => [],
    create: async (args: any) => ({ id: `mock-rating-${Date.now()}`, ...args.data }),
    update: async (args: any) => ({ id: 'mock-rating-id', ...args.data }),
    upsert: async (args: any) => ({ id: 'mock-rating-id', ...args.data }),
    delete: async () => ({ id: 'mock-rating-id' })
  };

  // Mock the qualityAudit table
  qualityAudit = {
    findUnique: async () => null,
    findFirst: async () => null,
    findMany: async () => [],
    create: async (args: any) => ({ id: `mock-audit-${Date.now()}`, ...args.data }),
    update: async (args: any) => ({ id: 'mock-audit-id', ...args.data }),
    upsert: async (args: any) => ({ id: 'mock-audit-id', ...args.data }),
    delete: async () => ({ id: 'mock-audit-id' })
  };

  // Mock raw queries
  $queryRaw = async () => [];
  $queryRawUnsafe = async () => [];
  $executeRaw = async () => 0;
  $executeRawUnsafe = async () => 0;
  $transaction = async (fn: any) => fn(this);

  // Mock connection methods
  $connect = async () => {};
  $disconnect = async () => {};
  $on = () => {};
}

const prismaClientSingleton = () => {
  console.log('Creating mock Prisma client for WebContainer environment');
  return new MockPrismaClient();
};

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientSingleton | undefined
};

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;