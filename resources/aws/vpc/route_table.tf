resource "aws_route_table" "main" {
  for_each = {
    public     = "Main Public"
    private_2a = "Main Private 2a"
    private_2b = "Main Private 2b"
    private_2c = "Main Private 2c"
  }

  vpc_id           = aws_vpc.main.id

  tags = merge(local.tags, {
    Name = each.value
  })
}

resource "aws_main_route_table_association" "main" {
  vpc_id         = aws_vpc.main.id
  route_table_id = aws_route_table.main["private_2a"].id
}

resource "aws_route_table_association" "main_public_prod" {
  for_each       = aws_subnet.prod_public
  route_table_id = aws_route_table.main["public"].id
  subnet_id      = each.value.id
}

resource "aws_route_table_association" "main_public_nonprod" {
  for_each       = aws_subnet.nonprod_public
  route_table_id = aws_route_table.main["public"].id
  subnet_id      = each.value.id
}

resource "aws_route_table_association" "main_private_2a" {
  for_each = {
    nonprod_apps = aws_subnet.nonprod_apps["2a"]
    nonprod_db   = aws_subnet.nonprod_db["2a"]
    prod_apps    = aws_subnet.prod_apps["2a"]
    prod_db      = aws_subnet.prod_db["2a"]
  }
  route_table_id = aws_route_table.main["private_2a"].id
  subnet_id      = each.value.id
}

resource "aws_route_table_association" "main_private_2b" {
  for_each = {
    nonprod_apps = aws_subnet.nonprod_apps["2b"]
    nonprod_db   = aws_subnet.nonprod_db["2b"]
    prod_apps    = aws_subnet.prod_apps["2b"]
    prod_db      = aws_subnet.prod_db["2b"]
  }
  route_table_id = aws_route_table.main["private_2b"].id
  subnet_id      = each.value.id
}

resource "aws_route_table_association" "main_private_2c" {
  for_each = {
    nonprod_apps = aws_subnet.nonprod_apps["2c"]
    nonprod_db   = aws_subnet.nonprod_db["2c"]
    prod_apps    = aws_subnet.prod_apps["2c"]
    prod_db      = aws_subnet.prod_db["2c"]
  }
  route_table_id = aws_route_table.main["private_2c"].id
  subnet_id      = each.value.id
}
