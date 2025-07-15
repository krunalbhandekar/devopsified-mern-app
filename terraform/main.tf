provider "aws" {
  region = var.region
}

module "vpc" {
  source = "./vpc"

  region               = var.region
  vpc_cidr             = var.vpc_cidr
  public_subnet_cidrs  = var.public_subnet_cidrs
  private_subnet_cidrs = var.private_subnet_cidrs
  availability_zones   = var.availability_zones
}

module "eks_cluster" {
  source = "./eks"

  aws_region      = var.region
  cluster_name    = var.cluster_name
  subnet_ids      = module.vpc.private_subnet_ids
  node_group_name = var.node_group_name
  desired_size    = var.desired_size
  max_size        = var.max_size
  min_size        = var.min_size
  instance_types  = var.instance_types
}




