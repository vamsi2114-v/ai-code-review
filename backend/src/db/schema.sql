-- ============================================================
-- CodeReview AI — Full Database Setup
-- Schema + Sample Seed Data
-- Seeded users all share password: Test@1234
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  project_name VARCHAR(255) NOT NULL,
  description TEXT,
  language VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  title VARCHAR(255),
  language VARCHAR(50) NOT NULL,
  source_code TEXT NOT NULL,
  file_name VARCHAR(255),
  overall_score INTEGER DEFAULT 0,
  summary TEXT,
  total_issues INTEGER DEFAULT 0,
  critical_count INTEGER DEFAULT 0,
  warning_count INTEGER DEFAULT 0,
  info_count INTEGER DEFAULT 0,
  lines_of_code INTEGER DEFAULT 0,
  num_functions INTEGER DEFAULT 0,
  num_classes INTEGER DEFAULT 0,
  cyclomatic_complexity INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS review_findings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID REFERENCES reviews(id) ON DELETE CASCADE,
  severity VARCHAR(20) NOT NULL,
  category VARCHAR(50),
  issue VARCHAR(500) NOT NULL,
  explanation TEXT,
  suggested_fix TEXT,
  file_name VARCHAR(255),
  line_number INTEGER,
  code_snippet TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reviews_user ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_created ON reviews(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_findings_review ON review_findings(review_id);

-- ============================================================

-- ------------------------------------------------------------
-- USERS
-- ------------------------------------------------------------
INSERT INTO users (id, name, email, password, avatar_url, bio, created_at, updated_at) VALUES
('11111111-1111-1111-1111-111111111111', 'Vamsi Krishna', 'vamsi@example.com', '$2b$10$HvAhbJHbZWHYGrxN5O6MFeyRInoomMsxkQuYaHH5zGoQB.JO4.BUi', 'https://i.pravatar.cc/150?img=1', 'Full-stack developer. Building production-grade tools and learning in public.', NOW() - INTERVAL '60 days', NOW() - INTERVAL '2 days'),
('22222222-2222-2222-2222-222222222222', 'Ananya Rao', 'ananya.rao@example.com', '$2b$10$HvAhbJHbZWHYGrxN5O6MFeyRInoomMsxkQuYaHH5zGoQB.JO4.BUi', 'https://i.pravatar.cc/150?img=5', 'Backend engineer focused on Node.js and distributed systems.', NOW() - INTERVAL '45 days', NOW() - INTERVAL '5 days'),
('33333333-3333-3333-3333-333333333333', 'Rahul Mehta', 'rahul.mehta@example.com', '$2b$10$HvAhbJHbZWHYGrxN5O6MFeyRInoomMsxkQuYaHH5zGoQB.JO4.BUi', 'https://i.pravatar.cc/150?img=12', 'Python dev, ML hobbyist, occasional open-source contributor.', NOW() - INTERVAL '30 days', NOW() - INTERVAL '1 day'),
('44444444-4444-4444-4444-444444444444', 'Sneha Iyer', 'sneha.iyer@example.com', '$2b$10$HvAhbJHbZWHYGrxN5O6MFeyRInoomMsxkQuYaHH5zGoQB.JO4.BUi', 'https://i.pravatar.cc/150?img=9', 'Frontend engineer. React, TypeScript, and design systems.', NOW() - INTERVAL '20 days', NOW() - INTERVAL '3 hours'),
('55555555-5555-5555-5555-555555555555', 'Arjun Nair', 'arjun.nair@example.com', '$2b$10$HvAhbJHbZWHYGrxN5O6MFeyRInoomMsxkQuYaHH5zGoQB.JO4.BUi', 'https://i.pravatar.cc/150?img=15', 'Java/Spring Boot backend developer, 2 years experience.', NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days')
ON CONFLICT (email) DO NOTHING;

-- ------------------------------------------------------------
-- PROJECTS
-- ------------------------------------------------------------
INSERT INTO projects (id, user_id, project_name, description, language, created_at) VALUES
('aaaaaaaa-0001-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'MeterFlow', 'API billing and metering platform with rate limiting and Razorpay integration.', 'JavaScript', NOW() - INTERVAL '55 days'),
('aaaaaaaa-0002-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'DocSign SaaS', 'Document signature platform with drag-and-drop field placement.', 'TypeScript', NOW() - INTERVAL '25 days'),
('aaaaaaaa-0003-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'Order Service', 'Microservice handling order lifecycle for an e-commerce backend.', 'JavaScript', NOW() - INTERVAL '40 days'),
('aaaaaaaa-0004-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', 'DataPipe', 'ETL pipeline scripts for cleaning and transforming CSV datasets.', 'Python', NOW() - INTERVAL '28 days'),
('aaaaaaaa-0005-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', 'ML Experiment Tracker', 'Small Flask app to log and compare model training runs.', 'Python', NOW() - INTERVAL '15 days'),
('aaaaaaaa-0006-4444-4444-444444444444', '44444444-4444-4444-4444-444444444444', 'Dashboard UI Kit', 'Reusable React component library for internal admin dashboards.', 'TypeScript', NOW() - INTERVAL '18 days'),
('aaaaaaaa-0007-5555-5555-555555555555', '55555555-5555-5555-5555-555555555555', 'Inventory API', 'Spring Boot REST API for warehouse inventory management.', 'Java', NOW() - INTERVAL '9 days')
ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------
-- REVIEWS
-- ------------------------------------------------------------
INSERT INTO reviews (
  id, user_id, project_id, title, language, source_code, file_name,
  overall_score, summary, total_issues, critical_count, warning_count, info_count,
  lines_of_code, num_functions, num_classes, cyclomatic_complexity, status,
  created_at, updated_at
) VALUES

('bbbbbbbb-0001-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-0001-1111-1111-111111111111',
 'Rate limiter middleware review', 'JavaScript',
 'const rateLimiter = (req, res, next) => {
  const key = req.ip;
  const current = cache.get(key) || 0;
  if (current > 100) {
    return res.status(429).send("Too many requests");
  }
  cache.set(key, current + 1);
  next();
};',
 'rateLimiter.js', 72,
 'Functional sliding window logic but lacks TTL handling and has a minor race condition under concurrent requests.',
 4, 1, 2, 1, 48, 1, 0, 3, 'completed', NOW() - INTERVAL '50 days', NOW() - INTERVAL '50 days'),

('bbbbbbbb-0002-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-0001-1111-1111-111111111111',
 'Razorpay webhook handler', 'JavaScript',
 'app.post("/webhook", (req, res) => {
  const signature = req.headers["x-razorpay-signature"];
  const body = JSON.stringify(req.body);
  const expected = crypto.createHmac("sha256", secret).update(body).digest("hex");
  if (signature === expected) {
    processPayment(req.body);
  }
  res.sendStatus(200);
});',
 'webhookHandler.js', 65,
 'Signature check uses non-constant-time comparison, and 200 is returned even on verification failure, masking spoofed requests.',
 5, 2, 2, 1, 62, 1, 0, 4, 'completed', NOW() - INTERVAL '38 days', NOW() - INTERVAL '38 days'),

('bbbbbbbb-0003-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-0002-1111-1111-111111111111',
 'PDF signature embedding logic', 'TypeScript',
 'async function embedSignature(pdfBytes: Uint8Array, sig: SignatureData) {
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const page = pdfDoc.getPage(sig.pageIndex);
  page.drawImage(await pdfDoc.embedPng(sig.imageData), {
    x: sig.x, y: sig.y, width: sig.width, height: sig.height,
  });
  return pdfDoc.save();
}',
 'embedSignature.ts', 88,
 'Clean implementation overall; missing bounds validation for coordinates and no error handling for malformed PDFs.',
 2, 0, 1, 1, 34, 1, 0, 2, 'completed', NOW() - INTERVAL '20 days', NOW() - INTERVAL '20 days'),

('bbbbbbbb-0004-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'aaaaaaaa-0003-2222-2222-222222222222',
 'Order state transition function', 'JavaScript',
 'function updateOrderStatus(order, newStatus) {
  order.status = newStatus;
  db.query("UPDATE orders SET status = ? WHERE id = ?", [newStatus, order.id]);
  return order;
}',
 'orderService.js', 54,
 'No validation of allowed state transitions, SQL query not awaited, and function mutates input object directly.',
 6, 2, 3, 1, 40, 1, 0, 2, 'completed', NOW() - INTERVAL '35 days', NOW() - INTERVAL '35 days'),

('bbbbbbbb-0005-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'aaaaaaaa-0003-2222-2222-222222222222',
 'Inventory reservation logic', 'JavaScript',
 'async function reserveStock(productId, qty) {
  const product = await Product.findById(productId);
  if (product.stock >= qty) {
    product.stock -= qty;
    await product.save();
    return true;
  }
  return false;
}',
 'stockReservation.js', 61,
 'Classic check-then-act race condition; concurrent reservations can oversell stock without a transaction or lock.',
 3, 1, 1, 1, 28, 1, 0, 2, 'completed', NOW() - INTERVAL '22 days', NOW() - INTERVAL '22 days'),

('bbbbbbbb-0006-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', 'aaaaaaaa-0004-3333-3333-333333333333',
 'CSV cleaning script', 'Python',
 'def clean_csv(path):
    df = pd.read_csv(path)
    df.fillna(0, inplace=True)
    df["email"] = df["email"].str.lower()
    df.to_csv(path, index=False)
    return df',
 'clean_data.py', 70,
 'Fills all NaNs with 0 regardless of column type, which corrupts non-numeric columns, and overwrites the source file in place.',
 4, 1, 2, 1, 22, 1, 0, 1, 'completed', NOW() - INTERVAL '26 days', NOW() - INTERVAL '26 days'),

('bbbbbbbb-0007-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', 'aaaaaaaa-0005-3333-3333-333333333333',
 'Experiment metrics logger', 'Python',
 'class ExperimentLogger:
    def __init__(self):
        self.runs = []

    def log(self, run_id, metrics):
        self.runs.append({"id": run_id, **metrics})

    def best(self, key):
        return sorted(self.runs, key=lambda r: r[key])[-1]',
 'logger.py', 80,
 'Simple and readable; best() will throw on an empty runs list and assumes higher is always better, which may not hold for loss metrics.',
 2, 0, 1, 1, 18, 3, 1, 2, 'completed', NOW() - INTERVAL '12 days', NOW() - INTERVAL '12 days'),

('bbbbbbbb-0008-4444-4444-444444444444', '44444444-4444-4444-4444-444444444444', 'aaaaaaaa-0006-4444-4444-444444444444',
 'DataTable component', 'TypeScript',
 'export function DataTable({ rows, columns }: DataTableProps) {
  return (
    <table>
      <thead>
        <tr>{columns.map(c => <th>{c.label}</th>)}</tr>
      </thead>
      <tbody>
        {rows.map(row => (
          <tr>
            {columns.map(c => <td>{row[c.key]}</td>)}
          </tr>
        ))}
      </tbody>
    </table>
  );
}',
 'DataTable.tsx', 76,
 'Missing key props on mapped elements will cause React reconciliation warnings and potential rendering bugs on reorder.',
 3, 0, 2, 1, 30, 1, 0, 1, 'completed', NOW() - INTERVAL '16 days', NOW() - INTERVAL '16 days'),

('bbbbbbbb-0009-4444-4444-444444444444', '44444444-4444-4444-4444-444444444444', 'aaaaaaaa-0006-4444-4444-444444444444',
 'useDebounce hook', 'TypeScript',
 'function useDebounce(value: string, delay: number) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value]);
  return debounced;
}',
 'useDebounce.ts', 92,
 'Well-implemented hook; only issue is missing "delay" in the dependency array, which is a minor edge case.',
 1, 0, 0, 1, 12, 1, 0, 1, 'completed', NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 days'),

('bbbbbbbb-0010-5555-5555-555555555555', '55555555-5555-5555-5555-555555555555', 'aaaaaaaa-0007-5555-5555-555555555555',
 'Inventory controller endpoint', 'Java',
 '@RestController
@RequestMapping("/api/inventory")
public class InventoryController {
    @Autowired
    private InventoryRepository repo;

    @GetMapping("/{id}")
    public Inventory getItem(@PathVariable String id) {
        return repo.findById(id).get();
    }
}',
 'InventoryController.java', 58,
 'Uses Optional.get() without checking presence, which throws NoSuchElementException instead of a proper 404 response.',
 3, 1, 1, 1, 24, 1, 1, 1, 'completed', NOW() - INTERVAL '8 days', NOW() - INTERVAL '8 days'),

('bbbbbbbb-0011-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-0001-1111-1111-111111111111',
 'Redis connection setup', 'JavaScript',
 'const redis = new Redis(process.env.REDIS_URL);
redis.on("error", (err) => console.log(err));
module.exports = redis;',
 'redisClient.js', 95,
 'Solid, minimal setup. Consider structured logging instead of console.log for production error tracking.',
 1, 0, 0, 1, 8, 0, 0, 1, 'completed', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'),

('bbbbbbbb-0012-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', 'aaaaaaaa-0004-3333-3333-333333333333',
 'Duplicate row remover', 'Python',
 'def remove_dupes(records):
    seen = []
    result = []
    for r in records:
        if r not in seen:
            seen.append(r)
            result.append(r)
    return result',
 'dedupe.py', 40,
 'Correct output but O(n^2) due to list membership checks; should use a set or dict for O(n) performance on large datasets.',
 2, 0, 1, 1, 10, 1, 0, 2, 'pending', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day')

ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------
-- REVIEW FINDINGS
-- ------------------------------------------------------------
INSERT INTO review_findings (id, review_id, severity, category, issue, explanation, suggested_fix, file_name, line_number, code_snippet, created_at) VALUES

-- Findings for bbbbbbbb-0001 (rate limiter)
('cccccccc-0001-0001-0001-000000000001', 'bbbbbbbb-0001-1111-1111-111111111111', 'critical', 'Concurrency', 'Race condition on shared counter', 'Multiple concurrent requests can read the same "current" value before any write completes, allowing the limit to be bypassed.', 'Use an atomic increment operation (e.g., Redis INCR) instead of separate get/set calls.', 'rateLimiter.js', 3, 'const current = cache.get(key) || 0;', NOW() - INTERVAL '50 days'),
('cccccccc-0001-0001-0001-000000000002', 'bbbbbbbb-0001-1111-1111-111111111111', 'warning', 'Reliability', 'No TTL on rate limit key', 'The counter for a given IP never expires, so once a client hits the limit they are blocked permanently instead of within a rolling window.', 'Set an expiry (e.g., 60s) on the cache key when first created.', 'rateLimiter.js', 6, 'cache.set(key, current + 1);', NOW() - INTERVAL '50 days'),
('cccccccc-0001-0001-0001-000000000003', 'bbbbbbbb-0001-1111-1111-111111111111', 'warning', 'Security', 'Rate limiting keyed only on IP', 'Shared IPs (corporate NAT, mobile carriers) will hit limits collectively; also trivially bypassed by IP spoofing if X-Forwarded-For is trusted blindly.', 'Combine IP with an API key or user ID for more accurate limiting.', 'rateLimiter.js', 2, 'const key = req.ip;', NOW() - INTERVAL '50 days'),
('cccccccc-0001-0001-0001-000000000004', 'bbbbbbbb-0001-1111-1111-111111111111', 'info', 'Style', 'Magic number for limit threshold', 'The value 100 is hardcoded rather than configurable.', 'Extract to a named constant or environment variable.', 'rateLimiter.js', 4, 'if (current > 100) {', NOW() - INTERVAL '50 days'),

-- Findings for bbbbbbbb-0002 (webhook handler)
('cccccccc-0002-0001-0001-000000000001', 'bbbbbbbb-0002-1111-1111-111111111111', 'critical', 'Security', 'Non-constant-time signature comparison', 'Using === to compare HMAC signatures is vulnerable to timing attacks that can leak the expected signature byte by byte.', 'Use crypto.timingSafeEqual() to compare signature buffers.', 'webhookHandler.js', 5, 'if (signature === expected) {', NOW() - INTERVAL '38 days'),
('cccccccc-0002-0001-0001-000000000002', 'bbbbbbbb-0002-1111-1111-111111111111', 'critical', 'Security', 'Success response returned even on verification failure', 'Returning 200 regardless of signature validity can mask attack attempts and makes debugging failed webhooks harder for Razorpay.', 'Return 400/401 when signature verification fails, before processing.', 'webhookHandler.js', 8, 'res.sendStatus(200);', NOW() - INTERVAL '38 days'),
('cccccccc-0002-0001-0001-000000000003', 'bbbbbbbb-0002-1111-1111-111111111111', 'warning', 'Reliability', 'No idempotency check on payment processing', 'Razorpay may retry webhook delivery; without an idempotency key, processPayment could run twice for the same event.', 'Store processed event IDs and skip duplicates.', 'webhookHandler.js', 6, 'processPayment(req.body);', NOW() - INTERVAL '38 days'),
('cccccccc-0002-0001-0001-000000000004', 'bbbbbbbb-0002-1111-1111-111111111111', 'warning', 'Error Handling', 'No try/catch around processing logic', 'An unhandled exception in processPayment will crash the request without a controlled response.', 'Wrap in try/catch and log failures for retry investigation.', 'webhookHandler.js', 6, 'processPayment(req.body);', NOW() - INTERVAL '38 days'),
('cccccccc-0002-0001-0001-000000000005', 'bbbbbbbb-0002-1111-1111-111111111111', 'info', 'Style', 'Secret variable not shown as environment-sourced', 'Ensure "secret" is loaded from env and never hardcoded or logged.', 'Confirm secret comes from process.env.RAZORPAY_WEBHOOK_SECRET.', 'webhookHandler.js', 4, 'const expected = crypto.createHmac("sha256", secret)...', NOW() - INTERVAL '38 days'),

-- Findings for bbbbbbbb-0003 (PDF embed)
('cccccccc-0003-0001-0001-000000000001', 'bbbbbbbb-0003-1111-1111-111111111111', 'warning', 'Validation', 'No bounds checking on signature coordinates', 'x/y/width/height from sig are used directly without validating they fall within page dimensions.', 'Clamp or validate coordinates against page.getSize() before drawing.', 'embedSignature.ts', 4, 'page.drawImage(..., { x: sig.x, y: sig.y, ... })', NOW() - INTERVAL '20 days'),
('cccccccc-0003-0001-0001-000000000002', 'bbbbbbbb-0003-1111-1111-111111111111', 'info', 'Error Handling', 'No error handling for malformed PDF input', 'PDFDocument.load will throw on corrupted input with no user-friendly error surfaced.', 'Wrap in try/catch and return a clear validation error to the caller.', 'embedSignature.ts', 2, 'const pdfDoc = await PDFDocument.load(pdfBytes);', NOW() - INTERVAL '20 days'),

-- Findings for bbbbbbbb-0004 (order status)
('cccccccc-0004-0001-0001-000000000001', 'bbbbbbbb-0004-2222-2222-222222222222', 'critical', 'Concurrency', 'Unawaited database query', 'db.query is not awaited, so the function returns before the update is confirmed, risking stale reads immediately after.', 'Add await before db.query and make the function async.', 'orderService.js', 3, 'db.query("UPDATE orders SET status = ? WHERE id = ?", ...)', NOW() - INTERVAL '35 days'),
('cccccccc-0004-0001-0001-000000000002', 'bbbbbbbb-0004-2222-2222-222222222222', 'critical', 'Business Logic', 'No validation of state transitions', 'Any status can be set from any current status (e.g., "delivered" back to "pending"), which can corrupt order history.', 'Introduce a state machine or allowed-transition map before applying updates.', 'orderService.js', 2, 'order.status = newStatus;', NOW() - INTERVAL '35 days'),
('cccccccc-0004-0001-0001-000000000003', 'bbbbbbbb-0004-2222-2222-222222222222', 'warning', 'Best Practice', 'Mutates input object directly', 'Mutating the passed-in order object can cause unexpected side effects for callers holding a reference to it.', 'Return a new object instead of mutating the parameter.', 'orderService.js', 2, 'order.status = newStatus;', NOW() - INTERVAL '35 days'),
('cccccccc-0004-0001-0001-000000000004', 'bbbbbbbb-0004-2222-2222-222222222222', 'warning', 'Security', 'Not using parameterized query safely verified', 'Placeholders are used correctly here, but confirm this pattern is consistent everywhere to avoid SQL injection elsewhere in the codebase.', 'Audit other queries for raw string concatenation.', 'orderService.js', 3, 'db.query("UPDATE orders SET status = ? WHERE id = ?", [newStatus, order.id])', NOW() - INTERVAL '35 days'),
('cccccccc-0004-0001-0001-000000000005', 'bbbbbbbb-0004-2222-2222-222222222222', 'warning', 'Reliability', 'No error handling on query failure', 'If the UPDATE fails, the function still returns the mutated order object as if it succeeded.', 'Check query result and throw/return an error on failure.', 'orderService.js', 4, 'return order;', NOW() - INTERVAL '35 days'),
('cccccccc-0004-0001-0001-000000000006', 'bbbbbbbb-0004-2222-2222-222222222222', 'info', 'Style', 'Function lacks JSDoc/type annotations', 'No documentation of expected order shape or valid newStatus values.', 'Add JSDoc or migrate to TypeScript with a Status union type.', 'orderService.js', 1, 'function updateOrderStatus(order, newStatus) {', NOW() - INTERVAL '35 days'),

-- Findings for bbbbbbbb-0005 (stock reservation)
('cccccccc-0005-0001-0001-000000000001', 'bbbbbbbb-0005-2222-2222-222222222222', 'critical', 'Concurrency', 'Check-then-act race condition on stock', 'Two concurrent calls can both read sufficient stock before either saves, resulting in overselling.', 'Use an atomic DB update with a WHERE stock >= qty condition, or a row-level lock.', 'stockReservation.js', 3, 'if (product.stock >= qty) {', NOW() - INTERVAL '22 days'),
('cccccccc-0005-0001-0001-000000000002', 'bbbbbbbb-0005-2222-2222-222222222222', 'warning', 'Error Handling', 'No handling for missing product', 'findById returning null (product not found) will throw when accessing product.stock.', 'Check for null and return/throw a clear not-found error.', 'stockReservation.js', 2, 'const product = await Product.findById(productId);', NOW() - INTERVAL '22 days'),
('cccccccc-0005-0001-0001-000000000003', 'bbbbbbbb-0005-2222-2222-222222222222', 'info', 'Validation', 'No check for negative or zero qty', 'Calling reserveStock with qty <= 0 silently "succeeds" and decrements incorrectly.', 'Validate qty > 0 at the start of the function.', 'stockReservation.js', 1, 'async function reserveStock(productId, qty) {', NOW() - INTERVAL '22 days'),

-- Findings for bbbbbbbb-0006 (CSV cleaning)
('cccccccc-0006-0001-0001-000000000001', 'bbbbbbbb-0006-3333-3333-333333333333', 'critical', 'Data Integrity', 'fillna(0) applied uniformly across all columns', 'Filling missing values with 0 corrupts non-numeric columns like names or dates, replacing them with the literal number 0.', 'Apply column-type-aware fill strategies, e.g. df[col].fillna(method) per dtype.', 'clean_data.py', 3, 'df.fillna(0, inplace=True)', NOW() - INTERVAL '26 days'),
('cccccccc-0006-0001-0001-000000000002', 'bbbbbbbb-0006-3333-3333-333333333333', 'warning', 'Data Integrity', 'Overwrites source file in place', 'Writing back to the same path destroys the original raw data with no backup.', 'Write to a new output path or version the cleaned file separately.', 'clean_data.py', 5, 'df.to_csv(path, index=False)', NOW() - INTERVAL '26 days'),
('cccccccc-0006-0001-0001-000000000003', 'bbbbbbbb-0006-3333-3333-333333333333', 'warning', 'Error Handling', 'No handling for missing "email" column', 'If the CSV lacks an "email" column, this raises a KeyError with no context for the caller.', 'Check column existence before transforming, or catch and re-raise with a clear message.', 'clean_data.py', 4, 'df["email"] = df["email"].str.lower()', NOW() - INTERVAL '26 days'),
('cccccccc-0006-0001-0001-000000000004', 'bbbbbbbb-0006-3333-3333-333333333333', 'info', 'Style', 'No type hints or docstring', 'Function signature gives no indication of expected input/output types.', 'Add a docstring and type hints for path: str -> pd.DataFrame.', 'clean_data.py', 1, 'def clean_csv(path):', NOW() - INTERVAL '26 days'),

-- Findings for bbbbbbbb-0007 (experiment logger)
('cccccccc-0007-0001-0001-000000000001', 'bbbbbbbb-0007-3333-3333-333333333333', 'warning', 'Error Handling', 'best() throws on empty runs list', 'Calling best() before any run is logged raises an IndexError instead of a clear message.', 'Raise a descriptive exception or return None when self.runs is empty.', 'logger.py', 8, 'return sorted(self.runs, key=lambda r: r[key])[-1]', NOW() - INTERVAL '12 days'),
('cccccccc-0007-0001-0001-000000000002', 'bbbbbbbb-0007-3333-3333-333333333333', 'info', 'Design', 'Assumes higher metric value is always best', 'For loss-type metrics, lower is better; best() will silently return the worst run.', 'Accept a "higher_is_better" flag or separate best_max/best_min methods.', 'logger.py', 7, 'def best(self, key):', NOW() - INTERVAL '12 days'),

-- Findings for bbbbbbbb-0008 (DataTable)
('cccccccc-0008-0001-0001-000000000001', 'bbbbbbbb-0008-4444-4444-444444444444', 'warning', 'React Best Practice', 'Missing key prop on mapped <tr> elements', 'React requires stable keys on list items to correctly track identity across re-renders; omitting them can cause subtle UI bugs.', 'Add key={row.id ?? index} to each mapped <tr>.', 'DataTable.tsx', 9, '{rows.map(row => (', NOW() - INTERVAL '16 days'),
('cccccccc-0008-0001-0001-000000000002', 'bbbbbbbb-0008-4444-4444-444444444444', 'warning', 'React Best Practice', 'Missing key prop on mapped <th> elements', 'Same key-stability issue applies to the header row mapping.', 'Add key={c.key} to each mapped <th>.', 'DataTable.tsx', 6, '{columns.map(c => <th>{c.label}</th>)}', NOW() - INTERVAL '16 days'),
('cccccccc-0008-0001-0001-000000000003', 'bbbbbbbb-0008-4444-4444-444444444444', 'info', 'Accessibility', 'No scope attribute on header cells', 'Screen readers benefit from scope="col" on <th> elements for table navigation.', 'Add scope="col" to each <th>.', 'DataTable.tsx', 6, '<th>{c.label}</th>', NOW() - INTERVAL '16 days'),

-- Findings for bbbbbbbb-0009 (useDebounce)
('cccccccc-0009-0001-0001-000000000001', 'bbbbbbbb-0009-4444-4444-444444444444', 'info', 'React Best Practice', 'delay missing from dependency array', 'If delay changes between renders, the effect won\u2019t re-run with the new value until value also changes.', 'Add delay to the useEffect dependency array.', 'useDebounce.ts', 4, '}, [value]);', NOW() - INTERVAL '7 days'),

-- Findings for bbbbbbbb-0010 (Inventory controller)
('cccccccc-0010-0001-0001-000000000001', 'bbbbbbbb-0010-5555-5555-555555555555', 'critical', 'Error Handling', 'Optional.get() called without presence check', 'If no Inventory with the given id exists, this throws NoSuchElementException, resulting in a raw 500 error instead of a 404.', 'Use repo.findById(id).orElseThrow(() -> new ResourceNotFoundException(id)) mapped to a 404 response.', 'InventoryController.java', 9, 'return repo.findById(id).get();', NOW() - INTERVAL '8 days'),
('cccccccc-0010-0001-0001-000000000002', 'bbbbbbbb-0010-5555-5555-555555555555', 'warning', 'API Design', 'No input validation on path variable', 'A malformed id (wrong format/length) is passed straight to the repository layer without validation.', 'Validate id format before querying, or rely on a custom exception handler.', 'InventoryController.java', 8, 'public Inventory getItem(@PathVariable String id) {', NOW() - INTERVAL '8 days'),
('cccccccc-0010-0001-0001-000000000003', 'bbbbbbbb-0010-5555-5555-555555555555', 'info', 'Best Practice', 'Field injection used instead of constructor injection', '@Autowired on a field makes the class harder to unit test compared to constructor injection.', 'Use constructor injection for InventoryRepository.', 'InventoryController.java', 5, 'private InventoryRepository repo;', NOW() - INTERVAL '8 days'),

-- Findings for bbbbbbbb-0011 (Redis client)
('cccccccc-0011-0001-0001-000000000001', 'bbbbbbbb-0011-1111-1111-111111111111', 'info', 'Observability', 'console.log used for error logging', 'Plain console.log makes it hard to filter/alert on Redis errors in production.', 'Use a structured logger (e.g., pino/winston) with severity levels.', 'redisClient.js', 2, 'redis.on("error", (err) => console.log(err));', NOW() - INTERVAL '5 days')

-- Findings for bbbbbbbb-0012 (dedupe, pending review — no findings yet)
-- (left empty intentionally to represent a review still being processed)

ON CONFLICT (id) DO NOTHING;