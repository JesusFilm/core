resource "aws_subnet" "prod_public" {
  for_each = {
    "2a" = "10.16.0.0/24"
    "2b" = "10.16.1.0/24"
    "2c" = "10.16.38.0/24"
  }

  vpc_id                  = aws_vpc.main.id
  cidr_block              = each.value
  availability_zone       = "us-east-${each.key}"
  map_public_ip_on_launch = true
  tags = merge(local.tags, {
    Name = "Prod-Public-${each.key}"
    type = "public"
  })
}

resource "aws_subnet" "nonprod_public" {
  for_each = {
    "2a" = "10.16.16.0/24"
    "2b" = "10.16.17.0/24"
    "2c" = "10.16.41.0/24"
  }

  vpc_id            = aws_vpc.main.id
  cidr_block        = each.value
  availability_zone = "us-east-${each.key}"
  tags = merge(local.tags, {
    Name = "NonProd-Public-${each.key}"
    type = "public"
    env  = "nonprod"
  })
}

resource "aws_subnet" "nonprod_apps" {
  for_each = {
    "2a" = "10.16.18.0/24"
    "2b" = "10.16.19.0/24"
    "2c" = "10.16.42.0/24"
  }

  vpc_id            = aws_vpc.main.id
  cidr_block        = each.value
  availability_zone = "us-east-${each.key}"
  tags = merge(local.tags, {
    Name = "NonProd-Apps-${each.key}"
    type = "apps"
    env  = "nonprod"
  })
}

resource "aws_subnet" "nonprod_db" {
  for_each = {
    "2a" = "10.16.20.0/24"
    "2b" = "10.16.21.0/24"
    "2c" = "10.16.43.0/24"
  }

  vpc_id            = aws_vpc.main.id
  cidr_block        = each.value
  availability_zone = "us-east-${each.key}"
  tags = merge(local.tags, {
    Name = "NonProd-DB-${each.key}"
    type = "db"
    env  = "nonprod"
  })
}

resource "aws_subnet" "prod_apps" {
  for_each = {
    "2a" = "10.16.2.0/24"
    "2b" = "10.16.3.0/24"
    "2c" = "10.16.39.0/24"
  }

  vpc_id            = aws_vpc.main.id
  cidr_block        = each.value
  availability_zone = "us-east-${each.key}"
  tags = merge(local.tags, {
    Name = "Prod-Apps-${each.key}"
    type = "apps"
  })
}

resource "aws_subnet" "prod_db" {
  for_each = {
    "2a" = "10.16.4.0/24"
    "2b" = "10.16.5.0/24"
    "2c" = "10.16.40.0/24"
  }

  vpc_id            = aws_vpc.main.id
  cidr_block        = each.value
  availability_zone = "us-east-${each.key}"
  tags = merge(local.tags, {
    Name = "Prod-DB-${each.key}"
    type = "db"
  })
}