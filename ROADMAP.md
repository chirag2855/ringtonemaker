# Implementation Roadmap - Ringtone Maker (Open Source)

## Overview

**Budget**: $0 software licensing + $20-100/month hosting (self-hosted on VPS)

**Tech Stack Summary**:
- React Native (mobile) - FREE
- Node.js + Express (backend) - FREE
- PostgreSQL (database) - FREE
- Redis (cache/queue) - FREE
- FFmpeg (audio processing) - FREE
- yt-dlp (YouTube download) - FREE
- Docker (containerization) - FREE
- Nginx (web server) - FREE

---

## Phase 1: Foundation & MVP (Weeks 1-8)

### 1.1 Backend Infrastructure (Weeks 1-2)

**Setup:**
- [ ] Initialize Node.js project (Express.js)
- [ ] Set up PostgreSQL database locally
- [ ] Configure Redis for sessions and caching
- [ ] Docker Compose setup for local development
- [ ] Nginx configuration for reverse proxy
- [ ] Error handling and logging system
- [ ] Environment configuration (.env)

**Technologies Used:**
- Node.js + Express
- PostgreSQL driver (node-postgres)
- Redis client (redis npm package)
- Docker & Docker Compose
- Nginx

**Deliverables:**
- Backend API running locally via Docker
- PostgreSQL database initialized
- Redis cache operational
- Nginx reverse proxy configured

### 1.2 Authentication (Weeks 2-3)

**Implement:**
- [ ] OAuth 2.0 integration (GitHub, Google, Facebook)
- [ ] JWT token generation (jsonwebtoken)
- [ ] Token refresh mechanism
- [ ] Session management with Redis
- [ ] Logout functionality
- [ ] Password hashing with bcrypt (for email/password auth)

**Libraries:**
- `passport.js` (OAuth handling)
- `jsonwebtoken` (JWT)
- `bcryptjs` (password hashing)
- `express-session` (session management)

**Deliverables:**
- OAuth login/signup endpoints
- JWT-based authentication
- Session management

### 1.3 YouTube & Audio Processing Setup (Weeks 2-3)

**Environment Setup:**
- [ ] Install FFmpeg on development machines
- [ ] Install yt-dlp (YouTube downloader)
- [ ] Test FFmpeg audio conversion locally
- [ ] Test yt-dlp metadata fetching
- [ ] Create worker setup for background jobs

**Technologies:**
- FFmpeg (system package)
- yt-dlp (Python/Node.js wrapper)
- Bull or Bee-Queue (Redis-backed job queue)
- Fluent-ffmpeg (Node.js FFmpeg wrapper)

**Deliverables:**
- FFmpeg working in Docker
- yt-dlp downloading videos
- Job queue tested locally

### 1.4 Ringtone Creation Pipeline (Weeks 3-5)

**Implement:**
- [ ] Create `/ringtones/create` endpoint
- [ ] YouTube metadata fetching with caching
- [ ] Video download with yt-dlp
- [ ] Audio extraction with FFmpeg
- [ ] Format conversion (MP3, WAV, M4A, OGG)
- [ ] Audio normalization (EBU R128)
- [ ] Job queue integration
- [ ] Status tracking endpoint

**Flow:**
```
User POST /ringtones/create {youtubeUrl, startTime, endTime, format, quality}
  ↓
1. Fetch metadata (yt-dlp) + cache
2. Queue job for processing
3. Return Job ID
  ↓
Background Worker:
1. Download video (yt-dlp)
2. Extract audio segment (FFmpeg)
3. Convert format (FFmpeg)
4. Normalize audio (FFmpeg + filter)
5. Save to storage
6. Update database status
7. Return download URL
```

**Deliverables:**
- Ringtone creation working end-to-end
- Async processing via job queue
- Status tracking API

### 1.5 File Storage (Weeks 4-5)

**Choose Storage Option:**

**Option A: Local Filesystem (Simplest)**
```
/data/ringtones/
├── user-id-1/
│   ├── ringtone-1.mp3
│   └── ringtone-2.m4a
└── user-id-2/
    └── ringtone-3.wav
```
- Backed up via PostgreSQL replication
- Nginx serves files directly

**Option B: MinIO (S3-Compatible)**
```
docker run -p 9000:9000 minio/minio
- Fully compatible with S3 API
- Can cluster for HA
- Backup/restore built-in
```

**Decision**: Start with local filesystem, migrate to MinIO later if needed

**Deliverables:**
- Ringtone file storage working
- Download URL generation

### 1.6 Mobile App - Core Setup (Weeks 4-6)

**Initialize:**
- [ ] Create React Native project
- [ ] Set up iOS development environment
- [ ] Set up Android development environment
- [ ] Configure navigation (React Navigation)
- [ ] Implement OAuth login flow
- [ ] Basic app structure (tabs/stack)

**Libraries:**
- React Native
- React Navigation
- Axios (HTTP client)
- React Native OAuth (expo-auth-session)

**Deliverables:**
- React Native app compiles for iOS & Android
- OAuth login working on devices
- Basic app navigation

### 1.7 Mobile App - Ringtone Creation UI (Weeks 5-7)

**Screens to Build:**
- [ ] YouTube URL input screen
- [ ] Video preview screen (thumbnail + metadata)
- [ ] Timeline scrubber (clip selection UI)
- [ ] Quality/format selector (radio buttons)
- [ ] Progress indicator (processing status)
- [ ] Success screen (download completed)

**Libraries:**
- `react-native-video` (video preview)
- `react-native-slider` (timeline scrubber)
- `react-native-linear-gradient` (UI polish)

**Deliverables:**
- Full ringtone creation flow in mobile app
- Connected to backend API
- Works on both iOS & Android

### 1.8 Device Integration (Weeks 6-7)

**iOS:**
- [ ] RingtoneManager API integration
- [ ] Save to Documents directory
- [ ] Set as ringtone via Settings
- [ ] Handle permissions

**Android:**
- [ ] RingtoneManager API integration
- [ ] Save to MediaStore
- [ ] Set as ringtone
- [ ] Handle permissions

**Libraries:**
- React Native modules for ringtone management
- `react-native-fs` (file system access)

**Deliverables:**
- Users can set ringtones on device
- Platform-specific implementation complete

### 1.9 Personal Library Management (Weeks 6-7)

**Backend:**
- [ ] Ringtone CRUD endpoints
- [ ] User library queries
- [ ] Metadata editing

**Mobile:**
- [ ] Library screen (list user's ringtones)
- [ ] Edit metadata modal
- [ ] Delete confirmation
- [ ] Preview playback

**Deliverables:**
- Users can manage personal collection

### 1.10 Testing & Deployment Setup (Week 8)

**Testing:**
- [ ] Unit tests (Jest + Supertest for API)
- [ ] Integration tests (e2e ringtone creation)
- [ ] Mobile app testing on real devices
- [ ] Audio quality validation
- [ ] Performance testing (load test API)

**Deployment:**
- [ ] Docker image for backend
- [ ] Docker Compose for full stack
- [ ] Deployment documentation
- [ ] Database migration scripts

**Testing Stack:**
- Jest (unit testing)
- Supertest (API testing)
- Detox (React Native E2E)

**Deliverables:**
- MVP ready for beta testing
- Docker deployment working
- Performance baseline established

---

## Phase 2: Community Library (Weeks 9-14)

### 2.1 PostgreSQL Full-Text Search (Weeks 9-10)

**Implement:**
- [ ] Create `library_entries` table
- [ ] Add GIN full-text search index
- [ ] Implement search endpoint
- [ ] Implement filter/sort queries
- [ ] Add PostgreSQL trigger for search index updates

**SQL:**
```sql
CREATE INDEX idx_library_fts ON ringtones USING GIN(
  to_tsvector('english', title || ' ' || COALESCE(youtube_title, ''))
);

-- Search query
SELECT * FROM ringtones 
WHERE to_tsvector('english', title) @@ plainto_tsquery('english', 'search_term')
AND is_public = true
ORDER BY rating DESC;
```

**Deliverables:**
- Full-text search working
- Filtering by format, quality, duration
- Sorting by popularity, newest, rating

### 2.2 Community Library UI (Weeks 10-11)

**Mobile Screens:**
- [ ] Browse library screen
- [ ] Search screen
- [ ] Filter/sort modal
- [ ] Ringtone detail screen
- [ ] Rating/review modal
- [ ] Creator profile screen

**Deliverables:**
- Full community library experience
- Users can discover ringtones

### 2.3 Rating & Review System (Weeks 11-12)

**Backend:**
- [ ] Ratings table with constraints
- [ ] Aggregated rating queries
- [ ] Review moderation (basic)

**Mobile:**
- [ ] Rating UI (star picker)
- [ ] Review text input
- [ ] View reviews on ringtone detail

**Deliverables:**
- Complete rating/review system
- Community engagement mechanics

### 2.4 Creator Analytics (Weeks 12-13)

**Backend:**
- [ ] Analytics queries (download count, engagement)
- [ ] Creator profile endpoint

**Mobile:**
- [ ] Creator stats on profile
- [ ] View-only analytics (MVP)

**Deliverables:**
- Creators can see impact of their ringtones

### 2.5 Testing & Optimization (Weeks 13-14)

**Load Testing:**
- [ ] 1000+ concurrent users on library
- [ ] Search performance validation
- [ ] Database query optimization

**Optimization:**
- [ ] PostgreSQL query tuning
- [ ] Redis caching for popular ringtones
- [ ] Pagination for large result sets
- [ ] Image thumbnail caching

**Deliverables:**
- Production-ready community features
- Performance validated under load

---

## Phase 3: Launch Preparation (Weeks 15-16)

### 3.1 Deployment & Operations (Week 15)

**Set Up Hosting:**
- [ ] Provision VPS (DigitalOcean/Linode/Hetzner)
- [ ] Install Docker and Docker Compose
- [ ] Set up PostgreSQL with backups
- [ ] Configure Redis
- [ ] Set up Nginx with SSL/TLS
- [ ] Configure monitoring (Prometheus + Grafana)

**Documentation:**
- [ ] Deployment guide
- [ ] User guide
- [ ] API documentation (Swagger/OpenAPI)
- [ ] Administrator guide

**Deliverables:**
- Production environment ready
- Monitoring and alerting configured

### 3.2 Mobile App Store Submission (Week 15-16)

**iOS:**
- [ ] Apple Developer Account
- [ ] Create app in App Store Connect
- [ ] Build signing certificates
- [ ] Submit for review

**Android:**
- [ ] Google Play Developer Account
- [ ] Create app on Google Play Console
- [ ] Sign APK/AAB
- [ ] Submit for review

**Deliverables:**
- Apps submitted to stores
- Waiting for approval

### 3.3 Beta & Launch (Week 16+)

**Beta Testing:**
- [ ] Invite beta testers
- [ ] Collect feedback
- [ ] Fix critical issues
- [ ] Performance optimization

**Launch:**
- [ ] Public announcement
- [ ] Marketing (GitHub, Twitter, Reddit)
- [ ] Community building

---

## Technology Stack Summary

| Layer | Technology | Cost | License |
|-------|-----------|------|---------|
| **Mobile** | React Native | $0 | MIT |
| **Backend** | Node.js + Express | $0 | MIT |
| **Database** | PostgreSQL | $0 | PostgreSQL |
| **Cache/Queue** | Redis | $0 | BSD |
| **Audio Processing** | FFmpeg | $0 | GPL/LGPL |
| **YouTube** | yt-dlp | $0 | GPL-3 |
| **Containerization** | Docker | $0 | Apache 2.0 |
| **Web Server** | Nginx | $0 | BSD |
| **Monitoring** | Prometheus + Grafana | $0 | Apache 2.0 |
| **Hosting** | VPS (Linode/DO/Hetzner) | $20-50/mo | Various |
| **TOTAL** | | **$0 software** | All FOSS |

---

## Development Team & Timeline

**Team Size:**
- 2 Backend engineers
- 2 Mobile engineers (iOS + Android)
- 1 DevOps/Infrastructure
- 1 QA/Testing
- 1 Product owner (part-time)

**Total Duration:** 16 weeks (4 months)

**Milestones:**
- Week 3: Authentication complete
- Week 5: Ringtone creation pipeline working
- Week 8: MVP complete and tested
- Week 12: Community library complete
- Week 15: Launch-ready
- Week 16+: Live on app stores

---

## Cost Analysis

### Development Phase
- **Software Licenses:** $0 (all open-source)
- **Development Server:** $0 (local/Docker)
- **CI/CD:** $0 (GitHub Actions free tier)
- **TOTAL:** $0

### Operational Phase (At Launch)
- **Hosting (VPS):** $20-50/month
- **Domain name:** $12/year
- **Storage expansion (if needed):** $0-50/month
- **TOTAL:** $20-100/month

### Scaling Phase (1M users)
- **Multiple servers:** $100-200/month
- **Database replication:** Included with PostgreSQL
- **Monitoring/alerts:** $0
- **TOTAL:** $100-200/month

---

## Success Metrics

**End of Phase 1 (MVP):**
- ✅ Core functionality working
- ✅ 100+ beta testers
- ✅ <5 second creation time
- ✅ 95%+ success rate

**End of Phase 2 (Community):**
- ✅ 1K users
- ✅ 10K ringtones
- ✅ Community features working
- ✅ 99% uptime

**End of Phase 3 (Launch):**
- ✅ Apps on stores
- ✅ 10K+ downloads
- ✅ 4.5+ star rating
- ✅ 99.5% uptime

---

## Risk Mitigation

| Risk | Impact | Mitigation |
|------|--------|-----------|
| YouTube ToS violations | Critical | Only download public videos, cache metadata |
| FFmpeg encoding slow | High | Use job queue, scale workers |
| Database performance | Medium | Indexing, query optimization, Redis cache |
| Scaling to 1M users | Medium | Kubernetes ready design, horizontal scaling |
| Server downtime | Medium | Daily PostgreSQL backups, multi-region ready |

---

## Next Steps

1. **Week 1:** Set up backend infrastructure and Docker
2. **Week 2:** Implement authentication (OAuth + JWT)
3. **Week 2-3:** Parallel: YouTube/FFmpeg setup + React Native init
4. **Week 4+:** Build features according to roadmap
5. **Week 8:** Beta launch
6. **Week 16:** Public launch

**Ready to start? Proceed to TASKS.md for breakdown of specific development tasks.**
