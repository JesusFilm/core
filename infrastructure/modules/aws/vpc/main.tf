data "aws_availability_zones" "current" {}

resource "aws_vpc" "vpc" {
  cidr_block           = var.cidr
  enable_dns_hostnames = true
  enable_dns_support   = true
  tags = {
    Name = "jfp-vpc-${var.env}"
    Env  = var.env
  }
}

resource "aws_internet_gateway" "igw" {
  vpc_id = aws_vpc.vpc.id
  tags = {
    Name = "jfp-igw-${var.env}"
    Env  = var.env
  }
}

resource "aws_subnet" "public_subnet" {
  vpc_id                  = aws_vpc.vpc.id
  count                   = length(data.aws_availability_zones.current.names)
  cidr_block              = cidrsubnet(var.cidr, 8, 10 + count.index)
  availability_zone       = data.aws_availability_zones.current.names[count.index]
  map_public_ip_on_launch = true

  tags = {
    Name                     = "jfp-public-subnet-${count.index}-${var.env}"
    Env                      = var.env
    Tier                     = "Public"
    "kubernetes.io/role/elb" = "1"
  }
}

resource "aws_route_table" "public_route_table" {
  vpc_id = aws_vpc.vpc.id
  tags = {
    Name = "jfp-public-route-table-${var.env}"
    Env  = var.env
  }
}

resource "aws_route" "public_route" {
  route_table_id         = aws_route_table.public_route_table.id
  destination_cidr_block = "0.0.0.0/0"
  gateway_id             = aws_internet_gateway.igw.id
}

resource "aws_route_table_association" "public_route_association" {
  count          = length(aws_subnet.public_subnet)
  subnet_id      = element(aws_subnet.public_subnet.*.id, count.index)
  route_table_id = aws_route_table.public_route_table.id
}

resource "aws_subnet" "internal_subnet" {
  vpc_id            = aws_vpc.vpc.id
  count             = length(data.aws_availability_zones.current.names)
  cidr_block        = cidrsubnet(var.cidr, 8, 20 + count.index)
  availability_zone = data.aws_availability_zones.current.names[count.index]

  tags = {
    Name                              = "jfp-internal-subnet-${count.index}-${var.env}"
    Env                               = var.env
    Tier                              = "Internal"
    "kubernetes.io/role/internal-elb" = "1"
  }
}

resource "aws_route_table" "internal_route_table" {
  vpc_id = aws_vpc.vpc.id
  tags = {
    Name = "jfp-internal-route-table-${var.env}"
    Env  = var.env
  }
}

resource "aws_route" "internal_route" {
  route_table_id         = aws_route_table.internal_route_table.id
  destination_cidr_block = "0.0.0.0/0"
  nat_gateway_id         = aws_nat_gateway.nat_gateway.id
}

resource "aws_route_table_association" "internal_route_association" {
  count          = length(aws_subnet.internal_subnet)
  subnet_id      = element(aws_subnet.internal_subnet.*.id, count.index)
  route_table_id = aws_route_table.internal_route_table.id
}

resource "aws_nat_gateway" "nat_gateway" {
  allocation_id = aws_eip.eip.id
  subnet_id     = element(aws_subnet.public_subnet.*.id, 0)
  depends_on    = [aws_internet_gateway.igw]
  tags = {
    Name = "jfp-ng-${var.env}"
    Env  = var.env
  }
}

resource "aws_eip" "eip" {
  domain = "vpc"
  tags = {
    Name = "jfp-eip-${var.env}"
    Env  = var.env
  }
}

resource "aws_db_subnet_group" "default" {
  name       = var.env
  subnet_ids = [for subnet in aws_subnet.internal_subnet : subnet.id]
}
