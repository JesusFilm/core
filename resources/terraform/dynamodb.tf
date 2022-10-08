resource "aws_dynamodb_table" "state_lock" {
  name           = "${var.name}-lock"
  hash_key       = "LockID"
  read_capacity  = 20
  write_capacity = 20

  attribute {
    name = "LockID"
    type = "S"
  }
}
