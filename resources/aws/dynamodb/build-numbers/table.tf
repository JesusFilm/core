resource "aws_dynamodb_table" "build_numbers" {
  name         = "ECSBuildNumbers"
  billing_mode = "PAY_PER_REQUEST"
  table_class  = "STANDARD"

  hash_key = "ProjectName"

  attribute {
    name = "ProjectName"
    type = "S"
  }
}
