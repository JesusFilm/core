resource "aws_nat_gateway" "prod_public_2a" {
  allocation_id = aws_eip.prod_public_2a.id
  subnet_id     = aws_subnet.prod_public["2a"].id

  tags = merge(local.tags, {
    Name = "Prod-Public-2a"
  })
  depends_on = [aws_internet_gateway.main]
}

resource "aws_nat_gateway" "prod_public_2b" {
  allocation_id = aws_eip.prod_public_2b.id
  subnet_id     = aws_subnet.prod_public["2b"].id

  tags = merge(local.tags, {
    Name = "Prod-Public-2b"
  })
  depends_on = [aws_internet_gateway.main]
}

resource "aws_nat_gateway" "prod_public_2c" {
  allocation_id = aws_eip.prod_public_2c.id
  subnet_id     = aws_subnet.prod_public["2c"].id

  tags = merge(local.tags, {
    Name = "Prod-Public-2c"
  })
  depends_on = [aws_internet_gateway.main]
}
