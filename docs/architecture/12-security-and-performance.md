# 12. Security and Performance

## Security Considerations

### Input Validation
- **All API inputs validated with Zod schemas** before processing
- **SQL Injection Prevention**: Prisma ORM uses parameterized queries
- **XSS Prevention**: React escapes output by default; avoid `dangerouslySetInnerHTML`

### Environment Variables
- **Never commit `.env` files** to Git
- **Use `.env.example`** with dummy values for reference
- **Production secrets** managed in Vercel and Railway dashboards

### CORS Configuration
```typescript
// apps/backend/src/server.ts
import cors from 'cors';

const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173'];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));
```

### Content Security Policy (CSP)
- **Helmet.js** for basic security headers
- **CSP Header** to restrict script sources (prevent XSS)

```typescript
import helmet from 'helmet';

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));
```

### Rate Limiting (Post-MVP)
- Use `express-rate-limit` to prevent abuse
- Example: 100 requests per 15 minutes per IP

### HTTPS
- **Development**: HTTP acceptable
- **Production**: Vercel and Railway enforce HTTPS automatically

## Performance Optimizations

### Frontend Performance

**Code Splitting:**
- Vite automatically splits chunks
- Use lazy loading for routes:
  ```typescript
  const OrdersPage = React.lazy(() => import('./pages/Orders'));
  ```

**Image Optimization:**
- Serve images in modern formats (WebP)
- Use responsive images with `srcset`

**Caching:**
- Vercel CDN caches static assets
- Browser caching for API responses (Cache-Control headers)

**Bundle Size:**
- Monitor with `vite-plugin-bundle-visualizer`
- Tree-shake unused code
- Minimize dependencies

### Backend Performance

**Database Query Optimization:**
- Use Prisma indexes on frequently queried fields (`status`, `driverId`, `createdAt`)
- Use `select` to fetch only needed fields:
  ```typescript
  prisma.order.findMany({
    select: { id: true, status: true, customerName: true },
  });
  ```
- Use `include` judiciously (avoid N+1 queries)

**Response Caching (Future):**
- Cache frequently accessed data (e.g., driver list) with Redis
- Invalidate cache on updates

**Connection Pooling:**
- Prisma handles connection pooling automatically
- Configure pool size for production:
  ```
  DATABASE_URL="postgresql://user:pass@host:5432/db?connection_limit=10"
  ```

**Pagination (Future):**
- Implement cursor-based pagination for large datasets
- Example:
  ```typescript
  prisma.order.findMany({
    take: 20,
    skip: 0,
    orderBy: { createdAt: 'desc' },
  });
  ```

### Map Performance

**Marker Clustering:**
- Use Leaflet MarkerCluster plugin for many markers
- Reduces DOM nodes and improves rendering

**Lazy Load Maps:**
- Only load map components when needed (route lazy loading)

**Throttle Map Updates:**
- Avoid re-rendering map on every polling cycle
- Update only when data changes

## Monitoring & Metrics

**Key Metrics to Track:**
- **Response Time**: API endpoint latency (p50, p95, p99)
- **Error Rate**: Percentage of requests returning 5xx errors
- **Database Query Time**: Slow query detection
- **Frontend Load Time**: Time to Interactive (TTI)

**Tools (Post-MVP):**
- **Railway Metrics**: Built-in CPU, memory, request metrics
- **Vercel Analytics**: Frontend performance monitoring
- **Custom Logging**: Winston structured logs with request IDs for tracing

---
