# NodeApp CI/CD Demo

A production-grade CI/CD pipeline for a Node.js web application, using **GitHub Actions**, **Docker**, **Amazon ECR**, and **Terraform** for infrastructure provisioning on AWS.

---

## Architecture Overview

```
Developer → Git Push → GitHub Actions
                            │
                ┌───────────▼───────────┐
                │  1. Build & Test      │  ← npm ci, Jest, coverage
                └───────────┬───────────┘
                            │ (only on main branch)
                ┌───────────▼───────────┐
                │  2. Docker Build      │  ← multi-stage build
                │     Push to ECR       │
                └───────────┬───────────┘
                            │
                ┌───────────▼───────────┐
                │  3. Deploy to EC2     │  ← AWS SSM (no open SSH port)
                │     via SSM           │
                └───────────┬───────────┘
                            │
                     ┌──────▼──────┐
                     │  EC2 + VPC  │  ← provisioned by Terraform
                     └─────────────┘
```

---

## Tech Stack

| Layer | Tool | Why |
|---|---|---|
| App | Node.js + Express | Lightweight, widely understood |
| Tests | Jest + Supertest | Fast, zero config, excellent coverage |
| Pipeline | GitHub Actions | Native Git integration, free for public repos |
| Containers | Docker (multi-stage) | Consistent builds, small image (~120MB) |
| Registry | Amazon ECR | Private, integrates natively with EC2 IAM |
| IaC | Terraform | Declarative, repeatable, state-managed |
| Deployment | AWS SSM | No open port 22 needed — more secure |
| Compute | AWS EC2 (t3.micro) | Cost-effective, stays within free tier |

---

## Prerequisites

- AWS account with programmatic access (Access Key + Secret)
- Terraform >= 1.5.0 installed locally
- Docker installed locally
- Node.js 20+ installed locally

---

## Step 1: Provision Infrastructure with Terraform

```bash
cd terraform

# Initialise providers
terraform init

# Preview what will be created
terraform plan -out=tfplan

# Apply (creates VPC, EC2, ECR, IAM roles)
terraform apply tfplan
```

After apply, note the outputs:

```bash
terraform output
# instance_id          = "i-0abc1234def56789"
# instance_public_ip   = "54.x.x.x"
# ecr_repository_url   = "123456789.dkr.ecr.us-east-1.amazonaws.com/nodeapp-cicd-demo"
# ecr_registry         = "123456789.dkr.ecr.us-east-1.amazonaws.com"
# app_url              = "http://54.x.x.x"
```

---

## Step 2: Configure GitHub Secrets

In your GitHub repository go to **Settings → Secrets and variables → Actions** and add:

| Secret Name | Value |
|---|---|
| `AWS_ACCESS_KEY_ID` | Your IAM user access key |
| `AWS_SECRET_ACCESS_KEY` | Your IAM user secret key |
| `EC2_INSTANCE_ID` | From `terraform output instance_id` |
| `ECR_REGISTRY` | From `terraform output ecr_registry` |

---

## Step 3: Run Locally

```bash
# Install dependencies
npm install

# Run tests
npm test

# Start dev server
npm run dev
# → http://localhost:3000

# Build and run Docker image
docker build -t nodeapp-cicd-demo .
docker run -p 3000:3000 nodeapp-cicd-demo
```

---

## Step 4: Trigger the Pipeline

```bash
# Make any change, then push to main
git add .
git commit -m "feat: trigger deployment"
git push origin main
```

Watch the pipeline at: `https://github.com/<your-username>/nodeapp-cicd-demo/actions`

The pipeline runs three sequential jobs:
1. **Build & Test** — installs deps, runs Jest, uploads coverage report
2. **Docker Build & Push** — builds multi-stage image, pushes to ECR
3. **Deploy** — SSM command pulls new image on EC2 and restarts container

---

## API Endpoints

| Method | Endpoint | Response |
|---|---|---|
| GET | `/` | App info, version, timestamp |
| GET | `/health` | `{ status: "healthy", uptime: N }` |
| GET | `/api/items` | Sample items list |

---

## Extending This Setup

**Add staging environment:**
- Create a `staging` branch
- Duplicate the deploy job with a different `EC2_INSTANCE_ID` secret

**Add database (RDS):**
- Uncomment the RDS module in `terraform/main.tf`
- Pass `DB_URL` as an environment variable in the deploy step

**Add Slack notifications:**
```yaml
- name: Notify Slack
  uses: slackapi/slack-github-action@v1
  with:
    payload: '{"text":"Deployed ${{ github.sha }} to production"}'
  env:
    SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK }}
```

---

## Teardown

To avoid AWS charges when done:

```bash
cd terraform
terraform destroy
```

---

## Repository Structure

```
.
├── app/
│   └── index.js              # Express application
├── test/
│   └── app.test.js           # Jest tests
├── terraform/
│   ├── main.tf               # VPC, EC2, ECR, IAM
│   ├── variables.tf          # Input variables
│   ├── outputs.tf            # Output values
│   └── scripts/
│       └── userdata.sh       # EC2 bootstrap script
├── .github/
│   └── workflows/
│       └── deploy.yml        # CI/CD pipeline
├── Dockerfile                # Multi-stage build
├── package.json
└── README.md
```
