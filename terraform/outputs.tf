output "instance_id" {
  description = "EC2 instance ID (add to GitHub Secrets as EC2_INSTANCE_ID)"
  value       = aws_instance.app.id
}

output "instance_public_ip" {
  description = "Public IP of the EC2 instance"
  value       = aws_instance.app.public_ip
}

output "app_url" {
  description = "Application URL"
  value       = "http://${aws_instance.app.public_ip}"
}

output "ecr_repository_url" {
  description = "ECR repository URL (add to GitHub Secrets as ECR_REGISTRY)"
  value       = aws_ecr_repository.app.repository_url
}

output "ecr_registry" {
  description = "ECR registry hostname only"
  value       = split("/", aws_ecr_repository.app.repository_url)[0]
}

output "vpc_id" {
  description = "VPC ID"
  value       = aws_vpc.main.id
}
