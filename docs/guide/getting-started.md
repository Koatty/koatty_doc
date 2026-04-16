# Getting Started

Get up and running with Koatty in 5 minutes.

## Prerequisites

- Node.js >= 18.0.0
- pnpm >= 9.0.0 (recommended)

## Quick Start

### 1. Create a New Project

```bash
# Using pnpm
pnpm create koatty-app my-project

# Navigate to project directory
cd my-project

# Install dependencies
pnpm install
```

### 2. Project Structure

```
my-project/
├── src/
│   ├── config/          # Configuration files
│   │   ├── config.ts    # App configuration
│   │   ├── server.ts    # Server settings
│   │   ├── router.ts    # Router configuration
│   │   ├── middleware.ts # Middleware config
│   │   └── plugin.ts    # Plugin config
│   ├── controller/      # Controllers
│   ├── service/         # Business logic
│   ├── middleware/      # Custom middleware
│   └── dto/             # Data Transfer Objects
├── logs/                # Log files
├── static/              # Static files
└── package.json
```

### 3. Create Your First Controller

```typescript
// src/controller/HomeController.ts
import { Controller, Get } from 'koatty';

@Controller('/')
export class HomeController {
  @Get('/')
  async index() {
    return 'Hello Koatty!';
  }

  @Get('/json')
  async json() {
    return {
      message: 'Hello Koatty!',
      timestamp: Date.now()
    };
  }
}
```

### 4. Configure Server

```typescript
// src/config/server.ts
export default {
  hostname: '127.0.0.1',
  port: 3000,
  protocol: 'http',  // 'http' | 'https' | 'http2' | 'http3' | 'grpc' | 'ws' | 'graphql'
  trace: false
};
```

### 5. Start the Server

```bash
# Development mode
pnpm dev

# Production mode
pnpm start
```

Visit `http://localhost:3000` to see your application running!

## Multi-Protocol Support

Koatty supports running multiple protocols simultaneously:

```typescript
// src/config/server.ts
export default {
  hostname: '127.0.0.1',
  port: [3000, 50051],  // HTTP on 3000, gRPC on 50051
  protocol: ['http', 'grpc']
};

// src/config/router.ts
export default {
  ext: {
    http: {},
    grpc: {
      protoFile: './resource/proto/service.proto',
      poolSize: 10
    }
  }
};
```

## Dependency Injection

Use the `@Autowired` decorator for dependency injection:

```typescript
// src/service/UserService.ts
import { Service } from 'koatty';

@Service()
export class UserService {
  async getUser(id: string) {
    return { id, name: 'John Doe' };
  }
}

// src/controller/UserController.ts
import { Controller, Get, Autowired } from 'koatty';
import { UserService } from '../service/UserService';

@Controller('/user')
export class UserController {
  @Autowired()
  private userService: UserService;

  @Get('/:id')
  async getUser() {
    const id = this.ctx.param.id;
    return this.userService.getUser(id);
  }
}
```

## Configuration Injection

Use the `@Config` decorator to inject configuration values:

```typescript
// src/config/config.ts
export default {
  app: {
    name: 'MyApp',
    version: '1.0.0'
  }
};

// In your service/controller
import { Config } from 'koatty';

@Service()
export class MyService {
  @Config('app')
  private appConfig: any;

  getAppName() {
    return this.appConfig.name;
  }
}
```

## Next Steps

- [Configuration Guide](./config.md) - Learn about configuration options
- [Lifecycle Hooks](./lifecycle.md) - Understand the application lifecycle
- [Multi-Protocol Setup](../protocols/http.md) - Configure HTTP/2, HTTP/3, and more
- [Migration from v3](../migration/v3-to-v4.md) - Upgrade from Koatty v3

## Need Help?

- [GitHub Issues](https://github.com/koatty/koatty/issues)
- [Documentation](https://koatty.github.io)
