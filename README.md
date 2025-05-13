# Family Legacy Missions Zambia Data Transformation Application

## Overview
This web application prototype addresses data transformation challenges for Family Legacy Missions Zambia. It integrates Google Spreadsheet data, implements role-based access control (RBAC) using Directus, supports historical data access, smart data collection, issue tracking, and data visualization. Built with Next.js, Directus API, PostgreSQL, and Python, it is deployed on Vercel with a Directus instance in a Docker container.

**Deployed URL**: [https://family-legacy-missions-zambia-data-web-app.vercel.app](https://family-legacy-missions-zambia-data-web-app.vercel.app)  
**GitHub Repository**: [https://github.com/your-repo/family-legacy-missions-zambia-data-web-app/dashboard](https://github.com/your-repo/family-legacy-missions-zambia-data-web-app/dashboard) (Replace with actual repo link)

### Test Credentials
- **Administrator**: Email: `admin@flmz.org`, Password: `Admin123!`
- **Teacher**: Email: `teacher@flmz.org`, Password: `Teacher123!`
- **Assessor**: Email: `assessor@flmz.org`, Password: `Assessor123!`
- **Field Officer**: Email: `field@flmz.org`, Password: `Field123!`

## Features
1. **Data Integration**:
   - Imports Google Spreadsheet data (Home Visits, Vulnerability Assessments, Literacy Assessments) using Python (`gspread`).
   - Exports data to CSV via Directus API and PDF using `jsPDF`.
   - Daily sync via GitHub Actions.

2. **Role-Based Access Control (RBAC)**:
   - Managed by Directus with roles: Administrator, Teacher, Assessor, Field Officer.
   - Permissions:
     - Administrator: Full CRUD on all collections.
     - Teacher/Assessor: Read/Write on Literacy Assessments, Read on Home Visits, Children.
     - Field Officer: Read/Write on Home Visits, Vulnerability Assessments, Read on Children.

3. **Historical Data Access**:
   - UI displays past records (e.g., `/dashboard/learners`, `/dashboard/vulnerability`).
   - Smart filtering pre-populates forms to avoid redundant inputs.

4. **Smart Data Collection**:
   - Next.js forms with `react-hook-form` and conditional rendering.
   - Client-side (Zod) and server-side (Directus) validation.

5. **Issue Tracking**:
   - Tracks follow-up actions in the `issues` collection.
   - UI at `/dashboard/issue-tracking` with filters by child, status, or creator.

6. **Data Visualization**:
   - Apache Superset dashboards for role-based metrics.
   - Embedded charts in `/dashboard/app` and static `matplotlib` charts for PDF exports.

## System Architecture
- **Frontend**: Next.js, Material-UI (responsive UI).
- **Backend**: Directus (headless CMS) with PostgreSQL in a Docker container.
- **Data Integration**: Python scripts for Google Sheets import/export.
- **Visualization**: Apache Superset (Dockerized) for dashboards, `matplotlib` for static charts.
- **Deployment**: Vercel (frontend CI/CD), GitHub Actions (backend CI/CD), Docker (Directus, Superset).
- **Authentication**: JWT-based via Directus with RBAC.

## Data Model
Key entities in PostgreSQL (managed by Directus):
- **Users**: Email, role_id, name.
- **Roles**: Administrator, Teacher, Assessor, Field Officer.
- **Children**: Name, age, school_id, caregiver_id.
- **Home Visits**: Child_id, date, notes, status, created_by.
- **Vulnerability Assessments**: Child_id, date, risk_level, notes, created_by.
- **Literacy Assessments**: Child_id, date, score, notes, created_by.
- **Caregivers**: Name, contact, address.
- **Issues**: Child_id, description, status, created_by, resolved_date.

**Relationships**:
- One-to-Many: Children to Home Visits, Vulnerability Assessments, Literacy Assessments.
- Many-to-One: Home Visits, Assessments to Users (via created_by).
- One-to-Many: Caregivers to Children.

## Installation and Setup
### Prerequisites
- Node.js (v18+)
- Yarn (v1.22+) or npm
- Docker
- Python (v3.8+)
- Git
- Google Cloud Credentials (for Sheets API)

### Next.js App
1. Clone the repository:
   ```bash
   git clone https://github.com/your-repo/family-legacy-missions-zambia-data-web-app.git
   cd family-legacy-missions-zambia-data-web-app
   ```
2. Install dependencies:
   ```bash
   yarn install
   ```
   Or:
   ```bash
   npm install
   ```
3. Set up `.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=https://directus.sadcgrains.com
   GOOGLE_SHEETS_CREDENTIALS_PATH=/path/to/credentials.json
   ```
4. Run the development server:
   ```bash
   yarn dev
   ```
   Or:
   ```bash
   npm run dev
   ```
5. Access at `http://localhost:3000`.

### Directus (Docker)
1. Pull Directus image:
   ```bash
   docker pull directus/directus:latest
   ```
2. Run Directus with PostgreSQL:
   ```bash
   docker run -d \
     -e DB_CLIENT=pg \
     -e DB_HOST=host.docker.internal \
     -e DB_PORT=5432 \
     -e DB_DATABASE=flmz \
     -e DB_USER=postgres \
     -e DB_PASSWORD=your_password \
     -e ADMIN_EMAIL=admin@flmz.org \
     -e ADMIN_PASSWORD=Admin123! \
     -e KEY=your-key \
     -e SECRET=your-secret \
     -p 8055:8055 \
     directus/directus
   ```
3. Access at `http://localhost:8055` and configure collections/permissions.

### Superset (Docker)
1. Pull Superset image:
   ```bash
   docker pull apache/superset:latest
   ```
2. Run Superset:
   ```bash
   docker run -d -p 8088:8088 \
     -e SUPERSET_SECRET_KEY=your-secret \
     apache/superset
   ```
3. Initialize Superset:
   ```bash
   docker exec -it <container_id> superset fab create-admin \
     --username admin \
     --firstname Admin \
     --lastname User \
     --email admin@flmz.org \
     --password Admin123!
   docker exec -it <container_id> superset init
   ```
4. Access at `http://localhost:8088` (login: `admin/Admin123!`).

### Python Scripts
1. Install dependencies:
   ```bash
   pip install gspread oauth2client pandas matplotlib jsPDF
   ```
2. Run import script:
   ```bash
   python scripts/import_spreadsheet.py
   ```

## Limitations
- **Import Frequency**: Daily sync may miss real-time updates.
- **Visualization**: Basic Superset dashboards; advanced filters needed.
- **Mobile Optimization**: Responsive but not fully optimized for low-bandwidth.
- **Notifications**: Email/SMS notifications not implemented.

## Future Development
### Short-Term (3-6 Months)
- Real-time data sync with Google Sheets webhooks.
- Mobile optimization with offline-first UI.
- Email/SMS notifications for issues.
- Advanced Superset dashboards.

### Mid-Term (6-12 Months)
- Kubernetes deployment for scalability.
- AI-based anomaly detection for data validation.
- Multi-language support (English, Zambian languages).

### Long-Term (12+ Months)
- Offline data collection with PWA and IndexedDB.
- Integration with external CRMs/government databases.
- Custom analytics module with Python (Dash).

## Technologies
- **Frontend**: Next.js (TypeScript), Material-UI
- **Backend/API**: Directus
- **Database**: PostgreSQL
- **Data Integration**: Python (`gspread`, `pandas`)
- **Visualization**: Apache Superset, `matplotlib`
- **Deployment**: Vercel, Docker, GitHub Actions
- **Authentication**: JWT (Directus)

## Security
- JWT authentication for secure access.
- RBAC for granular permissions.
- Data validation with Zod (client) and Directus (server).
- HTTPS enforced by Vercel.
- CORS configured in Directus.

## Submission Details
- **GitHub Repository**: [https://github.com/Bright238/family_legacy_missions_zambia_data_app.git](https://github.com/your-repo/family-legacy-missions-zambia-data-web-app)
- **Deployed URL**: [https://family-legacy-missions-zambia-data-web-app.vercel.app](https://family-legacy-missions-zambia-data-web-app.vercel.app)
- **Documentation**: Included as `README.md` and `docs/assessment.md`.
- **Contact**: Email submissions to `mer@familylegacyzambia.org`.
