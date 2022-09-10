# Main VPC Internet Gateway
resource "aws_route" "main_internet_gateway" {
  route_table_id         = aws_route_table.main["public"].id
  destination_cidr_block = "0.0.0.0/0"
  gateway_id             = aws_internet_gateway.main.id
}

# Main VPC private NAT gateway egress
resource "aws_route" "main_egress" {
  for_each = {
    private_2a = aws_nat_gateway.prod_public_2a.id
    private_2b = aws_nat_gateway.prod_public_2b.id
    private_2c = aws_nat_gateway.prod_public_2c.id
  }

  route_table_id         = aws_route_table.main[each.key].id
  destination_cidr_block = "0.0.0.0/0"
  nat_gateway_id         = each.value
}

