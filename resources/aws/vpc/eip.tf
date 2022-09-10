resource "aws_eip" "prod_public_2a" {
  tags = merge(local.tags, {
    Name = "Prod Public 2a"
  })
  depends_on = [aws_internet_gateway.main]
}

resource "aws_eip" "prod_public_2b" {
  tags = merge(local.tags, {
    Name = "Prod Public 2b"
  })
  depends_on = [aws_internet_gateway.main]
}

resource "aws_eip" "prod_public_2c" {
  tags = merge(local.tags, {
    Name = "Prod Public 2c"
  })
  depends_on = [aws_internet_gateway.main]
}
