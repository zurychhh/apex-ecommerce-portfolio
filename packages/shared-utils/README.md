# @apex/shared-utils

Shared utility functions for logging, formatting, and common operations.

## Usage

### Logger

```typescript
import { logger } from '@apex/shared-utils';

logger.info('Shop installed', { shopDomain: 'example.myshopify.com' });
logger.error('Failed to sync', new Error('Connection timeout'));
logger.warn('Rate limit approaching', { remaining: 10 });
logger.debug('API request', { url: '/api/products' }); // Only in dev
```

### Formatters

```typescript
import {
  formatMoney,
  formatDate,
  formatDateTime,
  formatPercent,
  truncate,
  slugify
} from '@apex/shared-utils';

// Money
formatMoney(4999); // "$49.99"
formatMoney(4999, 'EUR'); // "€49.99"

// Dates
formatDate(new Date()); // "Dec 19, 2025"
formatDateTime(new Date()); // "Dec 19, 2025, 3:45 PM"

// Percent
formatPercent(0.1234); // "12%"
formatPercent(0.1234, 2); // "12.34%"

// Text
truncate('Long text here', 10); // "Long text..."
slugify('Hello World!'); // "hello-world"
```

## Functions

### Logger
- `info(message, meta?)` - Info logs
- `error(message, error?)` - Error logs
- `warn(message, meta?)` - Warning logs
- `debug(message, meta?)` - Debug logs (dev only)

### Formatters
- `formatMoney(cents, currency?)` - Format cents to currency
- `formatDate(date)` - Format date (no time)
- `formatDateTime(date)` - Format date with time
- `formatPercent(value, decimals?)` - Format decimal to percent
- `truncate(str, length)` - Truncate with ellipsis
- `slugify(str)` - Convert to URL-friendly slug

## Adding More Utils

As patterns emerge, add more utilities here:
- Validation helpers
- API wrappers
- Data transformers
- etc.
