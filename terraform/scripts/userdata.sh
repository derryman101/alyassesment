#!/bin/bash
set -euxo pipefail

# Bootstrap script for Amazon Linux 2023
# Installs Docker and AWS CLI, configures for CI/CD deployments

exec > >(tee /var/log/userdata.log | logger -t userdata -s 2>/dev/console) 2>&1

echo "=== Starting bootstrap for ${app_name} ==="

# Update system
dnf update -y

# Install Docker
dnf install -y docker
systemctl enable docker
systemctl start docker

# Add ec2-user to docker group (no sudo needed)
usermod -aG docker ec2-user

# Install AWS CLI v2
dnf install -y aws-cli

# Configure Docker to use ECR credential helper
mkdir -p /root/.docker
cat > /root/.docker/config.json <<EOF
{
  "credHelpers": {
    "${aws_region}.amazonaws.com": "ecr-login"
  }
}
EOF

# Install ECR credential helper
dnf install -y amazon-ecr-credential-helper

# Setup auto-start of app container on reboot
cat > /etc/systemd/system/${app_name}.service <<EOF
[Unit]
Description=${app_name} container
Requires=docker.service
After=docker.service

[Service]
Restart=always
ExecStart=/usr/bin/docker start -a ${app_name}
ExecStop=/usr/bin/docker stop ${app_name}

[Install]
WantedBy=multi-user.target
EOF

echo "=== Bootstrap complete ==="
